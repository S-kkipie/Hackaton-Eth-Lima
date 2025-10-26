use starknet::ContractAddress;
use starknet::get_caller_address;
use starknet::get_block_timestamp;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};

// --- Interfaces externas (simplified returns as unnamed tuples) ---
#[starknet::interface]  
pub trait IReturnAndValidationManager<TContractState> {
    fn create_return(ref self: TContractState, product_id: felt252, target_status: felt252);
    fn validate_return(ref self: TContractState, return_id: felt252, is_valid: bool, evidence_ipfs: felt252);
    fn cancel_return(ref self: TContractState, return_id: felt252);

    fn add_validator(ref self: TContractState, validator: ContractAddress);
    fn remove_validator(ref self: TContractState, validator: ContractAddress);

    // Set the ProductRegistry address so this contract can notify it on approvals
    fn set_product_registry(ref self: TContractState, product_registry: ContractAddress);

    // return: (product_id, user, status, validator, evidence_ipfs, timestamp, target_status)
    fn get_return(self: @TContractState, return_id: felt252) -> (felt252, ContractAddress, felt252, ContractAddress, felt252, u64, felt252);
}


#[starknet::contract]
mod ReturnAndValidationManager {
    use super::*;

    use openzeppelin_access::ownable::OwnableComponent;
    use crate::product_registry::IProductRegistryDispatcher;
    use crate::product_registry::IProductRegistryDispatcherTrait;

    // --- Almacenamiento del contrato (store primitive fields separately) ---
    use starknet::storage::StoragePointerReadAccess;
    use starknet::storage::StoragePointerWriteAccess;

    // status constants
    const RETURN_STATUS_PENDING: felt252 = 1;
    const RETURN_STATUS_APPROVED: felt252 = 2;
    const RETURN_STATUS_REJECTED: felt252 = 3;
    const RETURN_STATUS_CANCELLED: felt252 = 4;

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    #[abi(embed_v0)] impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    // storage maps per-field to avoid complex struct storage issues
    #[storage]
    struct Storage {
        returns_product: Map<felt252, felt252>,
        returns_user: Map<felt252, ContractAddress>,
        returns_status: Map<felt252, felt252>,
        returns_target: Map<felt252, felt252>,
        returns_validator: Map<felt252, ContractAddress>,
        returns_evidence: Map<felt252, felt252>,
        returns_timestamp: Map<felt252, u64>,
        validators_whitelist: Map<ContractAddress, bool>,
        next_return_id: felt252,
        product_registry: ContractAddress,
        #[substorage(v0)] ownable: OwnableComponent::Storage,
    }

    // --- Eventos ---
    #[derive(Drop, starknet::Event)]
    pub struct ReturnCreated { #[key] return_id: felt252, user: ContractAddress, product_id: felt252 }

    #[derive(Drop, starknet::Event)]
    pub struct ReturnValidated { #[key] return_id: felt252, validator: ContractAddress, is_valid: bool }

    #[derive(Drop, starknet::Event)]
    pub struct ReturnCancelled { #[key] return_id: felt252, user: ContractAddress }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        ReturnCreated: ReturnCreated,
        ReturnValidated: ReturnValidated,
        ReturnCancelled: ReturnCancelled,
    }

    //Implementación de la interfaz
    #[abi(embed_v0)]
    impl ReturnAndValidationManagerImpl of IReturnAndValidationManager<ContractState> {
        // --- Crear solicitud de devolución ---
        fn create_return(ref self: ContractState, product_id: felt252, target_status: felt252) {
            let caller = get_caller_address();

            let id = self.next_return_id.read();
            self.next_return_id.write(id + 1);

            let ts = get_block_timestamp();

            self.returns_product.write(id, product_id);
            self.returns_user.write(id, caller);
            self.returns_status.write(id, RETURN_STATUS_PENDING);
            self.returns_evidence.write(id, 0);
            self.returns_timestamp.write(id, ts);
            self.returns_target.write(id, target_status);

            self.emit(ReturnCreated { return_id: id, user: caller, product_id });
        }

        // --- Validar devolución ---
        fn validate_return(
            ref self: ContractState,
            return_id: felt252,
            is_valid: bool,
            evidence_ipfs: felt252
        ) {
            let validator = get_caller_address();
            let allowed = self.validators_whitelist.read(validator);
            if !allowed {
                panic!("Validator not authorized");
            }

            // update primitive fields
            let status_val = if is_valid { RETURN_STATUS_APPROVED } else { RETURN_STATUS_REJECTED };
            self.returns_status.write(return_id, status_val);
            self.returns_validator.write(return_id, validator);
            self.returns_evidence.write(return_id, evidence_ipfs);
            self.returns_timestamp.write(return_id, get_block_timestamp());

            // If approved, notify ProductRegistry to apply the validated return
            if is_valid {
                let pr_addr = self.product_registry.read();
                let dispatcher = IProductRegistryDispatcher { contract_address: pr_addr };
                dispatcher.apply_validated_return(return_id);
            }

            self.emit(ReturnValidated { return_id, validator, is_valid });
        }

        // --- Cancelar devolución ---
        fn cancel_return(ref self: ContractState, return_id: felt252) {
            let caller = get_caller_address();
            let owner = self.returns_user.read(return_id);
            assert(owner == caller, 'Only owner can cancel');

            self.returns_status.write(return_id, RETURN_STATUS_CANCELLED);
            self.emit(ReturnCancelled { return_id, user: caller });
        }

        // --- Añadir validador ---
        fn add_validator(ref self: ContractState, validator: ContractAddress) {
            // only owner can add validators
            self.ownable.assert_only_owner();
            self.validators_whitelist.write(validator, true);
        }

        // --- Eliminar validador ---
        fn remove_validator(ref self: ContractState, validator: ContractAddress) {
            self.ownable.assert_only_owner();
            self.validators_whitelist.write(validator, false);
        }

        // owner sets ProductRegistry address so this contract can notify it
        fn set_product_registry(ref self: ContractState, product_registry: ContractAddress) {
            self.ownable.assert_only_owner();
            self.product_registry.write(product_registry);
        }

        // --- Consultar devolución ---
        fn get_return(self: @ContractState, return_id: felt252) -> (felt252, ContractAddress, felt252, ContractAddress, felt252, u64, felt252) {
            let product_id = self.returns_product.read(return_id);
            let user = self.returns_user.read(return_id);
            let status = self.returns_status.read(return_id);
            let validator = self.returns_validator.read(return_id);
            let evidence = self.returns_evidence.read(return_id);
            let timestamp = self.returns_timestamp.read(return_id);
            let target = self.returns_target.read(return_id);
            return (product_id, user, status, validator, evidence, timestamp, target);
        }
    }
}