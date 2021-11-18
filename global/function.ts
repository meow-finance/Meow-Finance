
const axios = require('axios');
import * as fs from 'fs';
import { DeployResult } from 'hardhat-deploy/dist/types';
import { LOG } from './utils';
const hardhatConfig = require('../hardhat.config');
const hre = require("hardhat");
interface IOption
{
  MUST_VERIFY : undefined|boolean;
  MUST_SKIP : undefined|boolean;
  MUST_WAIT : undefined|boolean;
}

var instance:any = null;
class OPTION_CLASS
{
  MUST_VERIFY = true;
  MUST_SKIP = true;
  MUST_WAIT = true;

  constructor()
  {
    if (!instance) { 
      instance = this; 
      switch(process.env.FUNCMODE)
      {
        case "runall::fork":
          this.MUST_VERIFY = false;
          this.MUST_SKIP = true;
          this.MUST_WAIT = false;
          break;
        case "runall::main":
          this.MUST_VERIFY = true;
          this.MUST_SKIP = true;
          this.MUST_WAIT = true;
          break;
        case "run::fork":
          this.MUST_VERIFY = false;
          this.MUST_SKIP = false;
          this.MUST_WAIT = false;
          break;
        case "run::main":
          this.MUST_VERIFY = true;
          this.MUST_SKIP = false;
          this.MUST_WAIT = true;
          break;
      }
    }
    return instance;
  }
 
 async setOption(_MUST_SKIP = false , _MUST_VERIFY = false , _MUST_WAIT = false)
    {
      return  new Promise((resolve,reject) =>  { 
        this.MUST_SKIP = _MUST_SKIP;
        this.MUST_WAIT = _MUST_WAIT;
        this.MUST_VERIFY = _MUST_VERIFY;
        resolve(true)}
        );
    }
};

export var OPTION = new OPTION_CLASS;


export function Skip()
{
  if ( OPTION.MUST_SKIP != undefined) return OPTION.MUST_SKIP;
  let currNetwork:string = hre.network.name;
  if ((currNetwork.toUpperCase().includes("FORK") ||  currNetwork.toUpperCase().includes("HARDHAT")) && OPTION.MUST_SKIP == undefined) 
    return true;
  else
    return false;
}

export function checkIsVerified(address:string)
{
     if ( OPTION.MUST_VERIFY == false) return  new Promise((resolve,reject) =>  { resolve(true)});
    //https://api-testnet.polygonscan.com/api?module=contract&action=getabi&address=process.env.USDC&apikey=YourApiKeyToken
    return new Promise((resolve,reject) =>
    {
        if (Skip() && OPTION.MUST_VERIFY == undefined) resolve(true);
        axios.get(hardhatConfig.etherscan.apiURL, {
            params: {
                apikey:  hardhatConfig.etherscan.apiKey, 
                address: address, //Replace with your Source Code GUID receipt above
                module: "contract",
                action: "getabi"
            }
          })
          .then(function (response:any) {
            console.log(response.data , hardhatConfig.etherscan.apiURL);
            resolve(response.data.message == 'OK' ? true : false);
          })
          .catch(function (error:any) {
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
  for await (const el of args) {
    if (typeof el == 'object')
      content += JSON.stringify(el,null,"\t") + "\t";
    else
      content += el.toString() + "\t";
  }
  args.length == 0 ? console.log(header) : console.log(header, args);
  fs.appendFile('file.log', content + "\r\n", err => {
    if (err) {
      console.error(err);
      return;
    }
  });
}


export const msTime = 10*1000;
export async function  Wait(mstime:number|undefined = undefined , res: DeployResult|undefined = undefined ) {
  if ( OPTION.MUST_WAIT == false) return  new Promise((resolve,reject) =>  { resolve(true)});
  return new Promise(async (resolve,rejects)=>
  {
    if (mstime == undefined ) mstime = msTime;
    if (Skip() && OPTION.MUST_WAIT == undefined) resolve(true);
    LOG("Wait........"+mstime+"ms");
    startTimer(mstime/1000);
    let receipt = await res?.receipt;
    if ( receipt != undefined)
    {
        LOG(receipt);
        await (new Promise(resolve => setTimeout(resolve,mstime))).then(()=>
        {
          resolve(true);
        })
        .catch(err => 
          {
            console.log(err);
            rejects(false);
          });
    }
    else
    {
      await (new Promise(resolve => setTimeout(resolve,mstime))).then(()=>
      {
        resolve(true);
      })
      .catch(err => 
        {
          console.log(err);
          rejects(false);
        });
    }
  });
}
function startTimer(i:number) {
  console.group("count down")
  var countdownTimer = setInterval(function() {
      console.log(i);
      i = i - 1;
      if (i <= 0) {
          clearInterval(countdownTimer);
          console.groupEnd()
      }
  }, 1000);
}