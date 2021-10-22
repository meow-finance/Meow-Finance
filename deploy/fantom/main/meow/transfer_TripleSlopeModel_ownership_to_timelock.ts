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
  const TripleSlopeModel_Addr = await deployments.get("TripleSlopeModel");
  const TripleSlopModelContract = await ethers.getContractAt('TripleSlopeModel', TripleSlopeModel_Addr.address);
  let owner = await TripleSlopModelContract.owner();
  console.log("TripleSlopeModel owner:", owner);
  if (owner == deployer) {
    console.log(`Transferring ownership of TripleSlopeModel to TIMELOCK`);
    await TripleSlopModelContract.transferOwnership(TIMELOCK.address, { gasLimit: '500000' });
    if (!IsFork()) {
      await new Promise(resolve => setTimeout(resolve, 90000));
    }
    const newOwner = await TripleSlopModelContract.owner();
    console.log("TripleSlopeModel new owner:", newOwner);
    console.log("✅ Done")
  }

};

export default func;
func(hre);