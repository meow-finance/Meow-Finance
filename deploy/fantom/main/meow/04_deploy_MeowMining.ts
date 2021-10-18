import { config as dotEnvConfig } from "dotenv";
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import hre from "hardhat";
dotEnvConfig({ path: `.env.${process.env.NODE_ENV}` });
import { checkIsVerified, WriteLogs } from '../../../../global/function';
import { FixedNumber } from "ethers";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const MeowToken = await deployments.get('MeowToken');
    const MeowTokenContract = await ethers.getContractAt('MeowToken', MeowToken.address);
    const MEOW_PER_SECOND = ethers.utils.parseEther('0');
    const START_TIME = 0;
    const PRE_SHARE = 3000; // Lock 30%
    const DEV = process.env.DEV;
    const TREASURY = process.env.TREASURY;

    console.log(">>> Check MeowTokens balance");
    console.log(ethers.utils.formatEther((await MeowTokenContract.balanceOf(deployer)).toString()));

    // ===== Meow Treasury ===== //

    console.log("_____________________________________________________________\n");
    console.log(">>> Deploying Meow Treasury");

    await deploy('MeowTreasury', {
        from: deployer,
        args: [MeowToken.address, TREASURY],
        log: true,
        deterministicDeployment: false,
    });

    const meowTreasury = await deployments.get('MeowTreasury');
    const meowTreasuryContract = await ethers.getContractAt('MeowTreasury', meowTreasury.address);
    console.log("MeowTreasury: ", meowTreasury.address);

    if (!(await checkIsVerified(meowTreasury.address))) {
        await hre.run("verify:verify", {
            address: meowTreasury.address,
            constructorArguments: [
                MeowToken.address, TREASURY
            ],
        })
        WriteLogs("MeowTreasury: ", meowTreasury.address);
    } else {
        console.log("MeowTreasury is verified.");
    }

    console.log(">>> Check MeowTreasury whitelisted deployer");
    let isTreasuryWhitelisted = await meowTreasuryContract.whitelistedCallers(deployer);
    console.log(isTreasuryWhitelisted);
    if (!isTreasuryWhitelisted) {
        console.log("Set deployer to MeowTreasury whitelisted.");
        await meowTreasuryContract.setWhitelistedCallers([deployer], true, { gasLimit: '500000' });
        console.log("Check MeowTreasury whitelisted deployer");
        isTreasuryWhitelisted = await meowTreasuryContract.whitelistedCallers(deployer);
        console.log(isTreasuryWhitelisted);
        console.log("✅ Done");
    }
    const reserve = ethers.utils.formatEther(await MeowTokenContract.reserve());
    console.log("Reserve: ", reserve.toString());
    const reserveToLock = FixedNumber.from(reserve).divUnsafe(FixedNumber.from(2));
    console.log("Reserve to lock: ", reserveToLock.toString());

    console.log("Approve Meow to MeowTreasury");
    await MeowTokenContract.approve(meowTreasury.address, reserveToLock, { gasLimit: '500000' });

    console.log(">>> Lock reserve 50% to MeowTreasury.");
    await meowTreasuryContract.lock(reserveToLock, { gasLimit: '500000' });

    console.log("Check deployer MeowTokens balance");
    console.log(ethers.utils.formatEther((await MeowTokenContract.balanceOf(deployer)).toString()));
    console.log("Check MeowTreasury MeowTokens balance");
    console.log(ethers.utils.formatEther((await MeowTokenContract.balanceOf(meowTreasury.address)).toString()));

    // ============================ //

    // ===== Development Fund ===== //

    console.log("_____________________________________________________________\n");
    console.log(">>> Deploying DevelopmentFund");

    await deploy('DevelopmentFund', {
        from: deployer,
        args: [MeowToken.address, DEV],
        log: true,
        deterministicDeployment: false,
    });

    const developmentFund = await deployments.get('DevelopmentFund');
    const developmentFundContract = await ethers.getContractAt('DevelopmentFund', developmentFund.address);
    console.log("DevelopmentFund: ", developmentFund.address);

    if (!(await checkIsVerified(developmentFund.address))) {
        await hre.run("verify:verify", {
            address: developmentFund.address,
            constructorArguments: [
                MeowToken.address, DEV
            ],
        })
        WriteLogs("DevelopmentFund: ", developmentFund.address);
    } else {
        console.log("DevelopmentFund is verified.");
    }

    console.log(">>> Check DevelopmentFund whitelisted deployer");
    let isDevFundWhitelisted = await developmentFundContract.whitelistedCallers(deployer);
    console.log(isDevFundWhitelisted);
    if (!isDevFundWhitelisted) {
        console.log("Set deployer to DevelopmentFund whitelisted.");
        await developmentFundContract.setWhitelistedCallers([deployer], true, { gasLimit: '500000' });
        console.log("Check DevelopmentFund whitelisted deployer");
        isDevFundWhitelisted = await developmentFundContract.whitelistedCallers(deployer);
        console.log(isDevFundWhitelisted);
        console.log("✅ Done");
    }

    // ========================//

    // ===== Meow Mining ===== //

    console.log("_____________________________________________________________\n");
    console.log(">>> Deploying MeowMining");

    await deploy('MeowMining', {
        from: deployer,
        args: [MeowToken.address,
            MEOW_PER_SECOND,
            START_TIME,
            PRE_SHARE,
            DEV,
        developmentFund.address
        ],
        log: true,
        deterministicDeployment: false,
    });

    const meowMining = await deployments.get('MeowMining');
    console.log("MeowMining: ", meowMining.address);

    if (!(await checkIsVerified(meowMining.address))) {
        await hre.run("verify:verify", {
            address: meowMining.address,
            constructorArguments: [
                MeowToken.address,
                MEOW_PER_SECOND,
                START_TIME,
                PRE_SHARE,
                DEV,
                developmentFund.address
            ],
        })
        WriteLogs("MeowMining: ", meowMining.address);
    } else {
        console.log("MeowMining is verified.");
    }

    console.log(">>> Transferring ownership of MeowToken from deployer to MeowMining");
    await MeowTokenContract.transferOwnership(meowMining.address, { gasLimit: '500000' });
    console.log("✅ Done");

    console.log(">>> Check DevelopmentFund whitelisted MeowMining");
    isDevFundWhitelisted = await developmentFundContract.whitelistedCallers(meowMining.address);
    console.log(isDevFundWhitelisted);
    if (!isDevFundWhitelisted) {
        console.log("Set MeowMining to DevelopmentFund whitelisted.");
        await developmentFundContract.setWhitelistedCallers([meowMining.address], true, { gasLimit: '500000' });
        console.log("Check DevelopmentFund whitelisted MeowMining");
        isDevFundWhitelisted = await developmentFundContract.whitelistedCallers(meowMining.address);
        console.log(isDevFundWhitelisted);
        console.log("✅ Done");
    }

    // ======================= //

};

export default func;
func(hre);