const axios = require('axios');
import { loadFixture } from '@ethereum-waffle/provider';
import * as fs from 'fs';
import { waitForDebugger } from 'inspector';
const hardhatConfig = require('../hardhat.config');
const hre = require("hardhat");

export function IsFork() {
  let currNetwork: string = hre.network.name;
  if (currNetwork.toUpperCase().includes("FORK") || currNetwork.toUpperCase().includes("HARDHAT"))
    return true;
  else
    return false;
}
export function checkIsVerified(address: string) {
  //https://api-testnet.polygonscan.com/api?module=contract&action=getabi&address=process.env.USDC&apikey=YourApiKeyToken
  return new Promise((resolve, reject) => {
    if (IsFork()) resolve(true);
    axios.get(hardhatConfig.etherscan.apiURL, {
      params: {
        apikey: hardhatConfig.etherscan.apiKey,
        address: address, //Replace with your Source Code GUID receipt above
        module: "contract",
        action: "getabi"
      }
    })
      .then(function (response: any) {
        //console.log(response.data);
        resolve(response.data.message == 'OK' ? true : false);
      })
      .catch(function (error: any) {
        console.log(error);
        resolve(false);
      });
  });
}

export function GetABIContractVerified(address: string) {
  return new Promise((resolve, reject) => {
    axios.get(hardhatConfig.etherscan.apiURL, {
      params: {
        apikey: hardhatConfig.etherscan.apiKey,
        address: address, //Replace with your Source Code GUID receipt above
        module: "contract",
        action: "getabi"
      }
    })
      .then(function (response: any) {
        //console.log(response.data);
        resolve(response.data.message == 'OK' ? response.data.result : "");
      })
      .catch(function (error: any) {
        console.log(error);
        resolve("");
      });
  });
}

export async function WriteLogs(header: string, ...args: any[]) {
  let content = header;
  content += args.length == 0 ? "" : "\r\n    ";
  await args.map((el) => {
    content += el + "  ";
  })
  args.length == 0 ? console.log(header) : console.log(header, args);
  fs.appendFile('file.log', content + "\r\n", err => {
    if (err) {
      console.error(err)
      return
    }
  })
}

export async function Wait(mstime: number) {
  return new Promise(async (resolve, rejects) => {
    let currNetwork: string = hre.network.name;
    if (IsFork()) resolve(true);
    (new Promise(resolve => setTimeout(resolve, mstime))).then(() => {
      resolve(true);
    })
      .catch(err => {
        console.log(err);
        rejects(false);
      });
  });
}