import { config as dotEnvConfig } from "dotenv";
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';
import { SpookyswapStrategyAddTwoSidesOptimal__factory } from '../../../../typechain';
import hre from "hardhat";
dotEnvConfig({ path: `.env.${process.env.NODE_ENV}` });
import { checkIsVerified, WriteLogs } from '../../../../global/function';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments } = hre;

  const ROUTER = process.env.SpookyRouter;

  const VAULTS = [
    {
      VAULT_NAME: "FTM"
    },
    {
      VAULT_NAME: "BTC"
    },
    {
      VAULT_NAME: "USDC"
    },
    {
      VAULT_NAME: "fUSDT"
    },
    {
      VAULT_NAME: "DAI"
    },
    {
      VAULT_NAME: "ETH"
    },
    {
      VAULT_NAME: "BOO"
    }
  ]

  for (let i = 0; i < VAULTS.length; i++) {
    const vault = await deployments.get(`Vault_${VAULTS[i].VAULT_NAME}`);

    console.log("_____________________________________________________________\n");
    console.log(`Deploying SpookyswapStrategyAddTwosidesOptimal contract for ${VAULTS[i].VAULT_NAME}`);
    const SpookyswapStrategyAddTwoSidesOptimal = (await ethers.getContractFactory(
      'SpookyswapStrategyAddTwoSidesOptimal',
      (await ethers.getSigners())[0]
    )) as SpookyswapStrategyAddTwoSidesOptimal__factory;
    const spookyswapStrategyAddTwoSidesOptimal = await upgrades.deployProxy(
      SpookyswapStrategyAddTwoSidesOptimal, [ROUTER, vault.address]
    );
    await spookyswapStrategyAddTwoSidesOptimal.deployed();
    const implAddr_TwoSides = await hre.upgrades.erc1967.getImplementationAddress(spookyswapStrategyAddTwoSidesOptimal.address);
    await deployments.save(`SpookyswapStrategyAddTwoSidesOptimal_${VAULTS[i].VAULT_NAME}`, { address: spookyswapStrategyAddTwoSidesOptimal.address, implementation: implAddr_TwoSides } as DeploymentSubmission)
    console.log(`Deployed at ${spookyswapStrategyAddTwoSidesOptimal.address}`);
    if (!(await checkIsVerified(implAddr_TwoSides))) {
      console.log("impl: ", implAddr_TwoSides);
      await hre.run("verify:verify", {
        address: implAddr_TwoSides,
      })
    }
    WriteLogs(`SpookyswapStrategyAddTwoSidesOptimal_${VAULTS[i].VAULT_NAME}: `, "Proxy: ", spookyswapStrategyAddTwoSidesOptimal.address, "impl: ", implAddr_TwoSides);

    await new Promise(resolve => setTimeout(resolve, 50000));
  }

};

export default func;
func(hre);