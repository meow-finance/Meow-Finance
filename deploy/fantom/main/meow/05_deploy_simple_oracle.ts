import { config as dotEnvConfig } from "dotenv";
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { SimplePriceOracle__factory } from '../../../../typechain';
import hre from "hardhat";
dotEnvConfig({ path: `.env.${process.env.NODE_ENV}` });
import { checkIsVerified, WriteLogs } from '../../../../global/function';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const FEEDER_ADDR = deployer;

  // ===== Token ===== //

  const wftm = process.env.wNative;
  const usdc = process.env.USDC;
  const eth = process.env.ETH;
  const fusdt = process.env.fUSDT;
  const dai = process.env.DAI;
  const btc = process.env.BTC;
  const bnb = process.env.BNB;
  const boo = process.env.BOO;
  const link = process.env.LINK;
  const sushi = process.env.SUSHI;

  const token0 = [
    usdc,
    wftm,
    fusdt,
    wftm,
    wftm,
    wftm,
    wftm,
    wftm,
    wftm
  ];
  const token1 = [
    wftm,
    eth,
    wftm,
    dai,
    btc,
    bnb,
    boo,
    link,
    sushi
  ];

  // ================ //

  // ===== Price ===== //

  const price = [
    "826185535851494800",
    "386571395069508",
    "824256221344950500",
    "1209605144284138678",
    "27485830723434",
    "3406296230594166",
    "71747772788957803",
    "48530111258172130",
    "108600034574441451"
  ]

  // ================ //

  // console.log(">> Deploying an SimplePriceOracle contract");
  // const SimplePriceOracle = (await hre.ethers.getContractFactory(
  //   'SimplePriceOracle',
  //   (await hre.ethers.getSigners())[0]
  // )) as SimplePriceOracle__factory;
  // const simplePriceOracle = await hre.upgrades.deployProxy(
  //   SimplePriceOracle, [FEEDER_ADDR]
  // );
  // await simplePriceOracle.deployed();
  // const implAddr = await hre.upgrades.erc1967.getImplementationAddress(simplePriceOracle.address);
  // await deployments.save('SimplePriceOracle', { address: simplePriceOracle.address, implementation: implAddr } as DeploymentSubmission)
  // console.log(`>> Deployed at ${simplePriceOracle.address}`);
  // console.log("impl: ", implAddr);

  // if (!(await checkIsVerified(implAddr))) {
  //   await hre.run("verify:verify", {
  //     address: implAddr,
  //   })
  //   WriteLogs("SimplePriceOracle: ", "Proxy: ", simplePriceOracle.address, "impl: ", implAddr);
  // } else {
  //   console.log("SimplePriceOracle impl is verified.");
  // }

  const priceOracle = await deployments.get('SimplePriceOracle');
  const priceOracleContract = await hre.ethers.getContractAt('SimplePriceOracle', priceOracle.address);
  console.log("SimplePriceOracle: ", priceOracle.address);

  console.log("Set Price");
  await priceOracleContract['setPrices(address[],address[],uint256[])'](token0, token1, price, { gasLimit: '5000000' });
  console.log("✅ Done");

};

export default func;
func(hre);