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
    const wNative = process.env.wNative;
    const wNativeRelayer = await deployments.get('WNativeRelayer');
    const wNativeRelayerContract = await ethers.getContractAt('WNativeRelayer', wNativeRelayer.address);

    const VAULTS = [
        {
            VAULT_NAME: "FTM",
            BASE_TOKEN: process.env.wNative
        },
        {
            VAULT_NAME: "BTC",
            BASE_TOKEN: process.env.BTC
        },
        {
            VAULT_NAME: "USDC",
            BASE_TOKEN: process.env.USDC
        },
        {
            VAULT_NAME: "fUSDT",
            BASE_TOKEN: process.env.fUSDT
        },
        {
            VAULT_NAME: "DAI",
            BASE_TOKEN: process.env.DAI
        },
        {
            VAULT_NAME: "ETH",
            BASE_TOKEN: process.env.ETH
        },
        {
            VAULT_NAME: "BOO",
            BASE_TOKEN: process.env.BOO
        }
    ]

    await deploy('FeeDistribute', {
        from: deployer,
        args: [wNative, wNativeRelayer.address],
        log: true,
        deterministicDeployment: false,
    });

    const feeDistribute = await deployments.get('FeeDistribute');
    const feeDistributeContract = await ethers.getContractAt('FeeDistribute', feeDistribute.address);
    console.log("FeeDistribute: ", feeDistribute.address);
    if (!(await checkIsVerified(feeDistribute.address))) {
        await hre.run("verify:verify", {
            address: feeDistribute.address,
            contract: "contracts/token/FeeDistribute.sol:FeeDistribute",
            constructorArguments: [
                wNative, wNativeRelayer.address
            ]
        })
    }
    WriteLogs("FeeDistribute :", feeDistribute.address);
    await new Promise(resolve => setTimeout(resolve, 60000));

    console.log("Whitelisting FeeDistribute on WNativeRelayer Contract");
    await wNativeRelayerContract.setCallerOk([feeDistribute.address], true);
    await new Promise(resolve => setTimeout(resolve, 60000));
    console.log("✅ Done")

    for (let i = 0; i < VAULTS.length; i++) {

        console.log(`Create a ${VAULTS[i].VAULT_NAME} pool on FeeDistribute`);
        await feeDistributeContract.addPool(MeowToken.address, VAULTS[i].BASE_TOKEN, { gasLimit: '2000000' });
        console.log("Waiting for MeowMining to update");
        await new Promise(resolve => setTimeout(resolve, 60000));
        console.log("✅ Done");

    }

};

export default func;
func(hre);