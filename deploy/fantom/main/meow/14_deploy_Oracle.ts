import { Oracle } from './../../../../typechain/Oracle.d';
import { config as dotEnvConfig } from "dotenv";
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import hre from "hardhat";
dotEnvConfig({ path: `.env.${process.env.NODE_ENV}` });
import { checkIsVerified, WriteLogs, Wait } from '../../../../global/function';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const FEEDER_ADDR = deployer;
    const SPOOKY_FACTORY = process.env.SpookyFactory as string;

    // ========= Token ========= //

    const WNATIVE = process.env.wNative as string;

    // ========================= //

    // ========= Oracle ========= //

    console.log("_____________________________________________________________\n");
    console.log(">>> Deploying Oracle");

    await deploy('Oracle', {
        from: deployer,
        args: [FEEDER_ADDR],
        log: true,
        deterministicDeployment: false,
    });

    const oracle = await deployments.get('Oracle');
    const oracleContract = await ethers.getContractAt('Oracle', oracle.address) as Oracle;
    console.log("Oracle: ", oracle.address);

    if (!(await checkIsVerified(oracle.address))) {
        await hre.run("verify:verify", {
            address: oracle.address,
            constructorArguments: [
                FEEDER_ADDR
            ],
        })
        WriteLogs("Oracle: ", oracle.address);
    } else {
        console.log("Oracle is verified.");
    }

    // ========================== //

    // ====== Update Price ====== //

    const VAULTS = [
        {
            VAULT_NAME: "FTM",
            BASE_TOKEN: process.env.wNative as string
        },
        {
            VAULT_NAME: "BTC",
            BASE_TOKEN: process.env.BTC as string
        },
        {
            VAULT_NAME: "USDC",
            BASE_TOKEN: process.env.USDC as string
        },
        {
            VAULT_NAME: "fUSDT",
            BASE_TOKEN: process.env.fUSDT as string
        },
        {
            VAULT_NAME: "DAI",
            BASE_TOKEN: process.env.DAI as string
        },
        {
            VAULT_NAME: "ETH",
            BASE_TOKEN: process.env.ETH as string
        },
        {
            VAULT_NAME: "BOO",
            BASE_TOKEN: process.env.BOO as string
        }
    ]

    for (let i = 0; i < VAULTS.length; i++) {
        if (WNATIVE != VAULTS[i].BASE_TOKEN) {
            console.log("________________________________________________________\n");
            console.log("wnative: ", WNATIVE);
            console.log(`${VAULTS[i].VAULT_NAME} token: `, VAULTS[i].BASE_TOKEN);
            console.log(">>> update price for first time.");
            await oracleContract.update(SPOOKY_FACTORY, WNATIVE, VAULTS[i].BASE_TOKEN, { gasLimit: '200000' });
            await Wait(90000);
            console.log("✅ Done")
        }
    }

    // ========================== //

};

export default func;
func(hre);