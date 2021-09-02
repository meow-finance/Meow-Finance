import { config as dotEnvConfig } from "dotenv";
import "@nomiclabs/hardhat-etherscan";

dotEnvConfig();

import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import "hardhat-deploy";
import "solidity-coverage";

module.exports = {
  defaultNetwork: 'maticmainnet',
  networks: {
    fork_mainnet: {
      url: 'http://127.0.0.1:8545',
      accounts: [process.env.FORK_MAINNET_PRIVATE_KEY],
      gas: 12000000,
      network_id: "9999"
    },
    maticmainnet: { 
      url: "https://matic-mainnet.chainstacklabs.com",
      chainId: 137,
      gas: "auto",
      gasPrice: "auto",
      accounts: [process.env.MATIC_MAINNET_PRIVATE_KEY],
    },
    mumbaitestnet: { 
      url: "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
      accounts: [process.env.MUMBAI_TESTNET_PRIVATE_KEY],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  solidity: {
    compilers: [
      {version: "0.5.16",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        }
      }},
      {
        version: "0.6.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        }
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        }
      },
      {
        version: "0.6.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        }
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1
          }
          
        },
      },
      {
        version: "0.7.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        }
      },
      {
        version: "0.7.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        }
      }]
  },
  etherscan: {
    apiKey: process.env.maticApi //MATIC-Polygonscan
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  typechain: {
    outDir: './typechain',
    target: process.env.TYPECHAIN_TARGET || 'ethers-v5',
  },
};