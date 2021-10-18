import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import hre from "hardhat";
import { checkIsVerified, WriteLogs } from '../../../../global/function';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    // ===== MeowToken ===== //

    console.log("_____________________________________________________________\n");
    console.log(">>> Deploying MeowToken");

    await deploy('MeowToken', {
        from: deployer,
        log: true,
        deterministicDeployment: false,
    });

    const meowToken = await deployments.get('MeowToken');
    const meowTokenContract = await ethers.getContractAt('MeowToken', meowToken.address);
    console.log("MeowToken: ", meowToken.address);

    if (!(await checkIsVerified(meowToken.address))) {
        await hre.run("verify:verify", {
            address: meowToken.address,
            contract: "contracts/token/MeowToken.sol:MeowToken"
        })
        WriteLogs("MeowToken: ", meowToken.address);
    } else {
        console.log("MeowToken is verified.");
    }

    console.log("Check MeowTokens balance");
    console.log(ethers.utils.formatEther((await meowTokenContract.balanceOf(deployer)).toString()));
    console.log("✅ Done");

    // ===================== //

};

export default func;
func(hre);