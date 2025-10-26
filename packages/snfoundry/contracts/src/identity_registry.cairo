// Contrato para gestionar los roles y metadata del sistema

use starknet::ContractAddress;

#[starknet::interface]
pub trait IIdentityRegistry<TContractState> {
    // Registro inicial autogestionado
    // role se representa como felt252 (valor numérico)
    fn register_user(ref self: TContractState, role: felt252, metadata: felt252);

    // Obtener y actualizar metadata de una cuenta
    fn set_metadata(ref self: TContractState, metadata: felt252);
    fn admin_set_metadata(ref self: TContractState, account: ContractAddress, metadata: felt252);
    fn get_metadata(self: @TContractState, account: ContractAddress) -> felt252;

    // Revocar rol de una cuenta (solo owner)
    fn revoke_role(ref self: TContractState, account: ContractAddress);

    // Verificar si una cuenta tiene un rol
    fn has_role(self: @TContractState, account: ContractAddress, role: felt252) -> bool;
    fn get_role(self: @TContractState, account: ContractAddress) -> felt252;

    // Obtener owner del contrato
    fn get_owner(self: @TContractState) -> ContractAddress;
    // Product / user helper methods (wrappers to ProductRegistry)
    fn set_product_registry(ref self: TContractState, product_registry: ContractAddress);
    fn get_products_of_user(self: @TContractState, user: ContractAddress) -> (felt252,);
    fn get_product_of_user_by_index(self: @TContractState, user: ContractAddress, index: felt252) -> (felt252,);
    fn get_product_owners(self: @TContractState, product_id: felt252) -> (felt252,);
    fn get_owner_history_entry(self: @TContractState, product_id: felt252, index: felt252) -> (ContractAddress,);
}

#[starknet::contract]
pub mod IdentityRegistry {
    use super::IIdentityRegistry;
    use openzeppelin_access::ownable::OwnableComponent;
    use starknet::storage::{
        Map,
        StorageMapReadAccess,
        StorageMapWriteAccess,
        StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_caller_address};
    use crate::product_registry::IProductRegistryDispatcher;
    use crate::product_registry::IProductRegistryDispatcherTrait;

    // COMPONENTE ownable (admin global)
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    // ENUM DE ROLES
    // Roles representados como valores numéricos (felt252)
    const ROLE_UNASSIGNED: felt252 = 0;
    const ROLE_MANUFACTURER: felt252 = 1;
    const ROLE_SELLER: felt252 = 2;
    const ROLE_BUYER: felt252 = 3;

