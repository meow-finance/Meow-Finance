import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';
import { SushiswapWorker, SushiswapWorker__factory } from '../../../typechain';
const hre = require("hardhat");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments } = hre;

    const ROUTER = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
    const MASTERCHEF = '0x0769fd68dFb93167989C6f7254cd0D766Fb2841F';
    const WORKER_CONFIG = await deployments.get('WorkerConfig');
    const WORKER_CONFIG_CONTRACT = await ethers.getContractAt('WorkerConfig', WORKER_CONFIG.address);
    const ADD_STRAT = await deployments.get('SushiswapStrategyAddBaseTokenOnly');
    const ADD_STRAT_CONTRACT = await ethers.getContractAt('SushiswapStrategyAddBaseTokenOnly', ADD_STRAT.address);
    const LIQ_STRAT = await deployments.get('SushiswapStrategyLiquidate');
    const LIQ_STRAT_CONTRACT = await ethers.getContractAt('SushiswapStrategyLiquidate', LIQ_STRAT.address);
    const REINVEST_BOT = [""];
    const REINVEST_BOUNTY_BPS = '300';
    const STRATEGY_WITHDRAW_MINIMIZE_TRADING = await deployments.get('SushiswapStrategyWithdrawMinimizeTrading');
    const MINIMIZE_STRAT_CONTRACT = await ethers.getContractAt('SushiswapStrategyWithdrawMinimizeTrading', STRATEGY_WITHDRAW_MINIMIZE_TRADING.address);


    // === MATIC === //
    const VAULT_MATIC = await deployments.get('Vault_MATIC');
    const VAULT_CONFIG_MATIC = await deployments.get('ConfigurableInterestVaultConfig_MATIC');
    const VAULT_CONFIG_MATIC_CONTRACT = await ethers.getContractAt('ConfigurableInterestVaultConfig', VAULT_CONFIG_MATIC.address);
    const BASE_TOKEN_MATIC = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
    const STRATEGY_TWOSIDES_OPTIMAL_MATIC = await deployments.get('SushiswapStrategyAddTwoSidesOptimal_MATIC');
    const TWOSIDES_STRAT_CONTRACT_MATIC = await ethers.getContractAt('SushiswapStrategyAddTwoSidesOptimal', STRATEGY_TWOSIDES_OPTIMAL_MATIC.address);
    const STRATS_MATIC = [STRATEGY_TWOSIDES_OPTIMAL_MATIC.address, STRATEGY_WITHDRAW_MINIMIZE_TRADING.address];

    const MATIC_WORKERS = [
        {
            WORKER_NAME: "WETH-WMATIC Sushi Worker",
            POOL_ID: 0,
            WORK_FACTOR: '7000',
            KILL_FACTOR: '8333',
            MAX_PRICE_DIFF: '11000'
        }
    ]

    console.log("Deploying Worker for MATIC Vault");

    for (let i = 0; i < MATIC_WORKERS.length; i++) {
        console.log("_________________________________________");
        console.log(`Deploying SushiswapWorker for ${MATIC_WORKERS[i].WORKER_NAME}`);
        const SushiswapWorker = (await ethers.getContractFactory(
            'SushiswapWorker',
            (await ethers.getSigners())[0]
        )) as SushiswapWorker__factory;
        const sushiswapWorker = await upgrades.deployProxy(
            SushiswapWorker, [
            VAULT_MATIC.address, BASE_TOKEN_MATIC, MASTERCHEF,
            ROUTER, MATIC_WORKERS[i].POOL_ID, ADD_STRAT.address,
            LIQ_STRAT.address, REINVEST_BOUNTY_BPS
        ]
        ) as SushiswapWorker;
        await sushiswapWorker.deployed();

        await deployments.save(`SushiswapWorker ${MATIC_WORKERS[i].WORKER_NAME}`, { address: sushiswapWorker.address } as DeploymentSubmission)
        console.log(`Deployed ${MATIC_WORKERS[i].WORKER_NAME} at ${sushiswapWorker.address}`);

        console.log(`>> Adding REINVEST_BOT`);
        await sushiswapWorker.setReinvestorOk(REINVEST_BOT, true);
        console.log("✅ Done");

        console.log('Adding Strategies');
        await sushiswapWorker.setStrategyOk(STRATS_MATIC, true);
        console.log("✅ Done");

        console.log(`>> Whitelisting a worker on strats`);
        await ADD_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await LIQ_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await MINIMIZE_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await TWOSIDES_STRAT_CONTRACT_MATIC.setWorkersOk([sushiswapWorker.address], true);
        console.log("✅ Done");

        console.log("Setting WorkerConfig");
        await WORKER_CONFIG_CONTRACT.setConfigs([sushiswapWorker.address], [{ acceptDebt: true, workFactor: MATIC_WORKERS[i].WORK_FACTOR, killFactor: MATIC_WORKERS[i].KILL_FACTOR, maxPriceDiff: MATIC_WORKERS[i].MAX_PRICE_DIFF }]);
        console.log("✅ Done");

        console.log("Linking VaultConfig with WorkerConfig");
        await VAULT_CONFIG_MATIC_CONTRACT.setWorkers([sushiswapWorker.address], [WORKER_CONFIG.address]);
        console.log("✅ Done");

    };

    // ========== //

    // === USDC === //
    const VAULT_USDC = await deployments.get('Vault_USDC');
    const VAULT_CONFIG_USDC = await deployments.get('ConfigurableInterestVaultConfig_USDC');
    const VAULT_CONFIG_USDC_CONTRACT = await ethers.getContractAt('ConfigurableInterestVaultConfig', VAULT_CONFIG_USDC.address);
    const BASE_TOKEN_USDC = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
    const STRATEGY_TWOSIDES_OPTIMAL_USDC = await deployments.get('SushiswapStrategyAddTwoSidesOptimal_USDC');
    const TWOSIDES_STRAT_CONTRACT_USDC = await ethers.getContractAt('SushiswapStrategyAddTwoSidesOptimal', STRATEGY_TWOSIDES_OPTIMAL_USDC.address);
    const STRATS_USDC = [STRATEGY_TWOSIDES_OPTIMAL_USDC.address, STRATEGY_WITHDRAW_MINIMIZE_TRADING.address];

    const USDC_WORKERS = [
        {
            WORKER_NAME: "WETH=USDC Sushi Worker",
            POOL_ID: 1,
            WORK_FACTOR: '7000',
            KILL_FACTOR: '8333',
            MAX_PRICE_DIFF: '11000'
        },
        {
            WORKER_NAME: "DAI-USDC Sushi Worker",
            POOL_ID: 11,
            WORK_FACTOR: '8600',
            KILL_FACTOR: '9200',
            MAX_PRICE_DIFF: '11000'
        },
        {
            WORKER_NAME: "USDT-USDC Sushi Worker",
            POOL_ID: 8,
            WORK_FACTOR: '8600',
            KILL_FACTOR: '9200',
            MAX_PRICE_DIFF: '11000'
        }
    ]

    console.log("Deploying Worker for USDC Vault");

    for (let i = 0; i < USDC_WORKERS.length; i++) {
        console.log("_________________________________________");
        console.log(`Deploying SushiswapWorker for ${USDC_WORKERS[i].WORKER_NAME}`);
        const SushiswapWorker = (await ethers.getContractFactory(
            'SushiswapWorker',
            (await ethers.getSigners())[0]
        )) as SushiswapWorker__factory;
        const sushiswapWorker = await upgrades.deployProxy(
            SushiswapWorker, [
            VAULT_USDC.address, BASE_TOKEN_USDC, MASTERCHEF,
            ROUTER, USDC_WORKERS[i].POOL_ID, ADD_STRAT.address,
            LIQ_STRAT.address, REINVEST_BOUNTY_BPS
        ]
        ) as SushiswapWorker;
        await sushiswapWorker.deployed();

        await deployments.save(`SushiswapWorker ${USDC_WORKERS[i].WORKER_NAME}`, { address: sushiswapWorker.address } as DeploymentSubmission)
        console.log(`Deployed ${USDC_WORKERS[i].WORKER_NAME} at ${sushiswapWorker.address}`);

        console.log(`>> Adding REINVEST_BOT`);
        await sushiswapWorker.setReinvestorOk(REINVEST_BOT, true);
        console.log("✅ Done");

        console.log('Adding Strategies');
        await sushiswapWorker.setStrategyOk(STRATS_USDC, true);
        console.log("✅ Done");

        console.log(`>> Whitelisting a worker on strats`);
        await ADD_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await LIQ_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await MINIMIZE_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await TWOSIDES_STRAT_CONTRACT_USDC.setWorkersOk([sushiswapWorker.address], true);
        console.log("✅ Done");

        console.log("Setting WorkerConfig");
        await WORKER_CONFIG_CONTRACT.setConfigs([sushiswapWorker.address], [{ acceptDebt: true, workFactor: USDC_WORKERS[i].WORK_FACTOR, killFactor: USDC_WORKERS[i].KILL_FACTOR, maxPriceDiff: USDC_WORKERS[i].MAX_PRICE_DIFF }]);
        console.log("✅ Done");

        console.log("Linking VaultConfig with WorkerConfig");
        await VAULT_CONFIG_USDC_CONTRACT.setWorkers([sushiswapWorker.address], [WORKER_CONFIG.address]);
        console.log("✅ Done");

    };

    // ========== //

    // === USDT === //
    const VAULT_USDT = await deployments.get('Vault_USDT');
    const VAULT_CONFIG_USDT = await deployments.get('ConfigurableInterestVaultConfig_USDT');
    const VAULT_CONFIG_USDT_CONTRACT = await ethers.getContractAt('ConfigurableInterestVaultConfig', VAULT_CONFIG_USDT.address);
    const BASE_TOKEN_USDT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
    const STRATEGY_TWOSIDES_OPTIMAL_USDT = await deployments.get('SushiswapStrategyAddTwoSidesOptimal_USDT');
    const TWOSIDES_STRAT_CONTRACT_USDT = await ethers.getContractAt('SushiswapStrategyAddTwoSidesOptimal', STRATEGY_TWOSIDES_OPTIMAL_USDT.address);
    const STRATS_USDT = [STRATEGY_TWOSIDES_OPTIMAL_USDT.address, STRATEGY_WITHDRAW_MINIMIZE_TRADING.address];

    const USDT_WORKERS = [
        {
            WORKER_NAME: "WETH-USDT Sushi Worker",
            POOL_ID: 2,
            WORK_FACTOR: '7000',
            KILL_FACTOR: '8333',
            MAX_PRICE_DIFF: '11000'
        },
        {
            WORKER_NAME: "USDC-USDT Sushi Worker",
            POOL_ID: 8,
            WORK_FACTOR: '8600',
            KILL_FACTOR: '9200',
            MAX_PRICE_DIFF: '11000'
        }
    ]

    console.log("Deploying Worker for USDT Vault");

    for (let i = 0; i < USDT_WORKERS.length; i++) {
        console.log("_________________________________________");
        console.log(`Deploying SushiswapWorker for ${USDT_WORKERS[i].WORKER_NAME}`);
        const SushiswapWorker = (await ethers.getContractFactory(
            'SushiswapWorker',
            (await ethers.getSigners())[0]
        )) as SushiswapWorker__factory;
        const sushiswapWorker = await upgrades.deployProxy(
            SushiswapWorker, [
            VAULT_USDT.address, BASE_TOKEN_USDT, MASTERCHEF,
            ROUTER, USDT_WORKERS[i].POOL_ID, ADD_STRAT.address,
            LIQ_STRAT.address, REINVEST_BOUNTY_BPS
        ]
        ) as SushiswapWorker;
        await sushiswapWorker.deployed();

        await deployments.save(`SushiswapWorker ${USDT_WORKERS[i].WORKER_NAME}`, { address: sushiswapWorker.address } as DeploymentSubmission)
        console.log(`Deployed ${USDT_WORKERS[i].WORKER_NAME} at ${sushiswapWorker.address}`);

        console.log(`>> Adding REINVEST_BOT`);
        await sushiswapWorker.setReinvestorOk(REINVEST_BOT, true);
        console.log("✅ Done");

        console.log('Adding Strategies');
        await sushiswapWorker.setStrategyOk(STRATS_USDT, true);
        console.log("✅ Done");

        console.log(`>> Whitelisting a worker on strats`);
        await ADD_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await LIQ_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await MINIMIZE_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await TWOSIDES_STRAT_CONTRACT_USDT.setWorkersOk([sushiswapWorker.address], true);
        console.log("✅ Done");

        console.log("Setting WorkerConfig");
        await WORKER_CONFIG_CONTRACT.setConfigs([sushiswapWorker.address], [{ acceptDebt: true, workFactor: USDT_WORKERS[i].WORK_FACTOR, killFactor: USDT_WORKERS[i].KILL_FACTOR, maxPriceDiff: USDT_WORKERS[i].MAX_PRICE_DIFF }]);
        console.log("✅ Done");

        console.log("Linking VaultConfig with WorkerConfig");
        await VAULT_CONFIG_USDT_CONTRACT.setWorkers([sushiswapWorker.address], [WORKER_CONFIG.address]);
        console.log("✅ Done");

    };

    // ========== //

    // === DAI === //
    const VAULT_DAI = await deployments.get('Vault_DAI');
    const VAULT_CONFIG_DAI = await deployments.get('ConfigurableInterestVaultConfig_DAI');
    const VAULT_CONFIG_DAI_CONTRACT = await ethers.getContractAt('ConfigurableInterestVaultConfig', VAULT_CONFIG_DAI.address);
    const BASE_TOKEN_DAI = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';
    const STRATEGY_TWOSIDES_OPTIMAL_DAI = await deployments.get('SushiswapStrategyAddTwoSidesOptimal_DAI');
    const TWOSIDES_STRAT_CONTRACT_DAI = await ethers.getContractAt('SushiswapStrategyAddTwoSidesOptimal', STRATEGY_TWOSIDES_OPTIMAL_DAI.address);
    const STRATS_DAI = [STRATEGY_TWOSIDES_OPTIMAL_DAI.address, STRATEGY_WITHDRAW_MINIMIZE_TRADING.address];

    const DAI_WORKERS = [
        {
            WORKER_NAME: "WETH-DAI Sushi Worker",
            POOL_ID: 5,
            WORK_FACTOR: '7000',
            KILL_FACTOR: '8333',
            MAX_PRICE_DIFF: '11000'
        },
        {
            WORKER_NAME: "USDC-DAI Sushi Worker",
            POOL_ID: 11,
            WORK_FACTOR: '8600',
            KILL_FACTOR: '9200',
            MAX_PRICE_DIFF: '11000'
        }
    ]

    console.log("Deploying Worker for DAI Vault");

    for (let i = 0; i < DAI_WORKERS.length; i++) {
        console.log("_________________________________________");
        console.log(`Deploying SushiswapWorker for ${DAI_WORKERS[i].WORKER_NAME}`);
        const SushiswapWorker = (await ethers.getContractFactory(
            'SushiswapWorker',
            (await ethers.getSigners())[0]
        )) as SushiswapWorker__factory;
        const sushiswapWorker = await upgrades.deployProxy(
            SushiswapWorker, [
            VAULT_DAI.address, BASE_TOKEN_DAI, MASTERCHEF,
            ROUTER, DAI_WORKERS[i].POOL_ID, ADD_STRAT.address,
            LIQ_STRAT.address, REINVEST_BOUNTY_BPS
        ]
        ) as SushiswapWorker;
        await sushiswapWorker.deployed();

        await deployments.save(`SushiswapWorker ${DAI_WORKERS[i].WORKER_NAME}`, { address: sushiswapWorker.address } as DeploymentSubmission)
        console.log(`Deployed ${DAI_WORKERS[i].WORKER_NAME} at ${sushiswapWorker.address}`);

        console.log(`>> Adding REINVEST_BOT`);
        await sushiswapWorker.setReinvestorOk(REINVEST_BOT, true);
        console.log("✅ Done");

        console.log('Adding Strategies');
        await sushiswapWorker.setStrategyOk(STRATS_DAI, true);
        console.log("✅ Done");

        console.log(`>> Whitelisting a worker on strats`);
        await ADD_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await LIQ_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await MINIMIZE_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await TWOSIDES_STRAT_CONTRACT_DAI.setWorkersOk([sushiswapWorker.address], true);
        console.log("✅ Done");

        console.log("Setting WorkerConfig");
        await WORKER_CONFIG_CONTRACT.setConfigs([sushiswapWorker.address], [{ acceptDebt: true, workFactor: DAI_WORKERS[i].WORK_FACTOR, killFactor: DAI_WORKERS[i].KILL_FACTOR, maxPriceDiff: DAI_WORKERS[i].MAX_PRICE_DIFF }]);
        console.log("✅ Done");

        console.log("Linking VaultConfig with WorkerConfig");
        await VAULT_CONFIG_DAI_CONTRACT.setWorkers([sushiswapWorker.address], [WORKER_CONFIG.address]);
        console.log("✅ Done");

    };

    // ========== //

    // === WETH === //
    const VAULT_WETH = await deployments.get('Vault_WETH');
    const VAULT_CONFIG_WETH = await deployments.get('ConfigurableInterestVaultConfig_WETH');
    const VAULT_CONFIG_WETH_CONTRACT = await ethers.getContractAt('ConfigurableInterestVaultConfig', VAULT_CONFIG_WETH.address);
    const BASE_TOKEN_WETH = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619';
    const STRATEGY_TWOSIDES_OPTIMAL_WETH = await deployments.get('SushiswapStrategyAddTwoSidesOptimal_WETH');
    const TWOSIDES_STRAT_CONTRACT_WETH = await ethers.getContractAt('SushiswapStrategyAddTwoSidesOptimal', STRATEGY_TWOSIDES_OPTIMAL_WETH.address);
    const STRATS_WETH = [STRATEGY_TWOSIDES_OPTIMAL_WETH.address, STRATEGY_WITHDRAW_MINIMIZE_TRADING.address];

    const WETH_WORKERS = [
        {
            WORKER_NAME: "DAI=WETH Sushi Worker",
            POOL_ID: 5,
            WORK_FACTOR: '7000',
            KILL_FACTOR: '8333',
            MAX_PRICE_DIFF: '11000'
        },
        {
            WORKER_NAME: "WBTC-WETH Sushi Worker",
            POOL_ID: 3,
            WORK_FACTOR: '7000',
            KILL_FACTOR: '8333',
            MAX_PRICE_DIFF: '11000'
        },
        {
            WORKER_NAME: "USDT-WETH Sushi Worker",
            POOL_ID: 2,
            WORK_FACTOR: '7000',
            KILL_FACTOR: '8333',
            MAX_PRICE_DIFF: '11000'
        },
        {
            WORKER_NAME: "USDC-WETH Sushi Worker",
            POOL_ID: 1,
            WORK_FACTOR: '7000',
            KILL_FACTOR: '8333',
            MAX_PRICE_DIFF: '11000'
        },
        {
            WORKER_NAME: "WMATIC-WETH Sushi Worker",
            POOL_ID: 0,
            WORK_FACTOR: '7000',
            KILL_FACTOR: '8333',
            MAX_PRICE_DIFF: '11000'
        }
    ]

    console.log("Deploying Worker for WETH Vault");

    for (let i = 0; i < WETH_WORKERS.length; i++) {
        console.log("_________________________________________");
        console.log(`Deploying SushiswapWorker for ${WETH_WORKERS[i].WORKER_NAME}`);
        const SushiswapWorker = (await ethers.getContractFactory(
            'SushiswapWorker',
            (await ethers.getSigners())[0]
        )) as SushiswapWorker__factory;
        const sushiswapWorker = await upgrades.deployProxy(
            SushiswapWorker, [
            VAULT_WETH.address, BASE_TOKEN_WETH, MASTERCHEF,
            ROUTER, WETH_WORKERS[i].POOL_ID, ADD_STRAT.address,
            LIQ_STRAT.address, REINVEST_BOUNTY_BPS
        ]
        ) as SushiswapWorker;
        await sushiswapWorker.deployed();

        await deployments.save(`SushiswapWorker ${WETH_WORKERS[i].WORKER_NAME}`, { address: sushiswapWorker.address } as DeploymentSubmission)
        console.log(`Deployed ${WETH_WORKERS[i].WORKER_NAME} at ${sushiswapWorker.address}`);

        console.log(`>> Adding REINVEST_BOT`);
        await sushiswapWorker.setReinvestorOk(REINVEST_BOT, true);
        console.log("✅ Done");

        console.log('Adding Strategies');
        await sushiswapWorker.setStrategyOk(STRATS_WETH, true);
        console.log("✅ Done");

        console.log(`>> Whitelisting a worker on strats`);
        await ADD_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await LIQ_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await MINIMIZE_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await TWOSIDES_STRAT_CONTRACT_WETH.setWorkersOk([sushiswapWorker.address], true);
        console.log("✅ Done");

        console.log("Setting WorkerConfig");
        await WORKER_CONFIG_CONTRACT.setConfigs([sushiswapWorker.address], [{ acceptDebt: true, workFactor: WETH_WORKERS[i].WORK_FACTOR, killFactor: WETH_WORKERS[i].KILL_FACTOR, maxPriceDiff: WETH_WORKERS[i].MAX_PRICE_DIFF }]);
        console.log("✅ Done");

        console.log("Linking VaultConfig with WorkerConfig");
        await VAULT_CONFIG_WETH_CONTRACT.setWorkers([sushiswapWorker.address], [WORKER_CONFIG.address]);
        console.log("✅ Done");

    };

    // ========== //

    // === WBTC === //
    const VAULT_WBTC = await deployments.get('Vault_WBTC');
    const VAULT_CONFIG_WBTC = await deployments.get('ConfigurableInterestVaultConfig_WBTC');
    const VAULT_CONFIG_WBTC_CONTRACT = await ethers.getContractAt('ConfigurableInterestVaultConfig', VAULT_CONFIG_WBTC.address);
    const BASE_TOKEN_WBTC = '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6';
    const STRATEGY_TWOSIDES_OPTIMAL_WBTC = await deployments.get('SushiswapStrategyAddTwoSidesOptimal_WBTC');
    const TWOSIDES_STRAT_CONTRACT_WBTC = await ethers.getContractAt('SushiswapStrategyAddTwoSidesOptimal', STRATEGY_TWOSIDES_OPTIMAL_WBTC.address);
    const STRATS_WBTC = [STRATEGY_TWOSIDES_OPTIMAL_WBTC.address, STRATEGY_WITHDRAW_MINIMIZE_TRADING.address];

    const WBTC_WORKERS = [
        {
            WORKER_NAME: "WETH-WBTC Sushi Worker",
            POOL_ID: 3,
            WORK_FACTOR: '7000',
            KILL_FACTOR: '8333',
            MAX_PRICE_DIFF: '11000'
        }
    ]

    console.log("Deploying Worker for WBTC Vault");

    for (let i = 0; i < WBTC_WORKERS.length; i++) {
        console.log("_________________________________________");
        console.log(`Deploying SushiswapWorker for ${WBTC_WORKERS[i].WORKER_NAME}`);
        const SushiswapWorker = (await ethers.getContractFactory(
            'SushiswapWorker',
            (await ethers.getSigners())[0]
        )) as SushiswapWorker__factory;
        const sushiswapWorker = await upgrades.deployProxy(
            SushiswapWorker, [
            VAULT_WBTC.address, BASE_TOKEN_WBTC, MASTERCHEF,
            ROUTER, WBTC_WORKERS[i].POOL_ID, ADD_STRAT.address,
            LIQ_STRAT.address, REINVEST_BOUNTY_BPS
        ]
        ) as SushiswapWorker;
        await sushiswapWorker.deployed();

        await deployments.save(`SushiswapWorker ${WBTC_WORKERS[i].WORKER_NAME}`, { address: sushiswapWorker.address } as DeploymentSubmission)
        console.log(`Deployed ${WBTC_WORKERS[i].WORKER_NAME} at ${sushiswapWorker.address}`);

        console.log(`>> Adding REINVEST_BOT`);
        await sushiswapWorker.setReinvestorOk(REINVEST_BOT, true);
        console.log("✅ Done");

        console.log('Adding Strategies');
        await sushiswapWorker.setStrategyOk(STRATS_WBTC, true);
        console.log("✅ Done");

        console.log(`>> Whitelisting a worker on strats`);
        await ADD_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await LIQ_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await MINIMIZE_STRAT_CONTRACT.setWorkersOk([sushiswapWorker.address], true);
        await TWOSIDES_STRAT_CONTRACT_WBTC.setWorkersOk([sushiswapWorker.address], true);
        console.log("✅ Done");

        console.log("Setting WorkerConfig");
        await WORKER_CONFIG_CONTRACT.setConfigs([sushiswapWorker.address], [{ acceptDebt: true, workFactor: WBTC_WORKERS[i].WORK_FACTOR, killFactor: WBTC_WORKERS[i].KILL_FACTOR, maxPriceDiff: WBTC_WORKERS[i].MAX_PRICE_DIFF }]);
        console.log("✅ Done");

        console.log("Linking VaultConfig with WorkerConfig");
        await VAULT_CONFIG_WBTC_CONTRACT.setWorkers([sushiswapWorker.address], [WORKER_CONFIG.address]);
        console.log("✅ Done");

    };

    // ========== //

};

export default func;
func(hre);