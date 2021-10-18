import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import hre from "hardhat";
import { Wait, IsFork } from '../../../../global/function';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const TIMELOCK = await deployments.get("Timelock");

  const VAULTS = [
    {
      VAULT_NAME: "FTM",
      WORKERS: [
        {
          WORKER_NAME: "USDC-FTM Spooky Worker"
        },
        {
          WORKER_NAME: "ETH-FTM Spooky Worker"
        },
        {
          WORKER_NAME: "fUSDT-FTM Spooky Worker"
        },
        {
          WORKER_NAME: "DAI-FTM Spooky Worker"
        },
        {
          WORKER_NAME: "BTC-FTM Spooky Worker"
        },
        {
          WORKER_NAME: "BNB-FTM Spooky Worker"
        },
        {
          WORKER_NAME: "BOO-FTM Spooky Worker"
        },
        {
          WORKER_NAME: "LINK-FTM Spooky Worker"
        },
        {
          WORKER_NAME: "SUSHI-FTM Spooky Worker"
        }
      ]
    },
    {
      VAULT_NAME: "BTC",
      WORKERS: [
        {
          WORKER_NAME: "WFTM-BTC Spooky Worker"
        }
      ]
    },
    {
      VAULT_NAME: "USDC",
      WORKERS: [
        {
          WORKER_NAME: "WFTM-USDC Spooky Worker"
        }
      ]
    },
    {
      VAULT_NAME: "fUSDT",
      WORKERS: [
        {
          WORKER_NAME: "WFTM-fUSDT Spooky Worker"
        }
      ]
    },
    {
      VAULT_NAME: "DAI",
      WORKERS: [
        {
          WORKER_NAME: "WFTM-DAI Spooky Worker"
        }
      ]
    },
    {
      VAULT_NAME: "ETH",
      WORKERS: [
        {
          WORKER_NAME: "WFTM-ETH Spooky Worker"
        }
      ]
    },
    {
      VAULT_NAME: "BOO",
      WORKERS: [
        {
          WORKER_NAME: "WFTM-BOO Spooky Worker"
        }
      ]
    }
  ]

  for (let i = 0; i < VAULTS.length; i++) {
    for (let j = 0; j < VAULTS[i].WORKERS.length; j++) {
      console.log("_____________________________________________________________\n");
      const WORKER_ADDR = await deployments.get(`SpookyswapWorker ${VAULTS[i].WORKERS[j].WORKER_NAME}`);
      const workerContract = await ethers.getContractAt('SpookyswapWorker', WORKER_ADDR.address);
      let owner = await workerContract.owner();
      console.log(`${VAULTS[i].WORKERS[j].WORKER_NAME} SpookyswapWorker owner:`, owner);
      if (owner == deployer) {
        console.log(`Transferring ownership of ${VAULTS[i].WORKERS[j].WORKER_NAME} SpookyswapWorker to TIMELOCK`);
        await workerContract.transferOwnership(TIMELOCK.address, { gasLimit: '500000' });
        if (!IsFork()) {
          await new Promise(resolve => setTimeout(resolve, 90000));
        }
        const newOwner = await workerContract.owner();
        console.log(`${VAULTS[i].WORKERS[j].WORKER_NAME} SpookyswapWorker new owner:`, newOwner);
        console.log("✅ Done");
      }
    }
  }

};

export default func;
func(hre);