import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
const hre = require("hardhat");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;

    const { deployer } = await getNamedAccounts();

    await deploy('MeowToken', {
        from: deployer,
        log: true,
        deterministicDeployment: false,
    });

    const meowToken = await deployments.get('MeowToken');
    const meowTokenContract = await ethers.getContractAt('MeowToken', meowToken.address);
    console.log("MeowToken: ", meowToken.address);

    await hre.run("verify:verify", {
        address: meowToken.address,
        contract: "contracts/token/MeowToken.sol:MeowToken"
    })

    console.log("Minting 4,500,000 MeowTokens");
    await meowTokenContract.mint(deployer, ethers.utils.parseEther('4500000'), { gasLimit: '210000' });
    console.log("✅ Done")

};

export default func;
func(hre);