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
}

#[starknet::contract]
pub mod IdentityRegistry {
    use super::IIdentityRegistry;
    use openzeppelin_access::ownable::OwnableComponent;
    use starknet::storage::{
        Map,
        StorageMapReadAccess,
        StorageMapWriteAccess,
    };
    use starknet::{ContractAddress, get_caller_address};

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
    }
}
