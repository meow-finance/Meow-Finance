import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';
import { WorkerConfig__factory } from '../../../typechain';
const hre = require("hardhat");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments } = hre;

  const SIMPLE_ORACLE_ADDR = await deployments.get('SimplePriceOracle');

  console.log(">> Deploying WorkerConfig contract");
  const WorkerConfig = (await ethers.getContractFactory(
    'WorkerConfig',
    (await ethers.getSigners())[0]
  )) as WorkerConfig__factory;
  const workerConfig = await upgrades.deployProxy(
    WorkerConfig,[SIMPLE_ORACLE_ADDR.address]
  );
  await workerConfig.deployed();
  await deployments.save('WorkerConfig', { address: workerConfig.address } as DeploymentSubmission)
  console.log(`>> Deployed at ${workerConfig.address}`);
};

export default func;
func(hre);