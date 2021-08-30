import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { DebtToken__factory, Vault, Vault__factory } from '../../../typechain';
import { ethers, upgrades } from 'hardhat';
const hre = require("hardhat");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments } = hre;

  const FAIR_LAUNCH_ADDR = await deployments.get("FairLaunch");
  const fairLaunchContract = await ethers.getContractAt('FairLaunch', FAIR_LAUNCH_ADDR.address);

  // === MATIC Vault === //
  const CONFIG_MATIC = await deployments.get("ConfigurableInterestVaultConfig_MATIC");
  const BASE_TOKEN_MATIC = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
  const NAME_MATIC = 'Interest Bearing MATIC';
  const SYMBOL_MATIC = 'ibMATIC';
  const ALLOC_POINT_FOR_DEPOSIT_MATIC = 0;
  const ALLOC_POINT_FOR_OPEN_POSITION_MATIC = 0;
  const DECIMALS_MATIC = 18;

  console.log(`Deploying debt${SYMBOL_MATIC}`)
  const DebtToken_MATIC = (await ethers.getContractFactory(
    "DebtToken",
    (await ethers.getSigners())[0]
  )) as DebtToken__factory;
  const debtToken_MATIC = await upgrades.deployProxy(DebtToken_MATIC, [
    `debt${SYMBOL_MATIC}`, `debt${SYMBOL_MATIC}`, DECIMALS_MATIC]);
  await debtToken_MATIC.deployed();
  await deployments.save('DebtToken_MATIC', { address: debtToken_MATIC.address } as DeploymentSubmission)
  console.log(`Deployed MATIC DebtToken at ${debtToken_MATIC.address}`);

  console.log('Deploying MATIC Vault');
  const Vault_MATIC = (await ethers.getContractFactory(
    'Vault',
    (await ethers.getSigners())[0]
  )) as Vault__factory;
  const vault_MATIC = await upgrades.deployProxy(
    Vault_MATIC, [CONFIG_MATIC.address, BASE_TOKEN_MATIC, NAME_MATIC, SYMBOL_MATIC, DECIMALS_MATIC, debtToken_MATIC.address]
  ) as Vault;
  await vault_MATIC.deployed();
  await deployments.save('Vault_MATIC', { address: vault_MATIC.address } as DeploymentSubmission)
  console.log(`MATIC Vault deployed at ${vault_MATIC.address}`);

  console.log("Set okHolders on MATIC DebtToken to be MATIC Vault and FairLaunch")
  await debtToken_MATIC.setOkHolders([vault_MATIC.address, FAIR_LAUNCH_ADDR.address], true)
  console.log("✅ Done");

  console.log("Transferring ownership of MATIC debtToken to MATIC Vault");
  await debtToken_MATIC.transferOwnership(vault_MATIC.address);
  console.log("✅ Done");

  console.log("Create a debtToken MATIC pool on FairLaunch");
  await fairLaunchContract.addPool(ALLOC_POINT_FOR_OPEN_POSITION_MATIC, (await vault_MATIC.debtToken()), { gasLimit: '2000000' });

  console.log("Waiting for Fairlaunch to update");
  await new Promise(resolve => setTimeout(resolve, 20000));

  console.log("Link pool with MATIC Vault");
  await vault_MATIC.setFairLaunchPoolId((await fairLaunchContract.poolLength()).sub(1), { gasLimit: '2000000' });
  console.log("✅ Done");

  console.log("Create an ibToken MATIC pool on FairLaunch");
  await fairLaunchContract.addPool(ALLOC_POINT_FOR_DEPOSIT_MATIC, vault_MATIC.address, { gasLimit: '2000000' });
  console.log("✅ Done");

  // ========== //

  // === USDC Vault === //
  const CONFIG_USDC = await deployments.get("ConfigurableInterestVaultConfig_USDC");
  const BASE_TOKEN_USDC = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
  const NAME_USDC = 'Interest Bearing USDC';
  const SYMBOL_USDC = 'ibUSDC';
  const ALLOC_POINT_FOR_DEPOSIT_USDC = 0;
  const ALLOC_POINT_FOR_OPEN_POSITION_USDC = 0;
  const DECIMALS_USDC = 6;

  console.log(`Deploying debt${SYMBOL_USDC}`)
  const DebtToken_USDC = (await ethers.getContractFactory(
    "DebtToken",
    (await ethers.getSigners())[0]
  )) as DebtToken__factory;
  const debtToken_USDC = await upgrades.deployProxy(DebtToken_USDC, [
    `debt${SYMBOL_USDC}`, `debt${SYMBOL_USDC}`, DECIMALS_USDC]);
  await debtToken_USDC.deployed();
  await deployments.save('DebtToken_USDC', { address: debtToken_USDC.address } as DeploymentSubmission)
  console.log(`Deployed USDC DebtToken at ${debtToken_USDC.address}`);

  console.log('Deploying USDC Vault');
  const Vault_USDC = (await ethers.getContractFactory(
    'Vault',
    (await ethers.getSigners())[0]
  )) as Vault__factory;
  const vault_USDC = await upgrades.deployProxy(
    Vault_USDC, [CONFIG_USDC.address, BASE_TOKEN_USDC, NAME_USDC, SYMBOL_USDC, DECIMALS_USDC, debtToken_USDC.address]
  ) as Vault;
  await vault_USDC.deployed();
  await deployments.save('Vault_USDC', { address: vault_USDC.address } as DeploymentSubmission)
  console.log(`USDC Vault deployed at ${vault_USDC.address}`);

  console.log("Set okHolders on USDC DebtToken to be USDC Vault and FairLaunch")
  await debtToken_USDC.setOkHolders([vault_USDC.address, FAIR_LAUNCH_ADDR.address], true)
  console.log("✅ Done");

  console.log("Transferring ownership of USDC debtToken to USDC Vault");
  await debtToken_USDC.transferOwnership(vault_USDC.address);
  console.log("✅ Done");

  console.log("Create a debtToken USDC pool on FairLaunch");
  await fairLaunchContract.addPool(ALLOC_POINT_FOR_OPEN_POSITION_USDC, (await vault_USDC.debtToken()), { gasLimit: '2000000' });

  console.log("Waiting for Fairlaunch to update");
  await new Promise(resolve => setTimeout(resolve, 20000));

  console.log("Link pool with USDC Vault");
  await vault_USDC.setFairLaunchPoolId((await fairLaunchContract.poolLength()).sub(1), { gasLimit: '2000000' });
  console.log("✅ Done");

  console.log("Create an ibToken USDC pool on FairLaunch");
  await fairLaunchContract.addPool(ALLOC_POINT_FOR_DEPOSIT_USDC, vault_USDC.address, { gasLimit: '2000000' });
  console.log("✅ Done");

  // ========== //

  // === USDT Vault === //
  const CONFIG_USDT = await deployments.get("ConfigurableInterestVaultConfig_USDT");
  const BASE_TOKEN_USDT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
  const NAME_USDT = 'Interest Bearing USDT';
  const SYMBOL_USDT = 'ibUSDT';
  const ALLOC_POINT_FOR_DEPOSIT_USDT = 0;
  const ALLOC_POINT_FOR_OPEN_POSITION_USDT = 0;
  const DECIMALS_USDT = 6;


  console.log(`Deploying debt${SYMBOL_USDT}`)
  const DebtToken_USDT = (await ethers.getContractFactory(
    "DebtToken",
    (await ethers.getSigners())[0]
  )) as DebtToken__factory;
  const debtToken_USDT = await upgrades.deployProxy(DebtToken_USDT, [
    `debt${SYMBOL_USDT}`, `debt${SYMBOL_USDT}`, DECIMALS_USDT]);
  await debtToken_USDT.deployed();
  await deployments.save('DebtToken_USDT', { address: debtToken_USDT.address } as DeploymentSubmission)
  console.log(`Deployed USDT DebtToken at ${debtToken_USDT.address}`);

  console.log('Deploying USDT Vault');
  const Vault_USDT = (await ethers.getContractFactory(
    'Vault',
    (await ethers.getSigners())[0]
  )) as Vault__factory;
  const vault_USDT = await upgrades.deployProxy(
    Vault_USDT, [CONFIG_USDT.address, BASE_TOKEN_USDT, NAME_USDT, SYMBOL_USDT, DECIMALS_USDT, debtToken_USDT.address]
  ) as Vault;
  await vault_USDT.deployed();
  await deployments.save('Vault_USDT', { address: vault_USDT.address } as DeploymentSubmission)
  console.log(`USDT Vault deployed at ${vault_USDT.address}`);

  console.log("Set okHolders on USDT DebtToken to be USDT Vault and FairLaunch")
  await debtToken_USDT.setOkHolders([vault_USDT.address, FAIR_LAUNCH_ADDR.address], true)
  console.log("✅ Done");

  console.log("Transferring ownership of USDT debtToken to USDT Vault");
  await debtToken_USDT.transferOwnership(vault_USDT.address);
  console.log("✅ Done");

  console.log("Create a debtToken USDT pool on FairLaunch");
  await fairLaunchContract.addPool(ALLOC_POINT_FOR_OPEN_POSITION_USDT, (await vault_USDT.debtToken()), { gasLimit: '2000000' });

  console.log("Waiting for Fairlaunch to update");
  await new Promise(resolve => setTimeout(resolve, 20000));

  console.log("Link pool with USDT Vault");
  await vault_USDT.setFairLaunchPoolId((await fairLaunchContract.poolLength()).sub(1), { gasLimit: '2000000' });
  console.log("✅ Done");

  console.log("Create an ibToken USDT pool on FairLaunch");
  await fairLaunchContract.addPool(ALLOC_POINT_FOR_DEPOSIT_USDT, vault_USDT.address, { gasLimit: '2000000' });
  console.log("✅ Done");

  // ========== //

  // === DAI Vault === //
  const CONFIG_DAI = await deployments.get("ConfigurableInterestVaultConfig_DAI");
  const BASE_TOKEN_DAI = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';
  const NAME_DAI = 'Interest Bearing DAI';
  const SYMBOL_DAI = 'ibDAI';
  const ALLOC_POINT_FOR_DEPOSIT_DAI = 0;
  const ALLOC_POINT_FOR_OPEN_POSITION_DAI = 0;
  const DECIMALS_DAI = 18;

  console.log(`Deploying debt${SYMBOL_DAI}`)
  const DebtToken_DAI = (await ethers.getContractFactory(
    "DebtToken",
    (await ethers.getSigners())[0]
  )) as DebtToken__factory;
  const debtToken_DAI = await upgrades.deployProxy(DebtToken_DAI, [
    `debt${SYMBOL_DAI}`, `debt${SYMBOL_DAI}`, DECIMALS_DAI]);
  await debtToken_DAI.deployed();
  await deployments.save('DebtToken_DAI', { address: debtToken_DAI.address } as DeploymentSubmission)
  console.log(`Deployed DAI DebtToken at ${debtToken_DAI.address}`);

  console.log('Deploying DAI Vault');
  const Vault_DAI = (await ethers.getContractFactory(
    'Vault',
    (await ethers.getSigners())[0]
  )) as Vault__factory;
  const vault_DAI = await upgrades.deployProxy(
    Vault_DAI, [CONFIG_DAI.address, BASE_TOKEN_DAI, NAME_DAI, SYMBOL_DAI, DECIMALS_DAI, debtToken_DAI.address]
  ) as Vault;
  await vault_DAI.deployed();
  await deployments.save('Vault_DAI', { address: vault_DAI.address } as DeploymentSubmission)
  console.log(`DAI Vault deployed at ${vault_DAI.address}`);

  console.log("Set okHolders on DAI DebtToken to be DAI Vault and FairLaunch")
  await debtToken_DAI.setOkHolders([vault_DAI.address, FAIR_LAUNCH_ADDR.address], true)
  console.log("✅ Done");

  console.log("Transferring ownership of DAI debtToken to DAI Vault");
  await debtToken_DAI.transferOwnership(vault_DAI.address);
  console.log("✅ Done");

  console.log("Create a debtToken DAI pool on FairLaunch");
  await fairLaunchContract.addPool(ALLOC_POINT_FOR_OPEN_POSITION_DAI, (await vault_DAI.debtToken()), { gasLimit: '2000000' });

  console.log("Waiting for Fairlaunch to update");
  await new Promise(resolve => setTimeout(resolve, 20000));

  console.log("Link pool with DAI Vault");
  await vault_DAI.setFairLaunchPoolId((await fairLaunchContract.poolLength()).sub(1), { gasLimit: '2000000' });
  console.log("✅ Done");

  console.log("Create an ibToken DAI pool on FairLaunch");
  await fairLaunchContract.addPool(ALLOC_POINT_FOR_DEPOSIT_DAI, vault_DAI.address, { gasLimit: '2000000' });
  console.log("✅ Done");

  // ========== //

  // === WETH Vault === //
  const CONFIG_WETH = await deployments.get("ConfigurableInterestVaultConfig_WETH");
  const BASE_TOKEN_WETH = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619';
  const NAME_WETH = 'Interest Bearing WETH';
  const SYMBOL_WETH = 'ibWETH';
  const ALLOC_POINT_FOR_DEPOSIT_WETH = 0;
  const ALLOC_POINT_FOR_OPEN_POSITION_WETH = 0;
  const DECIMALS_WETH = 18;

  console.log(`Deploying debt${SYMBOL_WETH}`)
  const DebtToken_WETH = (await ethers.getContractFactory(
    "DebtToken",
    (await ethers.getSigners())[0]
  )) as DebtToken__factory;
  const debtToken_WETH = await upgrades.deployProxy(DebtToken_WETH, [
    `debt${SYMBOL_WETH}`, `debt${SYMBOL_WETH}`, DECIMALS_WETH]);
  await debtToken_WETH.deployed();
  await deployments.save('DebtToken_WETH', { address: debtToken_WETH.address } as DeploymentSubmission)
  console.log(`Deployed WETH DebtToken at ${debtToken_WETH.address}`);

  console.log('Deploying WETH Vault');
  const Vault_WETH = (await ethers.getContractFactory(
    'Vault',
    (await ethers.getSigners())[0]
  )) as Vault__factory;
  const vault_WETH = await upgrades.deployProxy(
    Vault_WETH, [CONFIG_WETH.address, BASE_TOKEN_WETH, NAME_WETH, SYMBOL_WETH, DECIMALS_WETH, debtToken_WETH.address]
  ) as Vault;
  await vault_WETH.deployed();
  await deployments.save('Vault_WETH', { address: vault_WETH.address } as DeploymentSubmission)
  console.log(`WETH Vault deployed at ${vault_WETH.address}`);

  console.log("Set okHolders on WETH DebtToken to be WETH Vault and FairLaunch")
  await debtToken_WETH.setOkHolders([vault_WETH.address, FAIR_LAUNCH_ADDR.address], true)
  console.log("✅ Done");

  console.log("Transferring ownership of WETH debtToken to WETH Vault");
  await debtToken_WETH.transferOwnership(vault_WETH.address);
  console.log("✅ Done");

  console.log("Create a debtToken WETH pool on FairLaunch");
  await fairLaunchContract.addPool(ALLOC_POINT_FOR_OPEN_POSITION_WETH, (await vault_WETH.debtToken()), { gasLimit: '2000000' });

  console.log("Waiting for Fairlaunch to update");
  await new Promise(resolve => setTimeout(resolve, 20000));

  console.log("Link pool with WETH Vault");
  await vault_WETH.setFairLaunchPoolId((await fairLaunchContract.poolLength()).sub(1), { gasLimit: '2000000' });
  console.log("✅ Done");

  console.log("Create an ibToken WETH pool on FairLaunch");
  await fairLaunchContract.addPool(ALLOC_POINT_FOR_DEPOSIT_WETH, vault_WETH.address, { gasLimit: '2000000' });
  console.log("✅ Done");

  // ========== //

  // === WBTC Vault === //
  const CONFIG_WBTC = await deployments.get("ConfigurableInterestVaultConfig_WBTC");
  const BASE_TOKEN_WBTC = '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6';
  const NAME_WBTC = 'Interest Bearing WBTC';
  const SYMBOL_WBTC = 'ibWBTC';
  const ALLOC_POINT_FOR_DEPOSIT_WBTC = 0;
  const ALLOC_POINT_FOR_OPEN_POSITION_WBTC = 0;
  const DECIMALS_WBTC = 8;

  console.log(`Deploying debt${SYMBOL_WBTC}`)
  const DebtToken_WBTC = (await ethers.getContractFactory(
    "DebtToken",
    (await ethers.getSigners())[0]
  )) as DebtToken__factory;
  const debtToken_WBTC = await upgrades.deployProxy(DebtToken_WBTC, [
    `debt${SYMBOL_WBTC}`, `debt${SYMBOL_WBTC}`, DECIMALS_WBTC]);
  await debtToken_WBTC.deployed();
  await deployments.save('DebtToken_WBTC', { address: debtToken_WBTC.address } as DeploymentSubmission)
  console.log(`Deployed WBTC DebtToken at ${debtToken_WBTC.address}`);

  console.log('Deploying WBTC Vault');
  const Vault_WBTC = (await ethers.getContractFactory(
    'Vault',
    (await ethers.getSigners())[0]
  )) as Vault__factory;
  const vault_WBTC = await upgrades.deployProxy(
    Vault_WBTC, [CONFIG_WBTC.address, BASE_TOKEN_WBTC, NAME_WBTC, SYMBOL_WBTC, DECIMALS_WBTC, debtToken_WBTC.address]
  ) as Vault;
  await vault_WBTC.deployed();
  await deployments.save('Vault_WBTC', { address: vault_WBTC.address } as DeploymentSubmission)
  console.log(`WBTC Vault deployed at ${vault_WBTC.address}`);

  console.log("Set okHolders on WBTC DebtToken to be WBTC Vault and FairLaunch")
  await debtToken_WBTC.setOkHolders([vault_WBTC.address, FAIR_LAUNCH_ADDR.address], true)
  console.log("✅ Done");

  console.log("Transferring ownership of WBTC debtToken to WBTC Vault");
  await debtToken_WBTC.transferOwnership(vault_WBTC.address);
  console.log("✅ Done");

  console.log("Create a debtToken WBTC pool on FairLaunch");
  await fairLaunchContract.addPool(ALLOC_POINT_FOR_OPEN_POSITION_WBTC, (await vault_WBTC.debtToken()), { gasLimit: '2000000' });

  console.log("Waiting for Fairlaunch to update");
  await new Promise(resolve => setTimeout(resolve, 20000));

  console.log("Link pool with WBTC Vault");
  await vault_WBTC.setFairLaunchPoolId((await fairLaunchContract.poolLength()).sub(1), { gasLimit: '2000000' });
  console.log("✅ Done");

  console.log("Create an ibToken WBTC pool on FairLaunch");
  await fairLaunchContract.addPool(ALLOC_POINT_FOR_DEPOSIT_WBTC, vault_WBTC.address, { gasLimit: '2000000' });
  console.log("✅ Done");

  // ========== //

  const wNativeRelayer = await deployments.get('WNativeRelayer');
  const wNativeRelayerContract = await ethers.getContractAt('WNativeRelayer', wNativeRelayer.address);

  console.log("Whitelisting Vault on WNativeRelayer Contract");
  await wNativeRelayerContract.setCallerOk([vault_MATIC.address, vault_USDC.address, vault_USDT.address, vault_DAI.address, vault_WETH.address, vault_WBTC.address], true);
  console.log("✅ Done")

};

export default func;
func(hre);