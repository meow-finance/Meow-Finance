import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';
import { QuickswapStrategyAddTwoSidesOptimal__factory } from '../../../typechain';
const hre = require("hardhat");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments } = hre;

  const ROUTER = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';

  // === MATIC === //
  const vault_MATIC = await deployments.get('Vault_MATIC');

  console.log("Deploying QuickswapStrategyAddTwosidesOptimal contract for MATIC");
  const QuickswapStrategyAddTwoSidesOptimal_MATIC = (await ethers.getContractFactory(
    'QuickswapStrategyAddTwoSidesOptimal',
    (await ethers.getSigners())[0]
  )) as QuickswapStrategyAddTwoSidesOptimal__factory;
  const quickswapStrategyAddTwoSidesOptimal_MATIC = await upgrades.deployProxy(
    QuickswapStrategyAddTwoSidesOptimal_MATIC, [ROUTER, vault_MATIC.address]
  );
  await quickswapStrategyAddTwoSidesOptimal_MATIC.deployed();
  await deployments.save('QuickswapStrategyAddTwoSidesOptimal_MATIC', { address: quickswapStrategyAddTwoSidesOptimal_MATIC.address } as DeploymentSubmission)
  console.log(`Deployed at ${quickswapStrategyAddTwoSidesOptimal_MATIC.address}`);

  // ========== //

  // === USDC === //
  const vault_USDC = await deployments.get('Vault_USDC');

  console.log("Deploying QuickswapStrategyAddTwosidesOptimal contract for USDC");
  const QuickswapStrategyAddTwoSidesOptimal_USDC = (await ethers.getContractFactory(
    'QuickswapStrategyAddTwoSidesOptimal',
    (await ethers.getSigners())[0]
  )) as QuickswapStrategyAddTwoSidesOptimal__factory;
  const quickswapStrategyAddTwoSidesOptimal_USDC = await upgrades.deployProxy(
    QuickswapStrategyAddTwoSidesOptimal_USDC, [ROUTER, vault_USDC.address]
  );
  await quickswapStrategyAddTwoSidesOptimal_USDC.deployed();
  await deployments.save('QuickswapStrategyAddTwoSidesOptimal_USDC', { address: quickswapStrategyAddTwoSidesOptimal_USDC.address } as DeploymentSubmission)
  console.log(`Deployed at ${quickswapStrategyAddTwoSidesOptimal_USDC.address}`);

  // ========== //

  // === USDT === //
  const vault_USDT = await deployments.get('Vault_USDT');

  console.log("Deploying QuickswapStrategyAddTwosidesOptimal contract for USDT");
  const QuickswapStrategyAddTwoSidesOptimal_USDT = (await ethers.getContractFactory(
    'QuickswapStrategyAddTwoSidesOptimal',
    (await ethers.getSigners())[0]
  )) as QuickswapStrategyAddTwoSidesOptimal__factory;
  const quickswapStrategyAddTwoSidesOptimal_USDT = await upgrades.deployProxy(
    QuickswapStrategyAddTwoSidesOptimal_USDT, [ROUTER, vault_USDT.address]
  );
  await quickswapStrategyAddTwoSidesOptimal_USDT.deployed();
  await deployments.save('QuickswapStrategyAddTwoSidesOptimal_USDT', { address: quickswapStrategyAddTwoSidesOptimal_USDT.address } as DeploymentSubmission)
  console.log(`Deployed at ${quickswapStrategyAddTwoSidesOptimal_USDT.address}`);

  // ========== //

  // === DAI === //
  const vault_DAI = await deployments.get('Vault_DAI');

  console.log("Deploying QuickswapStrategyAddTwosidesOptimal contract for DAI");
  const QuickswapStrategyAddTwoSidesOptimal_DAI = (await ethers.getContractFactory(
    'QuickswapStrategyAddTwoSidesOptimal',
    (await ethers.getSigners())[0]
  )) as QuickswapStrategyAddTwoSidesOptimal__factory;
  const quickswapStrategyAddTwoSidesOptimal_DAI = await upgrades.deployProxy(
    QuickswapStrategyAddTwoSidesOptimal_DAI, [ROUTER, vault_DAI.address]
  );
  await quickswapStrategyAddTwoSidesOptimal_DAI.deployed();
  await deployments.save('QuickswapStrategyAddTwoSidesOptimal_DAI', { address: quickswapStrategyAddTwoSidesOptimal_DAI.address } as DeploymentSubmission)
  console.log(`Deployed at ${quickswapStrategyAddTwoSidesOptimal_DAI.address}`);

  // ========== //

  // === WETH === //
  const vault_WETH = await deployments.get('Vault_WETH');

  console.log("Deploying QuickswapStrategyAddTwosidesOptimal contract for WETH");
  const QuickswapStrategyAddTwoSidesOptimal_WETH = (await ethers.getContractFactory(
    'QuickswapStrategyAddTwoSidesOptimal',
    (await ethers.getSigners())[0]
  )) as QuickswapStrategyAddTwoSidesOptimal__factory;
  const quickswapStrategyAddTwoSidesOptimal_WETH = await upgrades.deployProxy(
    QuickswapStrategyAddTwoSidesOptimal_WETH, [ROUTER, vault_WETH.address]
  );
  await quickswapStrategyAddTwoSidesOptimal_WETH.deployed();
  await deployments.save('QuickswapStrategyAddTwoSidesOptimal_WETH', { address: quickswapStrategyAddTwoSidesOptimal_WETH.address } as DeploymentSubmission)
  console.log(`Deployed at ${quickswapStrategyAddTwoSidesOptimal_WETH.address}`);

  // ========== //

  // === WBTC === //
  const vault_WBTC = await deployments.get('Vault_WBTC');

  console.log("Deploying QuickswapStrategyAddTwosidesOptimal contract for WBTC");
  const QuickswapStrategyAddTwoSidesOptimal_WBTC = (await ethers.getContractFactory(
    'QuickswapStrategyAddTwoSidesOptimal',
    (await ethers.getSigners())[0]
  )) as QuickswapStrategyAddTwoSidesOptimal__factory;
  const quickswapStrategyAddTwoSidesOptimal_WBTC = await upgrades.deployProxy(
    QuickswapStrategyAddTwoSidesOptimal_WBTC, [ROUTER, vault_WBTC.address]
  );
  await quickswapStrategyAddTwoSidesOptimal_WBTC.deployed();
  await deployments.save('QuickswapStrategyAddTwoSidesOptimal_WBTC', { address: quickswapStrategyAddTwoSidesOptimal_WBTC.address } as DeploymentSubmission)
  console.log(`Deployed at ${quickswapStrategyAddTwoSidesOptimal_WBTC.address}`);

  // ========== //

};

export default func;
func(hre);