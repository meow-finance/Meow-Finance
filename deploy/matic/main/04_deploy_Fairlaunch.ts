import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
const hre = require("hardhat");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const MeowToken = await deployments.get('MeowToken');
    const MeowTokenContract = await ethers.getContractAt('MeowToken', MeowToken.address);
    const MEOW_PER_SECOND = ethers.utils.parseEther('0');
    const START_TIME = 0;
    const PRE_SHARE = 3000;
    const LOCK_SHARE = 7000;

    await deploy('DevelopmentFund', {
        from: deployer,
        args: [MeowToken.address],
        log: true,
        deterministicDeployment: false,
    });

    const developmentFund = await deployments.get('DevelopmentFund');
    console.log("DevelopmentFund: ", developmentFund.address);

    await hre.run("verify:verify", {
        address: developmentFund.address,
        constructorArguments: [
            MeowToken.address
        ],
    })

    await deploy('FairLaunch', {
        from: deployer,
        args: [MeowToken.address,
            MEOW_PER_SECOND,
            START_TIME,
            PRE_SHARE,
            LOCK_SHARE,
        developmentFund.address
        ],
        log: true,
        deterministicDeployment: false,
    });

    const fairLaunch = await deployments.get('FairLaunch');
    console.log("FairLaunch: ", fairLaunch.address);

    await hre.run("verify:verify", {
        address: fairLaunch.address,
        constructorArguments: [
            MeowToken.address,
            MEOW_PER_SECOND,
            START_TIME,
            PRE_SHARE,
            LOCK_SHARE,
            developmentFund.address
        ],
    })

    console.log(">> Transferring ownership of MeowToken from deployer to FairLaunch");
    await MeowTokenContract.transferOwnership(fairLaunch.address, { gasLimit: '500000' });
    console.log("✅ Done");

};

export default func;
func(hre);