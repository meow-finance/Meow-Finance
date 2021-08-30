import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
const hre = require("hardhat");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;

    const { deployer } = await getNamedAccounts();
    const MeowToken = await deployments.get('MeowToken');

    await deploy('mMeowToken', {
        from: deployer,
        args: [MeowToken.address],
        log: true,
        deterministicDeployment: false,
    });

    const mMeowToken = await deployments.get('mMeowToken');
    console.log("mMeowToken: ", mMeowToken.address);

    await hre.run("verify:verify", {
        address: mMeowToken.address,
        contract: "contracts/token/mMeowToken.sol:mMeowToken",
        constructorArguments: [
            MeowToken.address
        ]
    })

};

export default func;
func(hre);