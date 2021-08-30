
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
const hre = require("hardhat");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const FairLaunch = "0xcEA0e1cEcB0B379Da984Fa43C4E8EF13D1860754";
    const InterestModel = "0x559B3F2E4e189BD0eD0ed58E437E7edB753E4803";
    const SushiswapRouter = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"; 
    const MiniChef = "0x0769fd68dFb93167989C6f7254cd0D766Fb2841F";
    const QuickswapRouter = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
    const StakingRewardsFactory = "0x5eec262B05A57da9beb5FE96a34aa4eD0C5e029f";
    const MeowToken = "0xFC33a6f3d29494C648F59b75595f72EB825B7e0f";
    const UsdcToken = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

    await deploy('MeowAPI', {
        from: deployer,
        args: [FairLaunch, InterestModel, SushiswapRouter, MiniChef, QuickswapRouter, StakingRewardsFactory, MeowToken, UsdcToken],
        log: true,
        deterministicDeployment: false,
    });

    const meowAPI = await deployments.get('MeowAPI');
    console.log("MeowAPI: ", meowAPI.address);

    await hre.run("verify:verify", {
        address: meowAPI.address,
        constructorArguments: [
            FairLaunch, InterestModel, SushiswapRouter, MiniChef, QuickswapRouter, StakingRewardsFactory, MeowToken, UsdcToken
        ],
    })

};

export default func;
func(hre);