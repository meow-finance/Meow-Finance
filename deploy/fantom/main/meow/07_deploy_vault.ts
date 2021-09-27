import { config as dotEnvConfig } from "dotenv";
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { DebtToken__factory, Vault, Vault__factory } from '../../../../typechain';
import { ethers, upgrades } from 'hardhat';
import hre from "hardhat";
dotEnvConfig({ path: `.env.${process.env.NODE_ENV}` });
import { checkIsVerified, WriteLogs } from '../../../../global/function';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments } = hre;

  const MEOW_MINING_ADDR = await deployments.get("MeowMining");
  const meowMiningContract = await ethers.getContractAt('MeowMining', MEOW_MINING_ADDR.address);
  const wNativeRelayer = await deployments.get('WNativeRelayer');
  const wNativeRelayerContract = await ethers.getContractAt('WNativeRelayer', wNativeRelayer.address);
  const ALLOC_POINT_FOR_DEPOSIT = 0;
  const ALLOC_POINT_FOR_OPEN_POSITION = 0;

  const VAULTS = [
    {
      VAULT_NAME: "FTM",
      BASE_TOKEN: process.env.wNative,
      NAME: "Interest Bearing FTM",
      SYMBOL: "ibFTM",
      DECIMALS: "18"
    },
    {
      VAULT_NAME: "BTC",
      BASE_TOKEN: process.env.BTC,
      NAME: "Interest Bearing BTC",
      SYMBOL: "ibBTC",
      DECIMALS: "8"
    },
    {
      VAULT_NAME: "USDC",
      BASE_TOKEN: process.env.USDC,
      NAME: "Interest Bearing USDC",
      SYMBOL: "ibUSDC",
      DECIMALS: "6"
    },
    {
      VAULT_NAME: "fUSDT",
      BASE_TOKEN: process.env.fUSDT,
      NAME: "Interest Bearing fUSDT",
      SYMBOL: "ibfUSDT",
      DECIMALS: "6"
    },
    {
      VAULT_NAME: "DAI",
      BASE_TOKEN: process.env.DAI,
      NAME: "Interest Bearing DAI",
      SYMBOL: "ibDAI",
      DECIMALS: "18"
    },
    {
      VAULT_NAME: "ETH",
      BASE_TOKEN: process.env.ETH,
      NAME: "Interest Bearing ETH",
      SYMBOL: "ibETH",
      DECIMALS: "18"
    },
    {
      VAULT_NAME: "BOO",
      BASE_TOKEN: process.env.BOO,
      NAME: "Interest Bearing BOO",
      SYMBOL: "ibBOO",
      DECIMALS: "18"
    }
  ]

  for (let i = 0; i < VAULTS.length; i++) {

    const CONFIG = await deployments.get(`ConfigurableInterestVaultConfig_${VAULTS[i].VAULT_NAME}`);
    const BASE_TOKEN = VAULTS[i].BASE_TOKEN;
    const NAME = VAULTS[i].NAME;
    const SYMBOL = VAULTS[i].SYMBOL;
    const DECIMALS = VAULTS[i].DECIMALS;

    console.log("_____________________________________________________________\n");
    console.log(`Deploying debt${VAULTS[i].SYMBOL} Token`);
    const DebtToken = (await ethers.getContractFactory(
      "DebtToken",
      (await ethers.getSigners())[0]
    )) as DebtToken__factory;
    const debtToken = await upgrades.deployProxy(DebtToken, [
      `debt${VAULTS[i].SYMBOL}`, `debt${VAULTS[i].SYMBOL}`, VAULTS[i].DECIMALS]);
    await debtToken.deployed();
    const implAddr_debt = await hre.upgrades.erc1967.getImplementationAddress(debtToken.address);
    await deployments.save(`DebtToken_${VAULTS[i].VAULT_NAME}`, { address: debtToken.address, implementation: implAddr_debt } as DeploymentSubmission)
    console.log(`Deployed ${VAULTS[i].VAULT_NAME} DebtToken at ${debtToken.address}`);
    if (!(await checkIsVerified(implAddr_debt))) {
      console.log("impl: ", implAddr_debt);
      await hre.run("verify:verify", {
        address: implAddr_debt,
      })
    }
    WriteLogs(`DebtToken_${VAULTS[i].VAULT_NAME}: `, "Proxy: ", debtToken.address, "impl: ", implAddr_debt);

    await new Promise(resolve => setTimeout(resolve, 50000));

    console.log(`Deploying ${VAULTS[i].VAULT_NAME} Vault`);
    const Vault = (await ethers.getContractFactory(
      'Vault',
      (await ethers.getSigners())[0]
    )) as Vault__factory;
    const vault = await upgrades.deployProxy(
      Vault, [CONFIG.address, BASE_TOKEN, NAME, SYMBOL, DECIMALS, debtToken.address]
    ) as Vault;
    await vault.deployed();
    const implAddr_vault = await hre.upgrades.erc1967.getImplementationAddress(vault.address);
    await deployments.save(`Vault_${VAULTS[i].VAULT_NAME}`, { address: vault.address, implementation: implAddr_vault } as DeploymentSubmission)
    console.log(`${VAULTS[i].VAULT_NAME} Vault deployed at ${vault.address}`);
    if (!(await checkIsVerified(implAddr_vault))) {
      console.log("impl: ", implAddr_vault);
      await hre.run("verify:verify", {
        address: implAddr_vault,
      })
    }
    WriteLogs(`Vault_${VAULTS[i].VAULT_NAME}: `, "Proxy: ", vault.address, "impl: ", implAddr_vault);
    await new Promise(resolve => setTimeout(resolve, 50000));

    console.log(`Set okHolders on ${VAULTS[i].VAULT_NAME} DebtToken to be ${VAULTS[i].VAULT_NAME} Vault and MeowMining`)
    await debtToken.setOkHolders([vault.address, MEOW_MINING_ADDR.address], true);
    await new Promise(resolve => setTimeout(resolve, 50000));
    console.log("✅ Done");

    console.log(`Transferring ownership of ${VAULTS[i].VAULT_NAME} debtToken to ${VAULTS[i].VAULT_NAME} Vault`);
    await debtToken.transferOwnership(vault.address);
    await new Promise(resolve => setTimeout(resolve, 50000));
    console.log("✅ Done");

    console.log(`Create a ${VAULTS[i].VAULT_NAME} debtToken pool on MeowMining`);
    await meowMiningContract.addPool(ALLOC_POINT_FOR_OPEN_POSITION, (await vault.debtToken()), { gasLimit: '2000000' });
    console.log("Waiting for MeowMining to update");
    await new Promise(resolve => setTimeout(resolve, 50000));
    console.log("✅ Done");

    console.log(`Link pool with ${VAULTS[i].VAULT_NAME} Vault`);
    await vault.setMeowMiningPoolId((await meowMiningContract.poolLength()).sub(1), { gasLimit: '2000000' });
    await new Promise(resolve => setTimeout(resolve, 50000));
    console.log("✅ Done");

    console.log(`Create an ibToken ${VAULTS[i].VAULT_NAME} pool on MeowMining`);
    await meowMiningContract.addPool(ALLOC_POINT_FOR_DEPOSIT, vault.address, { gasLimit: '2000000' });
    await new Promise(resolve => setTimeout(resolve, 50000));
    console.log("✅ Done");

    console.log("Whitelisting Vault on WNativeRelayer Contract");
    await wNativeRelayerContract.setCallerOk([vault.address], true);
    await new Promise(resolve => setTimeout(resolve, 50000));
    console.log("✅ Done")

  }

};

export default func;
func(hre);