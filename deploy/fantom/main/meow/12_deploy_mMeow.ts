import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import hre from "hardhat";
import { checkIsVerified, WriteLogs } from '../../../../global/function';
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;

    const { deployer } = await getNamedAccounts();
    const MeowToken = await deployments.get('MeowToken');

    const MEOW_MINING_ADDR = await deployments.get("MeowMining");
    const meowMiningContract = await ethers.getContractAt('MeowMining', MEOW_MINING_ADDR.address);

    await deploy('mMeowToken', {
        from: deployer,
        args: [MeowToken.address],
        log: true,
        deterministicDeployment: false,
    });

    const mMeowToken = await deployments.get('mMeowToken');
    console.log("mMeowToken: ", mMeowToken.address);

    console.log("Create a mMeowToken pool on MeowMining");
    await meowMiningContract.addPool(0, mMeowToken.address, { gasLimit: '2000000' });
    await new Promise(resolve => setTimeout(resolve, 60000));
    console.log("✅ Done");
    if (!(await checkIsVerified(mMeowToken.address))) {
        await hre.run("verify:verify", {
            address: mMeowToken.address,
            contract: "contracts/token/mMeowToken.sol:mMeowToken",
            constructorArguments: [
                MeowToken.address
            ]
        })
        WriteLogs(`mMeowToken: `, mMeowToken.address);
    }


};

export default func;
func(hre);