    // EVENTOS
    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        UserRegistered: UserRegistered,
        RoleRevoked: RoleRevoked,
        MetadataUpdated: MetadataUpdated,
    }

    #[derive(Drop, starknet::Event)]
    pub struct UserRegistered {
        #[key]
        account: ContractAddress,
        role: felt252,
        metadata: felt252,
    }

    #[derive(Drop, starknet::Event)]
    pub struct RoleRevoked {
        #[key]
        account: ContractAddress,
        revoked_by: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct MetadataUpdated {
        #[key]
        account: ContractAddress,
        metadata: felt252,
        updated_by: ContractAddress,
    }

    // STORAGE
    #[storage]
    struct Storage {
        // Guardamos roles como felt252 para evitar problemas de almacenamiento de enums
        account_role: Map<ContractAddress, felt252>,
        account_metadata: Map<ContractAddress, felt252>,
        // optional pointer to ProductRegistry to allow user-centric queries
        product_registry: ContractAddress,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    // CONSTRUCTOR
    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.ownable.initializer(owner);
    }

    // IMPLEMENTACIÓN PRINCIPAL
    #[abi(embed_v0)]
    impl IdentityRegistryImpl of IIdentityRegistry<ContractState> {
        // REGISTRO INICIAL
        fn register_user(ref self: ContractState, role: felt252, metadata: felt252) {
            let caller = get_caller_address();

                let existing = self.account_role.read(caller);
                if existing != ROLE_UNASSIGNED {
                    panic!("Usuario ya registrado");
                }

                self.account_role.write(caller, role);
                self.account_metadata.write(caller, metadata);

                self.emit(UserRegistered {
                    account: caller,
                    role,
                    metadata,
                });
        }

        // ACTUALIZAR metadata propia
        fn set_metadata(ref self: ContractState, metadata: felt252) {
            let caller = get_caller_address();
            let existing = self.account_role.read(caller);
            if existing == ROLE_UNASSIGNED {
                panic!("Usuario no registrado");
            }

            self.account_metadata.write(caller, metadata);
            self.emit(MetadataUpdated {
                account: caller,
                metadata,
                updated_by: caller,
            });
        }

        // ACTUALIZAR metadata ajena (solo owner)
        fn admin_set_metadata(ref self: ContractState, account: ContractAddress, metadata: felt252) {
            let caller = get_caller_address();
            let _owner = self.ownable.owner();

            // Asegurarse que el caller es owner
            self.ownable.assert_only_owner();

            self.account_metadata.write(account, metadata);
            self.emit(MetadataUpdated {
                account,
                metadata,
                updated_by: caller,
            });
        }

        // OBTENER metadata pública
        fn get_metadata(self: @ContractState, account: ContractAddress) -> felt252 {
            let v = self.account_metadata.read(account);
            v
        }

        // REVOCAR rol (solo owner)
        fn revoke_role(ref self: ContractState, account: ContractAddress) {
            let caller = get_caller_address();
            let _owner = self.ownable.owner();

            // Asegurarse que el caller es owner
            self.ownable.assert_only_owner();

            self.account_role.write(account, ROLE_UNASSIGNED);
            self.emit(RoleRevoked {
                account,
                revoked_by: caller,
            });
        }

        // VERIFICAR rol
        fn has_role(self: @ContractState, account: ContractAddress, role: felt252) -> bool {
            let r = self.account_role.read(account);
            r == role
        }

        // OBTENER rol
        fn get_role(self: @ContractState, account: ContractAddress) -> felt252 {
            let r = self.account_role.read(account);
            r
        }

        // OBTENER owner
        fn get_owner(self: @ContractState) -> ContractAddress {
            self.ownable.owner()
        }

        // Implementaciones
        // set the ProductRegistry address (only owner)
        fn set_product_registry(ref self: ContractState, product_registry: ContractAddress) {
            self.ownable.assert_only_owner();
            let zero_address: ContractAddress = 0.try_into().unwrap();
            if product_registry == zero_address {
                panic!("Product registry address cannot be zero");
            }
            self.product_registry.write(product_registry);
        }

        // Wrapper: count of products related to a user (current owner or appeared in owner-history)
        fn get_products_of_user(self: @ContractState, user: ContractAddress) -> (felt252,) {
            let pr = self.product_registry.read();
            let zero_address: ContractAddress = 0.try_into().unwrap();
            if pr == zero_address {
                // no product registry configured
                return (0,);
            }
            let dispatcher = IProductRegistryDispatcher { contract_address: pr };
            let (count,) = dispatcher.get_products_of_user(user);
            return (count,);
        }

        // Wrapper: get product id at index for a user (scans inside ProductRegistry)
        fn get_product_of_user_by_index(self: @ContractState, user: ContractAddress, index: felt252) -> (felt252,) {
            let pr = self.product_registry.read();
            let zero_address: ContractAddress = 0.try_into().unwrap();
            if pr == zero_address {
                return (0,);
            }
            let dispatcher = IProductRegistryDispatcher { contract_address: pr };
            let (pid,) = dispatcher.get_product_of_user_by_index(user, index);
            return (pid,);
        }

        // Wrapper: number of owners recorded for a product
        fn get_product_owners(self: @ContractState, product_id: felt252) -> (felt252,) {
            let pr = self.product_registry.read();
            let zero_address: ContractAddress = 0.try_into().unwrap();
            if pr == zero_address {
                return (0,);
            }
            let dispatcher = IProductRegistryDispatcher { contract_address: pr };
            let (len,) = dispatcher.get_product_owners(product_id);
            return (len,);
        }

        // Wrapper: owner at history index for a product
        fn get_owner_history_entry(self: @ContractState, product_id: felt252, index: felt252) -> (ContractAddress,) {
            let pr = self.product_registry.read();
            let zero_address: ContractAddress = 0.try_into().unwrap();
            if pr == zero_address {
                let zero: ContractAddress = 0.try_into().unwrap();
                return (zero,);
            }
            let dispatcher = IProductRegistryDispatcher { contract_address: pr };
            let (owner,) = dispatcher.get_owner_history_entry(product_id, index);
            return (owner,);
        }
    }
}
