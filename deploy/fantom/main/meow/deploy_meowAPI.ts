
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

    const MeowMining = await deployments.get('MeowMining');
    const InterestModel = await deployments.get('TripleSlopeModel');
    const SpookyswapRouter = process.env.SpookyRouter;
    const SpookyMasterChef = process.env.SpookyMasterChef;
    const MeowToken = await deployments.get('MeowToken');
    const UsdcToken = process.env.USDC;

    await deploy('MeowAPIFTM', {
        from: deployer,
        args: [MeowMining.address, InterestModel.address, SpookyswapRouter, SpookyMasterChef, MeowToken.address, UsdcToken],
        log: true,
        deterministicDeployment: false,
    });

    const meowAPI = await deployments.get('MeowAPIFTM');
    console.log("MeowAPIFTM: ", meowAPI.address);
    if (!(await checkIsVerified(meowAPI.address))) {
        await hre.run("verify:verify", {
            address: meowAPI.address,
            contract: "contracts/protocol/apis/fantom/MeowAPIFTM.sol:MeowAPIFTM",
            constructorArguments: [
                MeowMining.address, InterestModel.address, SpookyswapRouter, SpookyMasterChef, MeowToken.address, UsdcToken
            ]
        })
    }
    WriteLogs("MeowAPIFTM :", meowAPI.address);


};

export default func;
func(hre);