import { config as dotEnvConfig } from "dotenv";
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';
import { ConfigurableInterestVaultConfig__factory } from '../../../../typechain';
import hre from "hardhat";
dotEnvConfig({ path: `.env.${process.env.NODE_ENV}` });
import { checkIsVerified, WriteLogs } from '../../../../global/function';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments } = hre;

  const MEOW_MINING_ADDR = await deployments.get("MeowMining");
  const RESERVE_POOL_BPS = '1000';
  const KILL_PRIZE_BPS = '500';
  const INTEREST_MODEL = await deployments.get("TripleSlopeModel");
  const WNATV_ADDR = process.env.wNative;
  const WNATV_RLY_ADDR = await deployments.get("WNativeRelayer");

  const VAULT_CONFIGS = [
    {
      VAULT_NAME: "FTM",
      MIN_DEBT_SIZE: ethers.utils.parseEther('50'),
    },
    {
      VAULT_NAME: "BTC",
      MIN_DEBT_SIZE: ethers.utils.parseUnits('0.003', '8'),
    },
    {
      VAULT_NAME: "USDC",
      MIN_DEBT_SIZE: ethers.utils.parseUnits('100', '6'),
    },
    {
      VAULT_NAME: "fUSDT",
      MIN_DEBT_SIZE: ethers.utils.parseUnits('100', '6'),
    },
    {
      VAULT_NAME: "DAI",
      MIN_DEBT_SIZE: ethers.utils.parseEther('100'),
    },
    {
      VAULT_NAME: "ETH",
      MIN_DEBT_SIZE: ethers.utils.parseEther('0.04'),
    },
    {
      VAULT_NAME: "BOO",
      MIN_DEBT_SIZE: ethers.utils.parseEther('5'),
    }
  ]

  for (let i = 0; i < VAULT_CONFIGS.length; i++) {
    console.log("_____________________________________________________________\n");
    console.log(`Deploying an ${VAULT_CONFIGS[i].VAULT_NAME} configurableInterestVaultConfig contract`);
    const ConfigurableInterestVaultConfig = (await ethers.getContractFactory(
      'ConfigurableInterestVaultConfig',
      (await ethers.getSigners())[0]
    )) as ConfigurableInterestVaultConfig__factory;
    const configurableInterestVaultConfig = await upgrades.deployProxy(
      ConfigurableInterestVaultConfig,
      [VAULT_CONFIGS[i].MIN_DEBT_SIZE, RESERVE_POOL_BPS, KILL_PRIZE_BPS,
      INTEREST_MODEL.address, WNATV_ADDR, WNATV_RLY_ADDR.address, MEOW_MINING_ADDR.address]
    );
    await configurableInterestVaultConfig.deployed();
    const implAddr = await hre.upgrades.erc1967.getImplementationAddress(configurableInterestVaultConfig.address);
    await deployments.save(`ConfigurableInterestVaultConfig_${VAULT_CONFIGS[i].VAULT_NAME}`, { address: configurableInterestVaultConfig.address, implementation: implAddr } as DeploymentSubmission)
    console.log(`Deployed ${VAULT_CONFIGS[i].VAULT_NAME} ConfigurableInterestVaultConfig at ${configurableInterestVaultConfig.address}`);
    if (!(await checkIsVerified(implAddr))) {
      console.log("impl: ", implAddr);
      await hre.run("verify:verify", {
        address: implAddr,
      })
    }
    WriteLogs(`ConfigurableInterestVaultConfig_${VAULT_CONFIGS[i].VAULT_NAME}: `, "Proxy: ", configurableInterestVaultConfig.address, "impl: ", implAddr);
  }

};

export default func;
func(hre);