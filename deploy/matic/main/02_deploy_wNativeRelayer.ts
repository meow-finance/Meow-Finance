import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
const hre = require("hardhat");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const wNative = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';

  await deploy('WNativeRelayer', {
    from: deployer,
    args: [wNative],
    log: true,
    deterministicDeployment: false,
  });

  const wNativeRelayer = await deployments.get('WNativeRelayer');
  console.log("wNativeRelayer: ", wNativeRelayer.address);

  await hre.run("verify:verify", {
    address: wNativeRelayer.address,
    constructorArguments: [
      wNative
    ],
  })

};

export default func;
func(hre);