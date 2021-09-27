const axios = require('axios');
import * as fs from 'fs';
import { config as dotEnvConfig } from "dotenv";
const hardhatConfig = require('../hardhat.config');
import { ethers } from 'hardhat';
export function checkIsVerified(address:string)
{
    //https://api-testnet.polygonscan.com/api?module=contract&action=getabi&address=process.env.USDC&apikey=YourApiKeyToken
    return new Promise((resolve,reject) =>
    {
        axios.get(hardhatConfig.etherscan.apiURL, {
            params: {
                apikey:  hardhatConfig.etherscan.apiKey, 
                address: address, //Replace with your Source Code GUID receipt above
                module: "contract",
                action: "getabi"
            }
          })
          .then(function (response:any) {
            //console.log(response.data);
            resolve(response.data.message == 'OK' ? true : false);
          })
          .catch(function (error:any) {
            console.log(error);
            resolve(false);
          });
    });
    
}

export async function WriteLogs(header:string, ...args:any[])
{
  let content = header ;
  content += args.length == 0 ? "" : "\r\n    ";
  await args.map((el)=>
  {
    content += el +"  ";
  })
  args.length == 0 ? console.log(header) :console.log(header,args);
  fs.appendFile('file.log', content + "\r\n", err  => {
    if (err) {
      console.error(err)
      return
    }
  })
}
