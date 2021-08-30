import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';
import { SushiswapStrategyAddTwoSidesOptimal__factory } from '../../../typechain';
const hre = require("hardhat");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments } = hre;

  const ROUTER = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';

  // === MATIC === //
  const vault_MATIC = await deployments.get('Vault_MATIC');

  console.log("Deploying SushiswapStrategyAddTwosidesOptimal contract for MATIC");
  const SushiswapStrategyAddTwoSidesOptimal_MATIC = (await ethers.getContractFactory(
    'SushiswapStrategyAddTwoSidesOptimal',
    (await ethers.getSigners())[0]
  )) as SushiswapStrategyAddTwoSidesOptimal__factory;
  const sushiswapStrategyAddTwoSidesOptimal_MATIC = await upgrades.deployProxy(
    SushiswapStrategyAddTwoSidesOptimal_MATIC, [ROUTER, vault_MATIC.address]
  );
  await sushiswapStrategyAddTwoSidesOptimal_MATIC.deployed();
  await deployments.save('SushiswapStrategyAddTwoSidesOptimal_MATIC', { address: sushiswapStrategyAddTwoSidesOptimal_MATIC.address } as DeploymentSubmission)
  console.log(`Deployed at ${sushiswapStrategyAddTwoSidesOptimal_MATIC.address}`);

  // ========== //

  // === USDC === //
  const vault_USDC = await deployments.get('Vault_USDC');

  console.log("Deploying SushiswapStrategyAddTwosidesOptimal contract for USDC");
  const SushiswapStrategyAddTwoSidesOptimal_USDC = (await ethers.getContractFactory(
    'SushiswapStrategyAddTwoSidesOptimal',
    (await ethers.getSigners())[0]
  )) as SushiswapStrategyAddTwoSidesOptimal__factory;
  const sushiswapStrategyAddTwoSidesOptimal_USDC = await upgrades.deployProxy(
    SushiswapStrategyAddTwoSidesOptimal_USDC, [ROUTER, vault_USDC.address]
  );
  await sushiswapStrategyAddTwoSidesOptimal_USDC.deployed();
  await deployments.save('SushiswapStrategyAddTwoSidesOptimal_USDC', { address: sushiswapStrategyAddTwoSidesOptimal_USDC.address } as DeploymentSubmission)
  console.log(`Deployed at ${sushiswapStrategyAddTwoSidesOptimal_USDC.address}`);

  // ========== //

  // === USDT === //
  const vault_USDT = await deployments.get('Vault_USDT');

  console.log("Deploying SushiswapStrategyAddTwosidesOptimal contract for USDT");
  const SushiswapStrategyAddTwoSidesOptimal_USDT = (await ethers.getContractFactory(
    'SushiswapStrategyAddTwoSidesOptimal',
    (await ethers.getSigners())[0]
  )) as SushiswapStrategyAddTwoSidesOptimal__factory;
  const sushiswapStrategyAddTwoSidesOptimal_USDT = await upgrades.deployProxy(
    SushiswapStrategyAddTwoSidesOptimal_USDT, [ROUTER, vault_USDT.address]
  );
  await sushiswapStrategyAddTwoSidesOptimal_USDT.deployed();
  await deployments.save('SushiswapStrategyAddTwoSidesOptimal_USDT', { address: sushiswapStrategyAddTwoSidesOptimal_USDT.address } as DeploymentSubmission)
  console.log(`Deployed at ${sushiswapStrategyAddTwoSidesOptimal_USDT.address}`);

  // ========== //

  // === DAI === //
  const vault_DAI = await deployments.get('Vault_DAI');

  console.log("Deploying SushiswapStrategyAddTwosidesOptimal contract for DAI");
  const SushiswapStrategyAddTwoSidesOptimal_DAI = (await ethers.getContractFactory(
    'SushiswapStrategyAddTwoSidesOptimal',
    (await ethers.getSigners())[0]
  )) as SushiswapStrategyAddTwoSidesOptimal__factory;
  const sushiswapStrategyAddTwoSidesOptimal_DAI = await upgrades.deployProxy(
    SushiswapStrategyAddTwoSidesOptimal_DAI, [ROUTER, vault_DAI.address]
  );
  await sushiswapStrategyAddTwoSidesOptimal_DAI.deployed();
  await deployments.save('SushiswapStrategyAddTwoSidesOptimal_DAI', { address: sushiswapStrategyAddTwoSidesOptimal_DAI.address } as DeploymentSubmission)
  console.log(`Deployed at ${sushiswapStrategyAddTwoSidesOptimal_DAI.address}`);

  // ========== //

  // === WETH === //
  const vault_WETH = await deployments.get('Vault_WETH');

  console.log("Deploying SushiswapStrategyAddTwosidesOptimal contract for WETH");
  const SushiswapStrategyAddTwoSidesOptimal_WETH = (await ethers.getContractFactory(
    'SushiswapStrategyAddTwoSidesOptimal',
    (await ethers.getSigners())[0]
  )) as SushiswapStrategyAddTwoSidesOptimal__factory;
  const sushiswapStrategyAddTwoSidesOptimal_WETH = await upgrades.deployProxy(
    SushiswapStrategyAddTwoSidesOptimal_WETH, [ROUTER, vault_WETH.address]
  );
  await sushiswapStrategyAddTwoSidesOptimal_WETH.deployed();
  await deployments.save('SushiswapStrategyAddTwoSidesOptimal_WETH', { address: sushiswapStrategyAddTwoSidesOptimal_WETH.address } as DeploymentSubmission)
  console.log(`Deployed at ${sushiswapStrategyAddTwoSidesOptimal_WETH.address}`);

  // ========== //

  // === WBTC === //
  const vault_WBTC = await deployments.get('Vault_WBTC');

  console.log("Deploying SushiswapStrategyAddTwosidesOptimal contract for WBTC");
  const SushiswapStrategyAddTwoSidesOptimal_WBTC = (await ethers.getContractFactory(
    'SushiswapStrategyAddTwoSidesOptimal',
    (await ethers.getSigners())[0]
  )) as SushiswapStrategyAddTwoSidesOptimal__factory;
  const sushiswapStrategyAddTwoSidesOptimal_WBTC = await upgrades.deployProxy(
    SushiswapStrategyAddTwoSidesOptimal_WBTC, [ROUTER, vault_WBTC.address]
  );
  await sushiswapStrategyAddTwoSidesOptimal_WBTC.deployed();
  await deployments.save('SushiswapStrategyAddTwoSidesOptimal_WBTC', { address: sushiswapStrategyAddTwoSidesOptimal_WBTC.address } as DeploymentSubmission)
  console.log(`Deployed at ${sushiswapStrategyAddTwoSidesOptimal_WBTC.address}`);

  // ========== //

};

export default func;
func(hre);