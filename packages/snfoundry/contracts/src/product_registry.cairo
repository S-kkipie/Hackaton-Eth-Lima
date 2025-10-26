// Contrato: Registro de productos MIPYMES con trazabilidad en blockchain
use starknet::prelude::*;
use starknet::ContractAddress;

// ProductStatus
const PRODUCT_STATUS_CREATED: felt252 = 0;
const PRODUCT_STATUS_IN_STORE: felt252 = 1;
const PRODUCT_STATUS_SOLD: felt252 = 2;
const PRODUCT_STATUS_RETURNED_TO_STORE: felt252 = 3;
const PRODUCT_STATUS_RETURNED_TO_FACTORY: felt252 = 4;
const PRODUCT_STATUS_RECYCLED: felt252 = 5;


#[starknet::interface]
pub trait IProductRegistry<TContractState> {
    fn register_product(ref self: TContractState, product_id: felt252, description: felt252);
    fn move_to_instore(ref self: TContractState, product_id: felt252);
    fn sell_to_user(ref self: TContractState, product_id: felt252, buyer: ContractAddress);
    fn transfer_product(ref self: TContractState, product_id: felt252, new_owner: ContractAddress);
    // This is called by ReturnValidationManager when a return is approved
    fn apply_validated_return(ref self: TContractState, return_id: felt252);
    // Manufacturer triggers final recycling which issues reward
    fn factory_recycle(ref self: TContractState, product_id: felt252);
    fn set_return_manager(ref self: TContractState, return_manager_addr: ContractAddress);
    fn set_identity_registry(ref self: TContractState, identity_registry_addr: ContractAddress);
    fn set_reward_manager(ref self: TContractState, reward_manager_addr: ContractAddress);
    fn get_product_info(self: @TContractState, product_id: felt252) -> (felt252, ContractAddress, felt252, felt252, u64);
    fn get_product_history(self: @TContractState, product_id: felt252) -> (felt252,);
}

#[starknet::contract]
pub mod ProductRegistry {
    use super::IProductRegistry;
    use crate::identity_registry::IIdentityRegistryDispatcher;
    use crate::identity_registry::IIdentityRegistryDispatcherTrait;
    use crate::reward_manager::IRewardManagerDispatcher;
    use crate::reward_manager::IRewardManagerDispatcherTrait;
    use crate::return_validation_manager::IReturnAndValidationManagerDispatcher;
    use crate::return_validation_manager::IReturnAndValidationManagerDispatcherTrait;
    use super::PRODUCT_STATUS_CREATED;
    use super::PRODUCT_STATUS_IN_STORE;
    use super::PRODUCT_STATUS_SOLD;
    use super::PRODUCT_STATUS_RETURNED_TO_STORE;
    use super::PRODUCT_STATUS_RETURNED_TO_FACTORY;
    use super::PRODUCT_STATUS_RECYCLED;

