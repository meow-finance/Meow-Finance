import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
const hre = require("hardhat");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const wNative = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
    const wNativeRelayer = await deployments.get('WNativeRelayer');
    const wNativeRelayerContract = await ethers.getContractAt('WNativeRelayer', wNativeRelayer.address);

    await deploy('FeeDistribute', {
        from: deployer,
        args: [wNative, wNativeRelayer.address],
        log: true,
        deterministicDeployment: false,
    });

    const feeDistribute = await deployments.get('FeeDistribute');
    console.log("FeeDistribute: ", feeDistribute.address);

    await hre.run("verify:verify", {
        address: feeDistribute.address,
        contract: "contracts/token/FeeDistribute.sol:FeeDistribute",
        constructorArguments: [
            wNative, wNativeRelayer.address
        ]
    })

    console.log("Whitelisting FeeDistribute on WNativeRelayer Contract");
    await wNativeRelayerContract.setCallerOk([feeDistribute.address], true);
    console.log("✅ Done")

};

export default func;
func(hre);