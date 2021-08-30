import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';
import { QuickswapStrategyAddBaseTokenOnly__factory, QuickswapStrategyLiquidate__factory, QuickswapStrategyWithdrawMinimizeTrading__factory } from '../../../typechain';
const hre = require("hardhat");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments } = hre;

  const ROUTER = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';
  const WNATIVE = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';

  const wNativeRelayer = await deployments.get("WNativeRelayer");
  const wNativeRelayerContract = await ethers.getContractAt('WNativeRelayer', wNativeRelayer.address);

  console.log(">> Deploying QuickswapStrategyAddBaseTokenOnly contract");
  const QuickswapStrategyAddBaseTokenOnly = (await ethers.getContractFactory(
    "QuickswapStrategyAddBaseTokenOnly",
    (await ethers.getSigners())[0],
  )) as QuickswapStrategyAddBaseTokenOnly__factory;
  const quickswapStrategyAddBaseTokenOnly = await upgrades.deployProxy(QuickswapStrategyAddBaseTokenOnly, [ROUTER]);
  await quickswapStrategyAddBaseTokenOnly.deployed()
  await deployments.save('QuickswapStrategyAddBaseTokenOnly', { address: quickswapStrategyAddBaseTokenOnly.address } as DeploymentSubmission)
  console.log(`>> Deployed at ${quickswapStrategyAddBaseTokenOnly.address}`);

  console.log(">> Deploying QuickswapStrategyLiquidate contract");
  const QuickswapStrategyLiquidate = (await ethers.getContractFactory(
    "QuickswapStrategyLiquidate",
    (await ethers.getSigners())[0],
  )) as QuickswapStrategyLiquidate__factory;
  const quickswapStrategyLiquidate = await upgrades.deployProxy(QuickswapStrategyLiquidate, [ROUTER]);
  await quickswapStrategyLiquidate.deployed();
  await deployments.save('QuickswapStrategyLiquidate', { address: quickswapStrategyLiquidate.address } as DeploymentSubmission)
  console.log(`>> Deployed at ${quickswapStrategyLiquidate.address}`);

  console.log(">> Deploying QuickswapStrategyWithdrawMinimizeTrading contract");
  const QuickswapStrategyWithdrawMinimizeTrading = (await ethers.getContractFactory(
    "QuickswapStrategyWithdrawMinimizeTrading",
    (await ethers.getSigners())[0],
  )) as QuickswapStrategyWithdrawMinimizeTrading__factory;
  const quickswapStrategyWithdrawMinimizeTrading = await upgrades.deployProxy(QuickswapStrategyWithdrawMinimizeTrading, [ROUTER, WNATIVE, wNativeRelayer.address]);
  await quickswapStrategyWithdrawMinimizeTrading.deployed();
  await deployments.save('QuickswapStrategyWithdrawMinimizeTrading', { address: quickswapStrategyWithdrawMinimizeTrading.address } as DeploymentSubmission)
  console.log(`>> Deployed at ${quickswapStrategyWithdrawMinimizeTrading.address}`);

  console.log(">> Whitelist QuickswapStrategyWithdrawMinimizeTrading on WNativeRelayer");
  await wNativeRelayerContract.setCallerOk([quickswapStrategyWithdrawMinimizeTrading.address], true);
  console.log("✅ Done")
};

export default func;
func(hre);