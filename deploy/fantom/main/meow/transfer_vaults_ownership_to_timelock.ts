import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import hre from "hardhat";
import { Wait } from '../../../../global/function';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const TIMELOCK = await deployments.get("Timelock");

  const VAULTS = [
    {
      VAULT_NAME: "FTM"
    },
    {
      VAULT_NAME: "BTC"
    },
    {
      VAULT_NAME: "USDC"
    },
    {
      VAULT_NAME: "fUSDT"
    },
    {
      VAULT_NAME: "DAI"
    },
    {
      VAULT_NAME: "ETH"
    },
    {
      VAULT_NAME: "BOO"
    }
  ]

  for (let i = 0; i < VAULTS.length; i++) {
    console.log("_____________________________________________________________\n");
    const VAULT_ADDR = await deployments.get(`Vault_${VAULTS[i].VAULT_NAME}`);
    const vaultContract = await ethers.getContractAt('Vault', VAULT_ADDR.address);
    let owner = await vaultContract.owner();
    console.log(`${VAULTS[i].VAULT_NAME} Vault owner:`, owner);
    if (owner == deployer) {
      console.log(`Transferring ownership of ${VAULTS[i].VAULT_NAME} Vault to TIMELOCK`);
      await vaultContract.transferOwnership(TIMELOCK.address, { gasLimit: '500000' });
      await new Promise(resolve => setTimeout(resolve, 90000));
      const newOwner = await vaultContract.owner();
      console.log(`${VAULTS[i].VAULT_NAME} Vault new owner:`, newOwner);
      console.log("✅ Done")
    }
  }

};

export default func;
func(hre);