import {
  deployContract,
  executeDeployCalls,
  exportDeployments,
  deployer,
  assertDeployerDefined,
  assertRpcNetworkActive,
  assertDeployerSignable,
} from "./deploy-contract";
import { green } from "./helpers/colorize-log";

// deploy contracts
const deployScript = async (): Promise<void> => {
  // 1. Deploy IdentityRegistry first
  const identityRegistry = await deployContract({
    contract: "IdentityRegistry",
    contractName: "IdentityRegistry",
    constructorArgs: {
      owner: deployer.address,
    },
  });

  // 2. Deploy RewardManager (needs a reward token address - usar STRK en testnet o deploy un ERC20)
  // Por ahora usamos una dirección placeholder - deberás actualizarla con un token real
  const rewardToken = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"; // STRK en Sepolia
  
  const rewardManager = await deployContract({
    contract: "RewardManager",
    contractName: "RewardManager",
    constructorArgs: {
      owner: deployer.address,
      reward_token: rewardToken,
    },
  });

  
};

const main = async (): Promise<void> => {
  try {
    assertDeployerDefined();

    await Promise.all([assertRpcNetworkActive(), assertDeployerSignable()]);

    await deployScript();
    await executeDeployCalls();
    exportDeployments();

    console.log(green("All Setup Done!"));
  } catch (err) {
    console.log(err);
    process.exit(1); //exit with error so that non subsequent scripts are run
  }
};

main();