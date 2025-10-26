// Contrato para la emisión y gestion de incentivos y recompensas

use starknet::ContractAddress;
use core::integer::u256;
use starknet::storage::{};

#[starknet::interface]
pub trait IRewardManager<TContractState> {
    fn set_registry_address(ref self: TContractState, registry_address: ContractAddress);
    fn set_reward_amount(ref self: TContractState, amount: u256);
    fn claim_reward(ref self: TContractState, product_id: felt252, user: ContractAddress);
    fn get_user_rewards(self: @TContractState, user: ContractAddress) -> (u256,);
}

#[starknet::contract]
pub mod RewardManager {
    use super::IRewardManager;
    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess, StoragePointerWriteAccess};

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    #[abi(embed_v0)] impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[event] #[derive(Drop, starknet::Event)]
    pub enum Event { #[flat] OwnableEvent: OwnableComponent::Event, RewardClaimed: RewardClaimed, RewardConfigured: RewardConfigured }
    #[derive(Drop, starknet::Event)] pub struct RewardClaimed { #[key] user: ContractAddress, #[key] product_id: felt252, reward_amount: u256 }
    #[derive(Drop, starknet::Event)] pub struct RewardConfigured { amount: u256 }

    #[storage]
    struct Storage {
        registry_address: ContractAddress,
        reward_token: ContractAddress,
        reward_amount: u256,
        user_rewards: Map<ContractAddress, u256>,
        #[substorage(v0)] ownable: OwnableComponent::Storage,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress, reward_token: ContractAddress) {
        self.ownable.initializer(owner);
        self.reward_token.write(reward_token);
        self.reward_amount.write(10_u256);
    }

    #[abi(embed_v0)]
    impl RewardManagerImpl of IRewardManager<ContractState> {
        fn set_registry_address(ref self: ContractState, registry_address: ContractAddress) {
            self.ownable.assert_only_owner();
            self.registry_address.write(registry_address);
        }

        fn set_reward_amount(ref self: ContractState, amount: u256) {
            self.ownable.assert_only_owner();
            self.reward_amount.write(amount);
            self.emit(RewardConfigured { amount });
        }

            // Reclamar recompensa para un usuario (puede llamar el owner o el registry configurado)
            fn claim_reward(ref self: ContractState, product_id: felt252, user: ContractAddress) {
                // Allow only the contract owner or the configured registry contract to call this.
                let caller = get_caller_address();
                let owner_addr = self.ownable.owner();
                let registry_addr = self.registry_address.read();
                if !(caller == owner_addr) {
                    if !(caller == registry_addr) {
                        panic!("Only owner or registry can call claim_reward");
                    }
                }

                let reward = self.reward_amount.read();

                // Actualizar registro interno de recompensas
                let current_total = self.user_rewards.read(user);
                let new_total = current_total + reward;
                self.user_rewards.write(user, new_total);

                // Transferir tokens
                let token_addr = self.reward_token.read();
                let dispatcher = IERC20Dispatcher { contract_address: token_addr };
                dispatcher.transfer(user, reward);

                self.emit(RewardClaimed { user, product_id, reward_amount: reward });
            }

        fn get_user_rewards(self: @ContractState, user: ContractAddress) -> (u256,) {
            let total = self.user_rewards.read(user);
            return (total,);
        }
    }
}