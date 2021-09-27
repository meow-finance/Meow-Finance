import { config as dotEnvConfig } from "dotenv";
import {accounts, API} from "./secrets.json";
dotEnvConfig({ path: `.env.${process.env.NODE_ENV}` });
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import "hardhat-deploy";
import "solidity-coverage";

module.exports = {
  defaultNetwork: 'fantommainnet',
  networks: {
    fork_mainnet: {
      url: 'http://127.0.0.1:8545',
      accounts: accounts.forkMainnet.length > 0 ? accounts.forkMainnet : accounts.testnet,
      gas: 12000000,
      network_id: "9999"
    },
    fantomtestnet: {
      // url: "https://rpc.testnet.fantom.network/",
      url: "https://xapi.testnet.fantom.network/lachesis",
      chainId: 4002,
      accounts: accounts.fantomTestnet.length > 0 ? accounts.fantomTestnet : accounts.testnet,
    },
    fantommainnet: {
      url: "https://rpc.ftm.tools/",
      // url: "https://rpcapi.fantom.network/",
      chainId: 250,
      gasPrice: "auto",
      accounts: accounts.fantomMainnet.length > 0 ? accounts.fantomMainnet : accounts.mainnet,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.4.18",
        settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        }
      }
      },
      {
        version: "0.5.16",
        settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        }
      }
      },
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
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        }
      },
    ]
  },
  etherscan: {
    apiKey: API.ApiKeyFantom, //Fantom-FTMscan
    apiURL: "https://api.ftmscan.com/api"

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