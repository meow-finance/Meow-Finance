import { Contract } from "@ethersproject/contracts";
import { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";
import { deployments } from "hardhat";


export const MAX_INT: BigNumber = ethers.constants.MaxUint256;

export async function deploy(contractName:string, ...args:any[])
{
    return new Promise<Contract>(async (resolve,reject)=>{
        var token = await ethers.getContractFactory(contractName);
        var contract
        contract =  args.length == 0 ? ( await token.deploy() ) :  ( await token.deploy(args) ) ;
        await contract.deployed();
        resolve(contract);
    });
}

export async function GetContractDeployed(contractName_or_ABI:string , address_or_deploymentName:string|undefined = undefined , signer:Signer|undefined = undefined) {
    if (address_or_deploymentName == undefined || address_or_deploymentName == "")
    {
        let deployed = await deployments.get(contractName_or_ABI);
        address_or_deploymentName = deployed.address;
    }
    else
    {
        address_or_deploymentName = address_or_deploymentName.toUpperCase().substring(0,2) == "0X" ? 
            address_or_deploymentName :  (await deployments.get(address_or_deploymentName)).address
    }
    let contract:Contract|any= await ethers.getContractAt( contractName_or_ABI  , address_or_deploymentName );
    return signer != undefined ?  await contract.connect(signer) : contract;
}

export const ENABLELOG = true;
export async function LOG(...args:any[]) {
    if (!ENABLELOG) return;
    var _log = console.log;
    _log.apply(console,args);
}

export function toEther(value:number|string , decimal:number = 18) {
    if (typeof(value) == "number") value = value.toFixed(decimal);
    if (decimal != 18)
    {
        return ethers.utils.parseUnits( value , decimal  );
    }
    else
    {
        return ethers.utils.parseEther(value);
    }
}

export function toString(value:BigNumber|undefined , decimal:number = 18) {
    if(value == undefined) return "";
    let convert = value.toString();
    if (value.toString().length < 18)
    {
      while(convert.length <= 18)
      {
          convert = "0" + convert;
      }
    }
  let val = Number.parseFloat(convert.substring(0 ,convert.length-decimal) + "." +  convert.substring(convert.length-decimal));
  return val.toString() == "NaN" ? convert.substring(0 ,convert.length-decimal) + "." +  convert.substring(convert.length-decimal) : val;
}
