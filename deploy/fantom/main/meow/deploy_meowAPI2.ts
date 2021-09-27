
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
    const SpookyswapRouter = process.env.SpookyRouter;
    const SpookyMasterChef = process.env.SpookyMasterChef;
    const MeowToken = await deployments.get('MeowToken');
    const UsdcToken = process.env.USDC;

    await deploy('MeowAPI2FTM', {
        from: deployer,
        args: [MeowMining.address, SpookyswapRouter, SpookyMasterChef, MeowToken.address, UsdcToken],
        log: true,
        deterministicDeployment: false,
    });

    const meowAPI2 = await deployments.get('MeowAPI2FTM');
    console.log("MeowAPI2FTM: ", meowAPI2.address);

    if (!(await checkIsVerified(meowAPI2.address))) {
        await hre.run("verify:verify", {
            address: meowAPI2.address,
            contract: "contracts/protocol/apis/fantom/MeowAPI2FTM.sol:MeowAPI2FTM",
            constructorArguments: [
                MeowMining.address, SpookyswapRouter, SpookyMasterChef, MeowToken.address, UsdcToken
            ],
        })
    }
    WriteLogs("MeowAPI2FTM :", meowAPI2.address);

};

export default func;
func(hre);