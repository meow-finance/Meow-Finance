import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';
import { SimplePriceOracle__factory } from '../../../typechain';
const hre = require("hardhat");


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const FEEDER_ADDR = deployer;

  // ===== Token ===== //

  const wmatic = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270';
  const weth = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619';
  const usdc = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
  const usdt = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
  const dai = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';
  const wbtc = '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6';
  const quick = '0x831753DD7087CaC61aB5644b308642cc1c33Dc13';


  const token0 = [wmatic, wmatic, wmatic, usdc, usdc, usdc, weth, weth, wbtc, wbtc];
  const token1 = [weth, quick, usdc, weth, dai, usdt, dai, usdt, weth, usdc];


  // ================ //

  // ===== MATIC ===== //

  const wmatic_weth_price = ethers.utils.parseEther('0.0003901732');
  const wmatic_quick_price = ethers.utils.parseEther('0.0018602684');
  const wmatic_usdc_price = '1239725';

  // ================ //

  // ===== USDC ===== //

  const usdc_weth_price = ethers.utils.parseEther('314624980');
  const usdc_dai_rice = ethers.utils.parseEther('999220920000');
  const usdc_usdt_price = ethers.utils.parseEther('0.99973319');


  // ================ //

  // ===== WETH ===== //

  const weth_dai_rice = ethers.utils.parseEther('3195.7935');
  const weth_usdt_rice = '3203115082';

  // ================ //

  // ===== WBTC ===== //

  const wbtc_weth_rice = ethers.utils.parseEther('143870350000');
  const wbtc_usdc_rice = ethers.utils.parseEther('459.92725');

  // ================ //

  // ===== Price ===== //

  const price = [wmatic_weth_price, wmatic_quick_price, wmatic_usdc_price, usdc_weth_price, usdc_dai_rice, usdc_usdt_price, weth_dai_rice, weth_usdt_rice, wbtc_weth_rice, wbtc_usdc_rice];

  // ================ //

  console.log(">> Deploying an SimplePriceOracle contract");
  const SimplePriceOracle = (await ethers.getContractFactory(
    'SimplePriceOracle',
    (await ethers.getSigners())[0]
  )) as SimplePriceOracle__factory;
  const simplePriceOracle = await upgrades.deployProxy(
    SimplePriceOracle, [FEEDER_ADDR]
  );
  await simplePriceOracle.deployed();
  await deployments.save('SimplePriceOracle', { address: simplePriceOracle.address } as DeploymentSubmission)
  console.log(`>> Deployed at ${simplePriceOracle.address}`);

  const priceOracle = await deployments.get('SimplePriceOracle');
  const priceOracleContract = await ethers.getContractAt('SimplePriceOracle', priceOracle.address);
  console.log("SimplePriceOracle: ", priceOracle.address);

  console.log("Set Price");
  await priceOracleContract['setPrices(address[],address[],uint256[])'](token0, token1, price, { gasLimit: '5000000' });
  console.log("✅ Done");

};

export default func;
func(hre);