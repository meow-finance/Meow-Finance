import { config as dotEnvConfig } from "dotenv";
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';
import { SpookyswapWorker, SpookyswapWorker__factory } from '../../../../typechain';
import hre from "hardhat";
dotEnvConfig({ path: `.env.${process.env.NODE_ENV}` });
import { checkIsVerified, WriteLogs } from '../../../../global/function';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts } = hre;
    const { deployer } = await getNamedAccounts();

    const ROUTER = process.env.SpookyRouter;
    const MASTERCHEF = process.env.SpookyMasterChef;
    const WORKER_CONFIG = await deployments.get('WorkerConfig');
    const WORKER_CONFIG_CONTRACT = await ethers.getContractAt('WorkerConfig', WORKER_CONFIG.address);
    const ADD_STRAT = await deployments.get('SpookyswapStrategyAddBaseTokenOnly');
    const ADD_STRAT_CONTRACT = await ethers.getContractAt('SpookyswapStrategyAddBaseTokenOnly', ADD_STRAT.address);
    const LIQ_STRAT = await deployments.get('SpookyswapStrategyLiquidate');
    const LIQ_STRAT_CONTRACT = await ethers.getContractAt('SpookyswapStrategyLiquidate', LIQ_STRAT.address);
    const STRATEGY_WITHDRAW_MINIMIZE_TRADING = await deployments.get('SpookyswapStrategyWithdrawMinimizeTrading');
    const MINIMIZE_STRAT_CONTRACT = await ethers.getContractAt('SpookyswapStrategyWithdrawMinimizeTrading', STRATEGY_WITHDRAW_MINIMIZE_TRADING.address);
    const REINVEST_BOT = [process.env.REINVEST_BOT || deployer];
    const REINVEST_BOUNTY_BPS = '500';

    const VAULTS = [
        {
            VAULT_NAME: "FTM",
            BASE_TOKEN: process.env.wNative,
            WORKERS: [
                {
                    WORKER_NAME: "USDC-FTM Spooky Worker",
                    POOL_ID: 2,
                    WORK_FACTOR: '7000',
                    KILL_FACTOR: '8333',
                    MAX_PRICE_DIFF: '11000'
                },
                {
                    WORKER_NAME: "ETH-FTM Spooky Worker",
                    POOL_ID: 5,
                    WORK_FACTOR: '7000',
                    KILL_FACTOR: '8333',
                    MAX_PRICE_DIFF: '11000'
                },
                {
                    WORKER_NAME: "fUSDT-FTM Spooky Worker",
                    POOL_ID: 1,
                    WORK_FACTOR: '7000',
                    KILL_FACTOR: '8333',
                    MAX_PRICE_DIFF: '11000'
                },
                {
                    WORKER_NAME: "DAI-FTM Spooky Worker",
                    POOL_ID: 3,
                    WORK_FACTOR: '7000',
                    KILL_FACTOR: '8333',
                    MAX_PRICE_DIFF: '11000'
                },
                {
                    WORKER_NAME: "BTC-FTM Spooky Worker",
                    POOL_ID: 4,
                    WORK_FACTOR: '7000',
                    KILL_FACTOR: '8333',
                    MAX_PRICE_DIFF: '11000'
                },
                {
                    WORKER_NAME: "BNB-FTM Spooky Worker",
                    POOL_ID: 19,
                    WORK_FACTOR: '7000',
                    KILL_FACTOR: '8333',
                    MAX_PRICE_DIFF: '11000'
                },
                {
                    WORKER_NAME: "BOO-FTM Spooky Worker",
                    POOL_ID: 0,
                    WORK_FACTOR: '7000',
                    KILL_FACTOR: '8333',
                    MAX_PRICE_DIFF: '11000'
                },
                {
                    WORKER_NAME: "LINK-FTM Spooky Worker",
                    POOL_ID: 6,
                    WORK_FACTOR: '7000',
                    KILL_FACTOR: '8333',
                    MAX_PRICE_DIFF: '11000'
                },
                {
                    WORKER_NAME: "SUSHI-FTM Spooky Worker",
                    POOL_ID: 10,
                    WORK_FACTOR: '7000',
                    KILL_FACTOR: '8333',
                    MAX_PRICE_DIFF: '11000'
                }
            ]
        },
        {
            VAULT_NAME: "BTC",
            BASE_TOKEN: process.env.BTC,
            WORKERS: [
                {
                    WORKER_NAME: "WFTM-BTC Spooky Worker",
                    POOL_ID: 4,
                    WORK_FACTOR: '7000',
                    KILL_FACTOR: '8333',
                    MAX_PRICE_DIFF: '11000'
                }
            ]
        },
        {
            VAULT_NAME: "USDC",
            BASE_TOKEN: process.env.USDC,
            WORKERS: [
                {
                    WORKER_NAME: "WFTM-USDC Spooky Worker",
                    POOL_ID: 2,
                    WORK_FACTOR: '7000',
                    KILL_FACTOR: '8333',
                    MAX_PRICE_DIFF: '11000'
                }
            ]
        },
        {
            VAULT_NAME: "fUSDT",
            BASE_TOKEN: process.env.fUSDT,
            WORKERS: [
                {
                    WORKER_NAME: "WFTM-fUSDT Spooky Worker",
                    POOL_ID: 1,
                    WORK_FACTOR: '7000',
                    KILL_FACTOR: '8333',
                    MAX_PRICE_DIFF: '11000'
                }
            ]
        },
        {
            VAULT_NAME: "DAI",
            BASE_TOKEN: process.env.DAI,
            WORKERS: [
                {
                    WORKER_NAME: "WFTM-DAI Spooky Worker",
                    POOL_ID: 3,
                    WORK_FACTOR: '7000',
                    KILL_FACTOR: '8333',
                    MAX_PRICE_DIFF: '11000'
                }
            ]
        },
        {
            VAULT_NAME: "ETH",
            BASE_TOKEN: process.env.ETH,
            WORKERS: [
                {
                    WORKER_NAME: "WFTM-ETH Spooky Worker",
                    POOL_ID: 5,
                    WORK_FACTOR: '7000',
                    KILL_FACTOR: '8333',
                    MAX_PRICE_DIFF: '11000'
                }
            ]
        },
        {
            VAULT_NAME: "BOO",
            BASE_TOKEN: process.env.BOO,
            WORKERS: [
                {
                    WORKER_NAME: "WFTM-BOO Spooky Worker",
                    POOL_ID: 0,
                    WORK_FACTOR: '7000',
                    KILL_FACTOR: '8333',
                    MAX_PRICE_DIFF: '11000'
                }
            ]
        }
    ]

    for (let i = 0; i < VAULTS.length; i++) {
        console.log("________________________________________________________\n");

        const VAULT = await deployments.get(`Vault_${VAULTS[i].VAULT_NAME}`);
        const VAULT_CONFIG = await deployments.get(`ConfigurableInterestVaultConfig_${VAULTS[i].VAULT_NAME}`);
        const VAULT_CONFIG_CONTRACT = await ethers.getContractAt('ConfigurableInterestVaultConfig', VAULT_CONFIG.address);
        const STRATEGY_TWOSIDES_OPTIMAL = await deployments.get(`SpookyswapStrategyAddTwoSidesOptimal_${VAULTS[i].VAULT_NAME}`);
        const TWOSIDES_STRAT_CONTRACT = await ethers.getContractAt('SpookyswapStrategyAddTwoSidesOptimal', STRATEGY_TWOSIDES_OPTIMAL.address);
        const STRATS = [STRATEGY_TWOSIDES_OPTIMAL.address, STRATEGY_WITHDRAW_MINIMIZE_TRADING.address];

        console.log(`>>> Deploying Worker for ${VAULTS[i].VAULT_NAME} Vault`);

        for (let j = 0; j < VAULTS[i].WORKERS.length; j++) {
            console.log("_________________________________________\n");
            console.log(`Deploying SpookyswapWorker for ${VAULTS[i].WORKERS[j].WORKER_NAME}`);


            const SpookyswapWorker = (await ethers.getContractFactory(
                'SpookyswapWorker',
                (await ethers.getSigners())[0]
            )) as SpookyswapWorker__factory;
            const spookyswapWorker = await upgrades.deployProxy(
                SpookyswapWorker, [
                VAULT.address, VAULTS[i].BASE_TOKEN, MASTERCHEF,
                ROUTER, VAULTS[i].WORKERS[j].POOL_ID, ADD_STRAT.address,
                LIQ_STRAT.address, REINVEST_BOUNTY_BPS
            ]
            ) as SpookyswapWorker;
            await spookyswapWorker.deployed();
            const implAddr = await hre.upgrades.erc1967.getImplementationAddress(spookyswapWorker.address);
            await deployments.save(`SpookyswapWorker ${VAULTS[i].WORKERS[j].WORKER_NAME}`, { address: spookyswapWorker.address, implementation: implAddr } as DeploymentSubmission)
            console.log(`Deployed ${VAULTS[i].WORKERS[j].WORKER_NAME} at ${spookyswapWorker.address}`);
            if (!(await checkIsVerified(implAddr))) {
                console.log("impl: ", implAddr);
                await hre.run("verify:verify", {
                    address: implAddr,
                })
            }
            WriteLogs(`SpookyswapWorker ${VAULTS[i].WORKERS[j].WORKER_NAME}: `, "Proxy: ", spookyswapWorker.address, "impl: ", implAddr);
            await new Promise(resolve => setTimeout(resolve, 90000));

            console.log(`>> Adding REINVEST_BOT`);
            await spookyswapWorker.setReinvestorOk(REINVEST_BOT, true);
            await new Promise(resolve => setTimeout(resolve, 90000));
            console.log("✅ Done");

            console.log('Adding Strategies');
            await spookyswapWorker.setStrategyOk(STRATS, true);
            await new Promise(resolve => setTimeout(resolve, 90000));
            console.log("✅ Done");

            console.log(`>> Whitelisting a worker on strats`);
            await ADD_STRAT_CONTRACT.setWorkersOk([spookyswapWorker.address], true);
            await new Promise(resolve => setTimeout(resolve, 90000));
            await LIQ_STRAT_CONTRACT.setWorkersOk([spookyswapWorker.address], true);
            await new Promise(resolve => setTimeout(resolve, 90000));
            await MINIMIZE_STRAT_CONTRACT.setWorkersOk([spookyswapWorker.address], true);
            await new Promise(resolve => setTimeout(resolve, 90000));
            await TWOSIDES_STRAT_CONTRACT.setWorkersOk([spookyswapWorker.address], true);
            await new Promise(resolve => setTimeout(resolve, 90000));
            console.log("✅ Done");

            console.log("Setting WorkerConfig");
            await WORKER_CONFIG_CONTRACT.setConfigs([spookyswapWorker.address], [{ acceptDebt: true, workFactor: VAULTS[i].WORKERS[j].WORK_FACTOR, killFactor: VAULTS[i].WORKERS[j].KILL_FACTOR, maxPriceDiff: VAULTS[i].WORKERS[j].MAX_PRICE_DIFF }]);
            await new Promise(resolve => setTimeout(resolve, 90000));
            console.log("✅ Done");

            console.log("Linking VaultConfig with WorkerConfig");
            await VAULT_CONFIG_CONTRACT.setWorkers([spookyswapWorker.address], [WORKER_CONFIG.address]);
            await new Promise(resolve => setTimeout(resolve, 90000));
            console.log("✅ Done");
        }
    }

};

export default func;
func(hre);