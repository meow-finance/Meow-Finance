import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';
import { SushiswapStrategyAddBaseTokenOnly__factory, SushiswapStrategyLiquidate__factory, SushiswapStrategyWithdrawMinimizeTrading__factory } from '../../../typechain';
const hre = require("hardhat");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments } = hre;

  const ROUTER = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
  const WNATIVE = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';

  const wNativeRelayer = await deployments.get("WNativeRelayer");
  const wNativeRelayerContract = await ethers.getContractAt('WNativeRelayer', wNativeRelayer.address);

  console.log(">> Deploying SushiswapStrategyAddBaseTokenOnly contract");
  const SushiswapStrategyAddBaseTokenOnly = (await ethers.getContractFactory(
    "SushiswapStrategyAddBaseTokenOnly",
    (await ethers.getSigners())[0],
  )) as SushiswapStrategyAddBaseTokenOnly__factory;
  const sushiswapStrategyAddBaseTokenOnly = await upgrades.deployProxy(SushiswapStrategyAddBaseTokenOnly, [ROUTER]);
  await sushiswapStrategyAddBaseTokenOnly.deployed()
  await deployments.save('SushiswapStrategyAddBaseTokenOnly', { address: sushiswapStrategyAddBaseTokenOnly.address } as DeploymentSubmission)
  console.log(`>> Deployed at ${sushiswapStrategyAddBaseTokenOnly.address}`);

  console.log(">> Deploying SushiswapStrategyLiquidate contract");
  const SushiswapStrategyLiquidate = (await ethers.getContractFactory(
    "SushiswapStrategyLiquidate",
    (await ethers.getSigners())[0],
  )) as SushiswapStrategyLiquidate__factory;
  const sushiswapStrategyLiquidate = await upgrades.deployProxy(SushiswapStrategyLiquidate, [ROUTER]);
  await sushiswapStrategyLiquidate.deployed();
  await deployments.save('SushiswapStrategyLiquidate', { address: sushiswapStrategyLiquidate.address } as DeploymentSubmission)
  console.log(`>> Deployed at ${sushiswapStrategyLiquidate.address}`);

  console.log(">> Deploying SushiswapStrategyWithdrawMinimizeTrading contract");
  const SushiswapStrategyWithdrawMinimizeTrading = (await ethers.getContractFactory(
    "SushiswapStrategyWithdrawMinimizeTrading",
    (await ethers.getSigners())[0],
  )) as SushiswapStrategyWithdrawMinimizeTrading__factory;
  const sushiswapStrategyWithdrawMinimizeTrading = await upgrades.deployProxy(SushiswapStrategyWithdrawMinimizeTrading, [ROUTER, WNATIVE, wNativeRelayer.address]);
  await sushiswapStrategyWithdrawMinimizeTrading.deployed();
  await deployments.save('SushiswapStrategyWithdrawMinimizeTrading', { address: sushiswapStrategyWithdrawMinimizeTrading.address } as DeploymentSubmission)
  console.log(`>> Deployed at ${sushiswapStrategyWithdrawMinimizeTrading.address}`);

  console.log(">> Whitelist SushiswapStrategyWithdrawMinimizeTrading on WNativeRelayer");
  await wNativeRelayerContract.setCallerOk([sushiswapStrategyWithdrawMinimizeTrading.address], true);
  console.log("✅ Done")
};

export default func;
func(hre);