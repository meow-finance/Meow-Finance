import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import hre from "hardhat";
import { checkIsVerified, WriteLogs } from '../../../../global/function';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const ADMIN_ADDRESS = deployer;
  const DELAY_IN_DAYS = 1;

  // ===== Timelock ===== //

  console.log("_____________________________________________________________\n");
  console.log(">>> Deploying Timelock");
  
  await deploy('Timelock', {
    from: deployer,
    args: [
      ADMIN_ADDRESS,
      DELAY_IN_DAYS * 24 * 60 * 60,
    ],
    log: true,
    deterministicDeployment: false,
  });

  const timelock = await deployments.get('Timelock');
  console.log("Timelock: ", timelock.address);

  if (!(await checkIsVerified(timelock.address))) {
    await hre.run("verify:verify", {
      address: timelock.address,
      constructorArguments: [
        ADMIN_ADDRESS,
        DELAY_IN_DAYS * 24 * 60 * 60
      ],
    })
    WriteLogs("Timelock: ", timelock.address);
  } else {
    console.log("Timelock is verified.");
  }

  // ==================== //

};

export default func;
func(hre);