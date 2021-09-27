import { config as dotEnvConfig } from "dotenv";
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';
import { SpookyswapStrategyAddBaseTokenOnly__factory, SpookyswapStrategyLiquidate__factory, SpookyswapStrategyWithdrawMinimizeTrading__factory } from '../../../../typechain';
import hre from "hardhat";
dotEnvConfig({ path: `.env.${process.env.NODE_ENV}` });
import { checkIsVerified, WriteLogs } from '../../../../global/function';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments } = hre;

  const ROUTER = process.env.SpookyRouter;
  const WNATIVE = process.env.wNative;

  const wNativeRelayer = await deployments.get("WNativeRelayer");
  const wNativeRelayerContract = await ethers.getContractAt('WNativeRelayer', wNativeRelayer.address);

  console.log(">> Deploying SpookyswapStrategyAddBaseTokenOnly contract");
  const SpookyswapStrategyAddBaseTokenOnly = (await ethers.getContractFactory(
    "SpookyswapStrategyAddBaseTokenOnly",
    (await ethers.getSigners())[0],
  )) as SpookyswapStrategyAddBaseTokenOnly__factory;
  const spookyswapStrategyAddBaseTokenOnly = await upgrades.deployProxy(SpookyswapStrategyAddBaseTokenOnly, [ROUTER]);
  await spookyswapStrategyAddBaseTokenOnly.deployed()
  const implAddr_BaseOnly = await hre.upgrades.erc1967.getImplementationAddress(spookyswapStrategyAddBaseTokenOnly.address);
  await deployments.save('SpookyswapStrategyAddBaseTokenOnly', { address: spookyswapStrategyAddBaseTokenOnly.address, implementation: implAddr_BaseOnly } as DeploymentSubmission)
  console.log(`>> Deployed at ${spookyswapStrategyAddBaseTokenOnly.address}`);
  if (!(await checkIsVerified(implAddr_BaseOnly))) {
    console.log("impl: ", implAddr_BaseOnly);
    await hre.run("verify:verify", {
      address: implAddr_BaseOnly,
    })
  }
  WriteLogs("SpookyswapStrategyAddBaseTokenOnly: ", "Proxy: ", spookyswapStrategyAddBaseTokenOnly.address, "impl: ", implAddr_BaseOnly);
  await new Promise(resolve => setTimeout(resolve, 50000));

  console.log(">> Deploying SpookyswapStrategyLiquidate contract");
  const SpookyswapStrategyLiquidate = (await ethers.getContractFactory(
    "SpookyswapStrategyLiquidate",
    (await ethers.getSigners())[0],
  )) as SpookyswapStrategyLiquidate__factory;
  const spookyswapStrategyLiquidate = await upgrades.deployProxy(SpookyswapStrategyLiquidate, [ROUTER]);
  await spookyswapStrategyLiquidate.deployed();
  const implAddr_Liquidate = await hre.upgrades.erc1967.getImplementationAddress(spookyswapStrategyLiquidate.address);
  await deployments.save('SpookyswapStrategyLiquidate', { address: spookyswapStrategyLiquidate.address, implementation: implAddr_Liquidate } as DeploymentSubmission)
  console.log(`>> Deployed at ${spookyswapStrategyLiquidate.address}`);
  if (!(await checkIsVerified(implAddr_Liquidate))) {
    console.log("impl: ", implAddr_Liquidate);
    await hre.run("verify:verify", {
      address: implAddr_Liquidate,
    })
  }
  WriteLogs("SpookyswapStrategyLiquidate: ", "Proxy: ", spookyswapStrategyLiquidate.address, "impl: ", implAddr_Liquidate);
  await new Promise(resolve => setTimeout(resolve, 50000));

  console.log(">> Deploying SpookyswapStrategyWithdrawMinimizeTrading contract");
  const SpookyswapStrategyWithdrawMinimizeTrading = (await ethers.getContractFactory(
    "SpookyswapStrategyWithdrawMinimizeTrading",
    (await ethers.getSigners())[0],
  )) as SpookyswapStrategyWithdrawMinimizeTrading__factory;
  const spookyswapStrategyWithdrawMinimizeTrading = await upgrades.deployProxy(SpookyswapStrategyWithdrawMinimizeTrading, [ROUTER, WNATIVE, wNativeRelayer.address]);
  await spookyswapStrategyWithdrawMinimizeTrading.deployed();
  const implAddr_Minimize = await hre.upgrades.erc1967.getImplementationAddress(spookyswapStrategyWithdrawMinimizeTrading.address);
  await deployments.save('SpookyswapStrategyWithdrawMinimizeTrading', { address: spookyswapStrategyWithdrawMinimizeTrading.address, implementation: implAddr_Minimize } as DeploymentSubmission)
  console.log(`>> Deployed at ${spookyswapStrategyWithdrawMinimizeTrading.address}`);
  if (!(await checkIsVerified(implAddr_Minimize))) {
    console.log("impl: ", implAddr_Minimize);
    await hre.run("verify:verify", {
      address: implAddr_Minimize,
    })
  }
  WriteLogs("SpookyswapStrategyWithdrawMinimizeTrading: ", "Proxy: ", spookyswapStrategyWithdrawMinimizeTrading.address, "impl: ", implAddr_Minimize);
  await new Promise(resolve => setTimeout(resolve, 50000));

  console.log(">> Whitelist SpookyswapStrategyWithdrawMinimizeTrading on WNativeRelayer");
  await wNativeRelayerContract.setCallerOk([spookyswapStrategyWithdrawMinimizeTrading.address], true);
  console.log("✅ Done")

};



export default func;
func(hre);