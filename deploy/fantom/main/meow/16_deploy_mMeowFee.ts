
import { config as dotEnvConfig } from "dotenv";
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import hre from "hardhat";
dotEnvConfig({ path: `.env.${process.env.NODE_ENV}` });
import { checkIsVerified, WriteLogs } from '../../../../global/function';
import { GetContractDeployed, LOG, toEther} from "../../../../global/utils";
import { MMeowFee } from "../../../../typechain";
import { BigNumber } from "ethers";
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const meowGOV = await deployments.get('MeowGovernance');
    const mMeow = await deployments.get('mMeowToken');
    const feeAddress = deployer;
    await deploy('MMeowFee', {
        from: deployer,
        args: [ meowGOV.address, feeAddress , mMeow.address, BigNumber.from(2000)],
        log: true,
        deterministicDeployment: false,
    });
    const meowFee = await deployments.get('MMeowFee');
    if (!(await checkIsVerified(meowFee.address))) {
        await hre.run("verify:verify", {
            address: meowFee.address,
            constructorArguments: [
                meowGOV.address, feeAddress , mMeow.address , BigNumber.from(2000)
            ],
        })
    }
    WriteLogs("MMeowFee :", meowFee.address);
    //SetFee
    LOG("setMMeowFee")
    const mMeowFeeContract = await GetContractDeployed("MMeowFee") as MMeowFee;
    let res = await mMeowFeeContract.setMMeowFee(
        [toEther(100,6),toEther(500,6),toEther(1000,6),toEther(2000,6)], [ BigNumber.from("450"),BigNumber.from("250"),BigNumber.from("150"),BigNumber.from("50")]);
    LOG("✅ setMMeowFee");    
    LOG("setMMeowReserveBps")
    await mMeowFeeContract.setMMeowReserveBps(4000, {gasLimit:'200000'});
    LOG("✅ setMMeowReserveBps")
};

export default func;
func(hre);