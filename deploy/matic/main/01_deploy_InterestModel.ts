import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
const hre = require("hardhat");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const CEIL_1 = 5000;
    const CEIL_2 = 9000;
    const CEIL_3 = 10000;

    const MAX_INTEREST_1 = 25;
    const MAX_INTEREST_2 = 25;
    const MAX_INTEREST_3 = 100

    await deploy('TripleSlopeModel', {
        from: deployer,
        args: [
            CEIL_1,
            CEIL_2,
            CEIL_3,
            MAX_INTEREST_1,
            MAX_INTEREST_2,
            MAX_INTEREST_3
        ],
        log: true,
        deterministicDeployment: false
    });
    const interestModel = await deployments.get('TripleSlopeModel');
    console.log("TripleSlopeModel: ", interestModel.address);

    await hre.run("verify:verify", {
        address: interestModel.address,
        constructorArguments: [
            CEIL_1,
            CEIL_2,
            CEIL_3,
            MAX_INTEREST_1,
            MAX_INTEREST_2,
            MAX_INTEREST_3
        ]
    })
};

export default func;
func(hre);