import { config as dotEnvConfig } from "dotenv";
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import hre from "hardhat";
dotEnvConfig({ path: `.env.${process.env.NODE_ENV}` });
import { checkIsVerified, WriteLogs } from '../../../../global/function';


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const wNative = process.env.wNative;

  // ===== WNativeRelayer ===== //

  console.log("_____________________________________________________________\n");
  console.log(">>> Deploying WNativeRelayer");

  await deploy('WNativeRelayer', {
    from: deployer,
    args: [wNative],
    log: true,
    deterministicDeployment: false,
  });

  const wNativeRelayer = await deployments.get('WNativeRelayer');
  console.log("WNativeRelayer: ", wNativeRelayer.address);

  if ((await checkIsVerified(wNativeRelayer.address))) {

    await hre.run("verify:verify", {
      address: wNativeRelayer.address,
      constructorArguments: [
        wNative
      ],
    })
    WriteLogs("wNativeRelayer: ", wNativeRelayer.address);

  } else {
    console.log("wNativeRelayer is verified.");
  }

  // ========================== //

};

export default func;
func(hre);