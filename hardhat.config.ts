import { config as dotEnvConfig } from "dotenv";
import "@nomiclabs/hardhat-etherscan";

dotEnvConfig();

import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import "hardhat-deploy";
import "solidity-coverage";

module.exports = {
  defaultNetwork: 'testmaticmainnet',
  networks: {
    fork_mainnet: {
      url: 'http://127.0.0.1:8545',
      accounts: [process.env.FORK_MAINNET_PRIVATE_KEY],
      gas: 12000000,
      network_id: "9999"
    },
    bsctestnet: {
      url: "https://data-seed-prebsc-1-s2.binance.org:8545/",
      chainId: 97,
      gas: "auto",
      gasPrice: 20000000000,
      accounts: [process.env.BSC_TESTNET_PRIVATE_KEY],
    },
    bscmainnet: {
      url: 'https://bsc-dataseed1.defibit.io/',
      chainId: 56,
      accounts: [process.env.BSC_MAINNET_PRIVATE_KEY],
    },
    maticmainnet: { 
      // url: "https://rpc-mainnet.matic.network",
      // url: "https://rpc-mainnet.maticvigil.com",
      // url: "https://rpc-mainnet.matic.quiknode.pro",
      url: "https://matic-mainnet.chainstacklabs.com",
      chainId: 137,
      // gasPrice: 150000000000,
      gas: "auto",
      gasPrice: "auto",
      accounts: [process.env.MATIC_MAINNET_PRIVATE_KEY],
    },
    testmaticmainnet: { 
      // url: "https://rpc-mainnet.matic.network",
      // url: "https://rpc-mainnet.maticvigil.com",
      url: "https://rpc-mainnet.matic.quiknode.pro",
      // url: "https://matic-mainnet.chainstacklabs.com",
      chainId: 137,
      gasPrice: 150000000000,
      gas: "auto",
      // gasPrice: "auto",
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
    // apiKey: process.env.ethApi//ETH-Etherscan
    // apiKey: process.env.bscApi //BSC-BSCScan
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