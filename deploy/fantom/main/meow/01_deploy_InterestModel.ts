import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import hre from "hardhat";
import { checkIsVerified, WriteLogs } from '../../../../global/function';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const CEIL_1 = 5000; // 50% utilization
    const CEIL_2 = 9000; // 90% utilization
    const CEIL_3 = 10000; // 100% utilization

    const MAX_INTEREST_1 = 25; // 25% interest
    const MAX_INTEREST_2 = 25; // 25% interest
    const MAX_INTEREST_3 = 100 // 100% interest

    // ===== TripleSlopeModel ===== //

    console.log("_____________________________________________________________\n");
    console.log(">>> Deploying TripleSlopeModel");

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

    if (!(await checkIsVerified(interestModel.address))) {
        await hre.run("verify:verify", {
            address: interestModel.address,
            constructorArguments: [
                CEIL_1,
                CEIL_2,
                CEIL_3,
                MAX_INTEREST_1,
                MAX_INTEREST_2,
                MAX_INTEREST_3
            ],
        })
        WriteLogs("TripleSlopeModel: ", interestModel.address);
    } else {
        console.log("TripleSlopeModel is verified.");
    }

    // ============================ //

};

export default func;
func(hre);