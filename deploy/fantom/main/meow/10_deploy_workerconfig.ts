import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';
import { WorkerConfig__factory } from '../../../../typechain';
import hre from "hardhat";
import { checkIsVerified, WriteLogs } from '../../../../global/function';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments } = hre;

  const SIMPLE_ORACLE_ADDR = await deployments.get('SimplePriceOracle');

  console.log(">> Deploying WorkerConfig contract");
  const WorkerConfig = (await ethers.getContractFactory(
    'WorkerConfig',
    (await ethers.getSigners())[0]
  )) as WorkerConfig__factory;
  const workerConfig = await upgrades.deployProxy(
    WorkerConfig, [SIMPLE_ORACLE_ADDR.address]
  );
  await workerConfig.deployed();
  const implAddr = await hre.upgrades.erc1967.getImplementationAddress(workerConfig.address);
  await deployments.save('WorkerConfig', { address: workerConfig.address, implementation: implAddr } as DeploymentSubmission)
  console.log(`>> Deployed at ${workerConfig.address}`);
  if (!(await checkIsVerified(implAddr))) {
    console.log("impl: ", implAddr);
    await hre.run("verify:verify", {
      address: implAddr,
    })
  }
  WriteLogs("WorkerConfig: ", "Proxy: ", workerConfig.address, "impl: ", implAddr);

};

export default func;
func(hre);