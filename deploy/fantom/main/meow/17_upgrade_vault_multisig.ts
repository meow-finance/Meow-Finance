import { config as dotEnvConfig } from "dotenv";
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { ConfigurableInterestVaultConfig, NewValutPart2, NewValutPart2__factory, NewVault, Vault } from '../../../../typechain';
import { ethers, upgrades } from 'hardhat';
import hre from "hardhat";
dotEnvConfig({ path: `.env.${process.env.NODE_ENV}` });
import { checkIsVerified, Skip, WriteLogs } from '../../../../global/function';
import { GetContractDeployed, LOG } from "../../../../global/utils";
import * as fs from 'fs';

interface AddContract
{
   name:string;
   proxyAddress:string;
   impAddress:string;
}
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments } = hre;
  var exportsLog:AddContract[] = [];
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
  ];

  for await (const i of Array.from({length:VAULTS.length} , (v,i)=> i)) {
    // =====================Upgrade Vault Part 1===============================
    LOG("Upgrade Vault" , VAULTS[i].VAULT_NAME );
    const oldValut = await GetContractDeployed("Vault",`Vault_${VAULTS[i].VAULT_NAME}`) as Vault;
    const upgradeValutFactory = await ethers.getContractFactory("NewVault");
    const vaultPrepare = await upgrades.prepareUpgrade(oldValut.address, upgradeValutFactory);
    await WriteLogs(`PrepareUpgrade Vault ${VAULTS[i].VAULT_NAME}` , oldValut.address ,  vaultPrepare);
    exportsLog.push({ name : `Vault ${VAULTS[i].VAULT_NAME}`, proxyAddress:oldValut.address,impAddress:vaultPrepare });
    await deployments.save(`Vault_${VAULTS[i].VAULT_NAME}`, { address: oldValut.address, implementation: vaultPrepare } as DeploymentSubmission)
    if (!(await checkIsVerified(vaultPrepare))) {
        LOG("impl: ", vaultPrepare);
        await hre.run("verify:verify", {
        address: vaultPrepare,
        })
    } else {
        LOG(`${VAULTS[i].VAULT_NAME} Vault_ impl is verified.`);
    }
    if (!Skip()) {
        LOG(`Vault_${VAULTS[i].VAULT_NAME}: `, "Proxy: ", oldValut.address, "impl: ", vaultPrepare);
    }
    LOG("Upgrade Vault" , `Vault_${VAULTS[i].VAULT_NAME}` ,  oldValut.address , "With" , vaultPrepare  );
   // =====================MeowFee===============================
    // Set MeowFee address to vault config
    LOG("Set MeowFee Address");
    const configVault = await GetContractDeployed("ConfigurableInterestVaultConfig",`ConfigurableInterestVaultConfig_${VAULTS[i].VAULT_NAME}`) as ConfigurableInterestVaultConfig;
    LOG("configVault",configVault.address);
    const meowFee = await deployments.get('MMeowFee');
    LOG("meowFee",meowFee.address);
    await configVault.setmMeowFee(meowFee.address , {gasLimit:'200000'});
    LOG("✅ setmMeowFee address", meowFee.address);
    // =====================Upgrade Vault Part 2===============================
    LOG("deploy VaultPart2");
    const Vault2 = (await ethers.getContractFactory('NewValutPart2',  (await ethers.getSigners())[0])) as NewValutPart2__factory;
    const vaultPart2 = await upgrades.deployProxy( Vault2, []) as NewValutPart2;
    await vaultPart2.deployed();

    const implAddr_vault = await hre.upgrades.erc1967.getImplementationAddress(vaultPart2.address);
    await deployments.save(`VaultPart2_${VAULTS[i].VAULT_NAME}`, { address: vaultPart2.address, implementation: implAddr_vault } as DeploymentSubmission)
    if (!(await checkIsVerified(implAddr_vault))) {
        LOG("impl: ", implAddr_vault);
        await hre.run("verify:verify", {
        address: implAddr_vault,
        })
    } else {
        LOG(`${VAULTS[i].VAULT_NAME} Vault impl is verified.`);
    }
    if (!Skip()) {
        WriteLogs(`VaultPart2_${VAULTS[i].VAULT_NAME}: `, "Proxy: ", vaultPart2.address, "impl: ", implAddr_vault);
    }
    LOG(`✅${VAULTS[i].VAULT_NAME} VaultPart2 deployed at ${vaultPart2.address}`);
    //set vaultpart2 address to vault
    LOG("set vaultpart2 address to vault");
    const vault =  await GetContractDeployed("NewVault",`Vault_${VAULTS[i].VAULT_NAME}`) as NewVault;
    LOG(vault.address , vaultPart2.address)
    await vault.setValut2(vaultPart2.address, {gasLimit:'200000'});
    LOG("✅ setValut2 address to valut");
    //set vault address to vaultpart2
    LOG("set vault address to vaultpart2");
    await vaultPart2.setValut1(vault.address, {gasLimit:'200000'});
    LOG("✅ setValut1 address to vaultpart2");
    LOG("✅ Upgrade" , `Vault_${VAULTS[i].VAULT_NAME}`); 


    //export to upgrade vault on https://safe.fantom.network/#/safes/{address multisig}
    const storageFolder = `${process.cwd()}/VaultMultiSig.json`
    await fs.writeFileSync(storageFolder, JSON.stringify(exportsLog,null,"\t"),);
  }
}
export default func;
func(hre);