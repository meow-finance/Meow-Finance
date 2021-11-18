
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
    const SpookyswapRouter = process.env.SpookyRouter;
    const MeowToken = await deployments.get('MeowToken');
    const mMeowToken = await deployments.get('mMeowToken');
    const meowMining = await deployments.get('MeowMining');
    const UsdcToken = process.env.USDC;
    await deploy('MeowGovernance', {
        from: deployer,
        args: [SpookyswapRouter, MeowToken.address, mMeowToken.address, UsdcToken , meowMining.address],
        log: true,
        deterministicDeployment: false,
    });
    const meowGov = await deployments.get('MeowGovernance');
    if (!(await checkIsVerified(meowGov.address))) {
        await hre.run("verify:verify", {
            address: meowGov.address,
            contract: "contracts/protocol/apis/fantom/MeowGovernance.sol:MeowGovernance",
            constructorArguments: [
                SpookyswapRouter, MeowToken.address, mMeowToken.address, UsdcToken, meowMining.address
            ],
        })
    }
    WriteLogs("MeowGovernance :", meowGov.address);

};

export default func;
func(hre);