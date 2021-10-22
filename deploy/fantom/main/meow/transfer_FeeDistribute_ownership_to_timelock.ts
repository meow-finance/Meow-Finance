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
  const FeeDistribute_Addr = await deployments.get("FeeDistribute");
  const FeeDistributeContract = await ethers.getContractAt('FeeDistribute', FeeDistribute_Addr.address);
  let owner = await FeeDistributeContract.owner();
  console.log("FeeDistribute owner:", owner);
  if (owner == deployer) {
    console.log(`Transferring ownership of FeeDistribute to TIMELOCK`);
    await FeeDistributeContract.transferOwnership(TIMELOCK.address, { gasLimit: '500000' });
    if (!IsFork()) {
      await new Promise(resolve => setTimeout(resolve, 90000));
    }
    const newOwner = await FeeDistributeContract.owner();
    console.log("FeeDistribute new owner:", newOwner);
    console.log("✅ Done")
  }

};

export default func;
func(hre);