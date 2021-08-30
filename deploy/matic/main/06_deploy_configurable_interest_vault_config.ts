import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';
import { ConfigurableInterestVaultConfig__factory } from '../../../typechain';
const hre = require("hardhat");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments } = hre;

  const FAIR_LAUNCH_ADDR = await deployments.get("FairLaunch");
  const RESERVE_POOL_BPS = '1000';
  const KILL_PRIZE_BPS = '500';
  const INTEREST_MODEL = await deployments.get("TripleSlopeModel");
  const WNATV_ADDR = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
  const WNATV_RLY_ADDR = await deployments.get("WNativeRelayer");

  // === MATIC === //
  const MIN_DEBT_SIZE_MATIC = ethers.utils.parseEther('50');

  console.log("Deploying an MATIC configurableInterestVaultConfig contract");
  const ConfigurableInterestVaultConfig_MATIC = (await ethers.getContractFactory(
    'ConfigurableInterestVaultConfig',
    (await ethers.getSigners())[0]
  )) as ConfigurableInterestVaultConfig__factory;
  const configurableInterestVaultConfig_MATIC = await upgrades.deployProxy(
    ConfigurableInterestVaultConfig_MATIC,
    [MIN_DEBT_SIZE_MATIC, RESERVE_POOL_BPS, KILL_PRIZE_BPS,
      INTEREST_MODEL.address, WNATV_ADDR, WNATV_RLY_ADDR.address, FAIR_LAUNCH_ADDR.address]
  );
  await configurableInterestVaultConfig_MATIC.deployed();
  await deployments.save('ConfigurableInterestVaultConfig_MATIC', { address: configurableInterestVaultConfig_MATIC.address } as DeploymentSubmission)
  console.log(`Deployed MATIC configurableInterestVaultConfig at ${configurableInterestVaultConfig_MATIC.address}`);

  // ========== //

  // === USDC === //
  const MIN_DEBT_SIZE_USDC = ethers.utils.parseUnits('100', '6');

  console.log("Deploying an USDC configurableInterestVaultConfig contract");
  const ConfigurableInterestVaultConfig_USDC = (await ethers.getContractFactory(
    'ConfigurableInterestVaultConfig',
    (await ethers.getSigners())[0]
  )) as ConfigurableInterestVaultConfig__factory;
  const configurableInterestVaultConfig_USDC = await upgrades.deployProxy(
    ConfigurableInterestVaultConfig_USDC,
    [MIN_DEBT_SIZE_USDC, RESERVE_POOL_BPS, KILL_PRIZE_BPS,
      INTEREST_MODEL.address, WNATV_ADDR, WNATV_RLY_ADDR.address, FAIR_LAUNCH_ADDR.address]
  );
  await configurableInterestVaultConfig_USDC.deployed();
  await deployments.save('ConfigurableInterestVaultConfig_USDC', { address: configurableInterestVaultConfig_USDC.address } as DeploymentSubmission)
  console.log(`Deployed USDC configurableInterestVaultConfig at ${configurableInterestVaultConfig_USDC.address}`);

  // ========== //

  // === USDT === //
  const MIN_DEBT_SIZE_USDT = ethers.utils.parseUnits('100', '6');

  console.log("Deploying an USDT configurableInterestVaultConfig contract");
  const ConfigurableInterestVaultConfig_USDT = (await ethers.getContractFactory(
    'ConfigurableInterestVaultConfig',
    (await ethers.getSigners())[0]
  )) as ConfigurableInterestVaultConfig__factory;
  const configurableInterestVaultConfig_USDT = await upgrades.deployProxy(
    ConfigurableInterestVaultConfig_USDT,
    [MIN_DEBT_SIZE_USDT, RESERVE_POOL_BPS, KILL_PRIZE_BPS,
      INTEREST_MODEL.address, WNATV_ADDR, WNATV_RLY_ADDR.address, FAIR_LAUNCH_ADDR.address]
  );
  await configurableInterestVaultConfig_USDT.deployed();
  await deployments.save('ConfigurableInterestVaultConfig_USDT', { address: configurableInterestVaultConfig_USDT.address } as DeploymentSubmission)
  console.log(`Deployed USDT configurableInterestVaultConfig at ${configurableInterestVaultConfig_USDT.address}`);

  // ========== //

  // === DAI === //
  const MIN_DEBT_SIZE_DAI = ethers.utils.parseEther('100');

  console.log("Deploying an DAI configurableInterestVaultConfig contract");
  const ConfigurableInterestVaultConfig_DAI = (await ethers.getContractFactory(
    'ConfigurableInterestVaultConfig',
    (await ethers.getSigners())[0]
  )) as ConfigurableInterestVaultConfig__factory;
  const configurableInterestVaultConfig_DAI = await upgrades.deployProxy(
    ConfigurableInterestVaultConfig_DAI,
    [MIN_DEBT_SIZE_DAI, RESERVE_POOL_BPS, KILL_PRIZE_BPS,
      INTEREST_MODEL.address, WNATV_ADDR, WNATV_RLY_ADDR.address, FAIR_LAUNCH_ADDR.address]
  );
  await configurableInterestVaultConfig_DAI.deployed();
  await deployments.save('ConfigurableInterestVaultConfig_DAI', { address: configurableInterestVaultConfig_DAI.address } as DeploymentSubmission)
  console.log(`Deployed DAI configurableInterestVaultConfig at ${configurableInterestVaultConfig_DAI.address}`);

  // ========== //

  // === WETH === //
  const MIN_DEBT_SIZE_WETH = ethers.utils.parseEther('0.04');

  console.log("Deploying an WETH configurableInterestVaultConfig contract");
  const ConfigurableInterestVaultConfig_WETH = (await ethers.getContractFactory(
    'ConfigurableInterestVaultConfig',
    (await ethers.getSigners())[0]
  )) as ConfigurableInterestVaultConfig__factory;
  const configurableInterestVaultConfig_WETH = await upgrades.deployProxy(
    ConfigurableInterestVaultConfig_WETH,
    [MIN_DEBT_SIZE_WETH, RESERVE_POOL_BPS, KILL_PRIZE_BPS,
      INTEREST_MODEL.address, WNATV_ADDR, WNATV_RLY_ADDR.address, FAIR_LAUNCH_ADDR.address]
  );
  await configurableInterestVaultConfig_WETH.deployed();
  await deployments.save('ConfigurableInterestVaultConfig_WETH', { address: configurableInterestVaultConfig_WETH.address } as DeploymentSubmission)
  console.log(`Deployed WETH configurableInterestVaultConfig at ${configurableInterestVaultConfig_WETH.address}`);

  // ========== //

  // === WBTC === //
  const MIN_DEBT_SIZE_WBTC = ethers.utils.parseUnits('0.003', '8');

  console.log("Deploying an WBTC configurableInterestVaultConfig contract");
  const ConfigurableInterestVaultConfig_WBTC = (await ethers.getContractFactory(
    'ConfigurableInterestVaultConfig',
    (await ethers.getSigners())[0]
  )) as ConfigurableInterestVaultConfig__factory;
  const configurableInterestVaultConfig_WBTC = await upgrades.deployProxy(
    ConfigurableInterestVaultConfig_WBTC,
    [MIN_DEBT_SIZE_WBTC, RESERVE_POOL_BPS, KILL_PRIZE_BPS,
      INTEREST_MODEL.address, WNATV_ADDR, WNATV_RLY_ADDR.address, FAIR_LAUNCH_ADDR.address]
  );
  await configurableInterestVaultConfig_WBTC.deployed();
  await deployments.save('ConfigurableInterestVaultConfig_WBTC', { address: configurableInterestVaultConfig_WBTC.address } as DeploymentSubmission)
  console.log(`Deployed WBTC configurableInterestVaultConfig at ${configurableInterestVaultConfig_WBTC.address}`);

  // ========== //

};

export default func;
func(hre);