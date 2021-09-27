import { config as dotEnvConfig } from "dotenv";
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import hre from "hardhat";
dotEnvConfig({ path: `.env.${process.env.NODE_ENV}` });
import { checkIsVerified, WriteLogs } from '../../../../global/function';

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
    const DEV = process.env.DEV;
    const TREASURY = process.env.TREASURY;

    await deploy('MeowTreasury', {
        from: deployer,
        args: [MeowToken.address, TREASURY],
        log: true,
        deterministicDeployment: false,
    });

    const meowTreasury = await deployments.get('MeowTreasury');
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

    await deploy('DevelopmentFund', {
        from: deployer,
        args: [MeowToken.address, DEV],
        log: true,
        deterministicDeployment: false,
    });

    const developmentFund = await deployments.get('DevelopmentFund');
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

    await deploy('MeowMining', {
        from: deployer,
        args: [MeowToken.address,
            MEOW_PER_SECOND,
            START_TIME,
            PRE_SHARE,
            LOCK_SHARE,
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
                LOCK_SHARE,
                DEV,
                developmentFund.address
            ],
        })
        WriteLogs("MeowMining: ", meowMining.address);
    } else {
        console.log("MeowMining is verified.");
    }

    console.log(">> Transferring ownership of MeowToken from deployer to MeowMining");
    await MeowTokenContract.transferOwnership(meowMining.address, { gasLimit: '500000' });
    console.log("✅ Done");

    console.log(">> Lock MeowToken in MeowTreasury"); // Mint 13% of 250m and locks for 50% of 13% = 16.25m
    const MeowTreasuryContract = await ethers.getContractAt('MeowTreasury', meowTreasury.address);
    await MeowTokenContract.approve(meowTreasury.address, ethers.utils.parseEther('16250000'), { gasLimit: '500000' });
    await new Promise(resolve => setTimeout(resolve, 20000));
    await MeowTreasuryContract.lock( ethers.utils.parseEther('16250000'), { gasLimit: '500000' });
    console.log("✅ Done");

};

export default func;
func(hre);