import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import hre from "hardhat";
import { Wait, IsFork } from '../../../../global/function';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const TIMELOCK = await deployments.get("Timelock");

  console.log("_____________________________________________________________\n");
  const MeowMining_Addr = await deployments.get("MeowMining");
  const MeowMiningContract = await ethers.getContractAt('MeowMining', MeowMining_Addr.address);
  let owner = await MeowMiningContract.owner();
  console.log("MeowMining owner:", owner);
  if (owner == deployer) {
    console.log(`Transferring ownership of MeowMining to TIMELOCK`);
    await MeowMiningContract.transferOwnership(TIMELOCK.address, { gasLimit: '500000' });
    if (!IsFork()) {
      await new Promise(resolve => setTimeout(resolve, 90000));
    }
    const newOwner = await MeowMiningContract.owner();
    console.log("MeowMining new owner:", newOwner);
    console.log("✅ Done")
  }

};

export default func;
func(hre);