    use openzeppelin_access::ownable::OwnableComponent;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerWriteAccess, StoragePointerReadAccess};
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};

    // Product registration and updates are restricted to the contract owner.
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    // EVENTOS
    #[event]
    #[derive(Drop, starknet::Event)]    
    pub enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        ProductRegistered: ProductRegistered,
        ProductStatusUpdated: ProductStatusUpdated,
        ProductTransferred: ProductTransferred,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ProductRegistered {
        #[key]
        product_id: felt252,
        owner: ContractAddress,
        description: felt252,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ProductStatusUpdated {
        #[key]
        product_id: felt252,
        new_status: felt252,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ProductTransferred {
        #[key]
        product_id: felt252,
        new_owner: ContractAddress,
        timestamp: u64,
    }

    // STORAGE
    #[storage]
    struct Storage {
        // Store product fields separately to avoid storing complex structs in storage
        products_owner: Map<felt252, ContractAddress>,
        products_description: Map<felt252, felt252>,
        products_status: Map<felt252, felt252>,
        // Keep only history length to avoid Array storage/Serde issues
        product_history_len: Map<felt252, felt252>,
        // track who initiated the return (buyer) to reward later
        returns_initiator: Map<felt252, ContractAddress>,

        #[substorage(v0)] ownable: OwnableComponent::Storage,
        identity_registry: ContractAddress, // address of IdentityRegistry
        reward_manager: ContractAddress,    // address of RewardManager (incentives)
        return_manager: ContractAddress,    // address of ReturnValidationManager
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress, identity_registry_addr: ContractAddress, reward_manager_addr: ContractAddress) {
        // Validate addresses are not zero
        let zero_address: ContractAddress = 0.try_into().unwrap();
        if owner == zero_address {
            panic!("Owner address cannot be zero");
        }
        if identity_registry_addr == zero_address {
            panic!("Identity registry address cannot be zero");
        }
        if reward_manager_addr == zero_address {
            panic!("Reward manager address cannot be zero");
        }
        
        self.ownable.initializer(owner);
        self.identity_registry.write(identity_registry_addr);
        self.reward_manager.write(reward_manager_addr);
    }

    #[abi(embed_v0)]
    impl ProductRegistryImpl of IProductRegistry<ContractState> {
        fn register_product(ref self: ContractState, product_id: felt252, description: felt252) {
            let caller = get_caller_address();
            // only Manufacturer (according to IdentityRegistry) can register
            let id_addr = self.identity_registry.read();
            let id_dispatcher = IIdentityRegistryDispatcher { contract_address: id_addr };
            let role = id_dispatcher.get_role(caller);
            if !(role == 1) {
                panic!("Only Manufacturer can register products");
            }

            // Prevent double registration
            let exists = self.product_history_len.read(product_id);
            if exists != 0 {
                panic!("Product already registered");
            }

            let _timestamp = get_block_timestamp();

            self.products_owner.write(product_id, caller);
            self.products_description.write(product_id, description);
            self.products_status.write(product_id, PRODUCT_STATUS_CREATED);
            // initialize history length
            self.product_history_len.write(product_id, 1);

            self.emit(ProductRegistered { product_id, owner: caller, description });
        }

        // move product from Created -> InStore (only Manufacturer)
        fn move_to_instore(ref self: ContractState, product_id: felt252) {
            let caller = get_caller_address();
            
            // Verify product exists
            let exists = self.product_history_len.read(product_id);
            if exists == 0 {
                panic!("Product not registered");
            }
            
            let owner = self.products_owner.read(product_id);
            // only Manufacturer (role 1) and product owner can move to in-store
            let id_addr = self.identity_registry.read();
            let id_dispatcher = IIdentityRegistryDispatcher { contract_address: id_addr };
            let role = id_dispatcher.get_role(caller);
            if !(role == 1 && caller == owner) {
                panic!("Only Manufacturer owner can move to in-store");
            }
            let current = self.products_status.read(product_id);
            if !(current == PRODUCT_STATUS_CREATED) {
                panic!("Invalid state transition: must be Created");
            }
            self.products_status.write(product_id, PRODUCT_STATUS_IN_STORE);
            let timestamp = get_block_timestamp();
            let current_len = self.product_history_len.read(product_id);
            self.product_history_len.write(product_id, current_len + 1);
            self.emit(ProductStatusUpdated { product_id, new_status: PRODUCT_STATUS_IN_STORE, timestamp });
        }

        // Seller sells to a buyer -> moves InStore -> Sold
        fn sell_to_user(ref self: ContractState, product_id: felt252, buyer: ContractAddress) {
            let caller = get_caller_address();
            
            // Validate buyer address is not zero
            let zero_address: ContractAddress = 0.try_into().unwrap();
            if buyer == zero_address {
                panic!("Buyer address cannot be zero");
            }
            
            // Verify product exists
            let exists = self.product_history_len.read(product_id);
            if exists == 0 {
                panic!("Product not registered");
            }
            
            // ensure caller is a Seller
            let id_addr = self.identity_registry.read();
            let id_dispatcher = IIdentityRegistryDispatcher { contract_address: id_addr };
            let role = id_dispatcher.get_role(caller);
            if !(role == 2) {
                panic!("Only Seller can sell products");
            }

            let current = self.products_status.read(product_id);
            if !(current == PRODUCT_STATUS_IN_STORE) {
                panic!("Invalid state transition: must be InStore");
            }

            self.products_owner.write(product_id, buyer);
            self.products_status.write(product_id, PRODUCT_STATUS_SOLD);
            let timestamp = get_block_timestamp();
            let current_len = self.product_history_len.read(product_id);
            self.product_history_len.write(product_id, current_len + 1);
            self.emit(ProductTransferred { product_id, new_owner: buyer, timestamp });
            self.emit(ProductStatusUpdated { product_id, new_status: PRODUCT_STATUS_SOLD, timestamp });
        }

        // Called by ReturnValidationManager when a return request has been approved
        fn apply_validated_return(ref self: ContractState, return_id: felt252) {
            // Only ReturnValidationManager should call this; verify caller
            let caller = get_caller_address();
            let rm_addr = self.return_manager.read();
            
            // Validate return_manager is configured (not zero address)
            let zero_address: ContractAddress = 0.try_into().unwrap();
            if rm_addr == zero_address {
                panic!("Return manager not configured");
            }
            
            if !(caller == rm_addr) {
                panic!("Only ReturnValidationManager may apply validated returns");
            }

            // fetch return details
            let ret_mgr = IReturnAndValidationManagerDispatcher { contract_address: rm_addr };
            let (product_id, user, status, _, _, _, target) = ret_mgr.get_return(return_id);

            // Verify product exists
            let exists = self.product_history_len.read(product_id);
            if exists == 0 {
                panic!("Product not registered");
            }

            // expected approved status is RETURN_STATUS_APPROVED (2)
            if !(status == 2) {
                panic!("Return is not approved");
            }

            let current = self.products_status.read(product_id);
            if target == PRODUCT_STATUS_RETURNED_TO_STORE {
                if !(current == PRODUCT_STATUS_SOLD) {
                    panic!("Invalid state transition for return to store");
                }
                
                // Validate user is not zero address before storing
                let zero_address: ContractAddress = 0.try_into().unwrap();
                if user == zero_address {
                    panic!("Return initiator cannot be zero address");
                }
                
                self.products_status.write(product_id, PRODUCT_STATUS_RETURNED_TO_STORE);
                self.returns_initiator.write(product_id, user);
                let timestamp = get_block_timestamp();
                let current_len = self.product_history_len.read(product_id);
                self.product_history_len.write(product_id, current_len + 1);
                self.emit(ProductStatusUpdated { product_id, new_status: PRODUCT_STATUS_RETURNED_TO_STORE, timestamp });
                return;
            }

            if target == PRODUCT_STATUS_RETURNED_TO_FACTORY {
                if !(current == PRODUCT_STATUS_RETURNED_TO_STORE) {
                    panic!("Invalid state transition for return to factory");
                }
                self.products_status.write(product_id, PRODUCT_STATUS_RETURNED_TO_FACTORY);
                let timestamp = get_block_timestamp();
                let current_len = self.product_history_len.read(product_id);
                self.product_history_len.write(product_id, current_len + 1);
                self.emit(ProductStatusUpdated { product_id, new_status: PRODUCT_STATUS_RETURNED_TO_FACTORY, timestamp });
                return;
            }

            panic!("Unknown return target");
        }

        // Manufacturer finalizes recycling -> Recycled (and reward issued)
        fn factory_recycle(ref self: ContractState, product_id: felt252) {
            let caller = get_caller_address();
            
            // Verify product exists
            let exists = self.product_history_len.read(product_id);
            if exists == 0 {
                panic!("Product not registered");
            }
            
            // only Manufacturer role can call
            let id_addr = self.identity_registry.read();
            let id_dispatcher = IIdentityRegistryDispatcher { contract_address: id_addr };
            let role = id_dispatcher.get_role(caller);
            if !(role == 1) {
                panic!("Only Manufacturer can perform recycling");
            }

            let current = self.products_status.read(product_id);
            if !(current == PRODUCT_STATUS_RETURNED_TO_FACTORY) {
                panic!("Invalid state transition: must be ReturnedToFactory");
            }

            self.products_status.write(product_id, PRODUCT_STATUS_RECYCLED);
            let timestamp = get_block_timestamp();
            let current_len = self.product_history_len.read(product_id);
            self.product_history_len.write(product_id, current_len + 1);

            // Emit event BEFORE external call (CEI pattern)
            self.emit(ProductStatusUpdated { product_id, new_status: PRODUCT_STATUS_RECYCLED, timestamp });

            // issue reward to the user who initiated the return
            let user = self.returns_initiator.read(product_id);
            
            // Validate returns_initiator is set (not zero address)
            let zero_address: ContractAddress = 0.try_into().unwrap();
            if user != zero_address {
                let reward_addr = self.reward_manager.read();
                let dispatcher = IRewardManagerDispatcher { contract_address: reward_addr };
                dispatcher.claim_reward(product_id, user);
            }
        }

        // owner can set the ReturnValidationManager address
        fn set_return_manager(ref self: ContractState, return_manager_addr: ContractAddress) {
            self.ownable.assert_only_owner();
            
            // Validate address is not zero
            let zero_address: ContractAddress = 0.try_into().unwrap();
            if return_manager_addr == zero_address {
                panic!("Return manager address cannot be zero");
            }
            
            self.return_manager.write(return_manager_addr);
        }

        // owner can update the IdentityRegistry address
        fn set_identity_registry(ref self: ContractState, identity_registry_addr: ContractAddress) {
            self.ownable.assert_only_owner();
            
            // Validate address is not zero
            let zero_address: ContractAddress = 0.try_into().unwrap();
            if identity_registry_addr == zero_address {
                panic!("Identity registry address cannot be zero");
            }
            
            self.identity_registry.write(identity_registry_addr);
        }

        // owner can update the RewardManager address
        fn set_reward_manager(ref self: ContractState, reward_manager_addr: ContractAddress) {
            self.ownable.assert_only_owner();
            
            // Validate address is not zero
            let zero_address: ContractAddress = 0.try_into().unwrap();
            if reward_manager_addr == zero_address {
                panic!("Reward manager address cannot be zero");
            }
            
            self.reward_manager.write(reward_manager_addr);
        }

        fn transfer_product(ref self: ContractState, product_id: felt252, new_owner: ContractAddress) {
            let caller = get_caller_address();
            
            // Validate new_owner address is not zero
            let zero_address: ContractAddress = 0.try_into().unwrap();
            if new_owner == zero_address {
                panic!("New owner address cannot be zero");
            }
            
            // Verify product exists FIRST (before checking ownership)
            let exists = self.product_history_len.read(product_id);
            if exists == 0 {
                panic!("Product not registered");
            }
            
            let current_owner = self.products_owner.read(product_id);
            
            // Only current owner can transfer the product
            if !(caller == current_owner) {
                panic!("Only current owner can transfer product");
            }

            // Cannot transfer products in return/recycling states
            let current = self.products_status.read(product_id);
            if current == PRODUCT_STATUS_RETURNED_TO_STORE 
                || current == PRODUCT_STATUS_RETURNED_TO_FACTORY 
                || current == PRODUCT_STATUS_RECYCLED {
                panic!("Cannot transfer product in return or recycled state");
            }

            let timestamp = get_block_timestamp();

            self.products_owner.write(product_id, new_owner);
            self.products_status.write(product_id, PRODUCT_STATUS_SOLD);

            // increment history length
            let current_len = self.product_history_len.read(product_id);
            let new_len = current_len + 1;
            self.product_history_len.write(product_id, new_len);

            self.emit(ProductTransferred { product_id, new_owner, timestamp });
        }
        fn get_product_info(self: @ContractState, product_id: felt252) -> (felt252, ContractAddress, felt252, felt252, u64) {
            let owner = self.products_owner.read(product_id);
            let description = self.products_description.read(product_id);
            let status = self.products_status.read(product_id);
            // We don't persist timestamps per-product to avoid storage packing issues.
            // Return 0 as placeholder (replace with proper timestamp storage if needed).
            let timestamp: u64 = 0_u64;
            return (product_id, owner, description, status, timestamp);
        }
        fn get_product_history(self: @ContractState, product_id: felt252) -> (felt252,) {
            let len = self.product_history_len.read(product_id);
            return (len,);
        }

        //Implementacion
        fn get_products_by_user(self: @ContractState, user: ContractAddress) -> (felt252*) {
            let count = self.product_count.read();
            let mut results: felt252* = array_new();

            let mut i = 0;
            while i < count {
                let product_id = self.products_by_index.read(i);
                let owner = self.products_owner.read(product_id);
                if owner == user {
                    array_append(&mut results, product_id);
                }
                i += 1;
            }

            return results;
        }

        fn get_products_with_owners(self: @ContractState) -> ((felt252, ContractAddress)*) {
            let count = self.product_count.read();
            let mut all_products: (felt252, ContractAddress)* = array_new();

            let mut i = 0;
            while i < count {
                let product_id = self.products_by_index.read(i);
                let owner = self.products_owner.read(product_id);
                array_append(&mut all_products, (product_id, owner));
                i += 1;
            }

            return all_products;
        }

        fn get_product_lifecycle(self: @ContractState, product_id: felt252) -> ((felt252, u64)*) {
            let len = self.product_history_len.read(product_id);
            let mut lifecycle: (felt252, u64)* = array_new();
            let mut i = 0;

            while i < len {
                let status = self.product_history_status.read(product_id * HISTORY_KEY_BASE + i);
                let ts = self.product_history_ts.read(product_id * HISTORY_KEY_BASE + i);
                array_append(&mut lifecycle, (status, ts));
                i += 1;
            }

            return lifecycle;
        }
        
        // Quien creo el producto
        fn get_creator(self: @ContractState, product_id: felt252) -> (ContractAddress,) {
            let key = product_id * HISTORY_KEY_BASE + 0;
            let creator = self.product_history_owner.read(key);
            return (creator,);
        }
    }
}
