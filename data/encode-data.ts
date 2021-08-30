const Web3 = require("web3");
const web3 = new Web3("https://rpc-mainnet.maticvigil.com");
var utils = require('ethers').utils;

 // ===== Value ===== //

const leverageVal = 0;
const openPrice = 0;
const liqPrice = 0;
const stopLoss = 0;
const takeProfit = 0;

 // ================ //

 // ===== Sushi ===== //

const baseOnly = '';
const twosides = '';
const liquidate = '';
const minimize = '';

// ================== //

// ===== Quick ===== //

// const baseOnly = '';
// const twosides = '';
// const liquidate = '';
// const minimize = '';

// ================== //


const stra = baseOnly;

// Strategy - BaseOnly
if (stra == baseOnly) {
    const minLPAmount = 0;
    const data1 = web3.eth.abi.encodeParameters(['uint256'], [minLPAmount]);
    const data2 = web3.eth.abi.encodeParameters(['uint256','uint256','uint256','uint256','uint256','address', 'bytes'], [leverageVal, openPrice, liqPrice, stopLoss, takeProfit,stra, data1]);
    console.log(data2);
}


//Strategy - TwoSides
if (stra == twosides) {
    const farmingTokenAmount = utils.parseUnits('0','6');
    const minLPAmount = 0;
    const data1 = web3.eth.abi.encodeParameters(['uint256', 'uint256'], [farmingTokenAmount, minLPAmount]);
    const data2 = web3.eth.abi.encodeParameters(['uint256','uint256','uint256','uint256','uint256','address', 'bytes'], [leverageVal, openPrice, liqPrice, stopLoss, takeProfit,stra, data1]);
    console.log(data2);
}

// Strategy - Minimize
if (stra == minimize) {
    const minFarmingToken = 0;
    const data1 = web3.eth.abi.encodeParameters(['uint256'], [minFarmingToken]);
    const data2 = web3.eth.abi.encodeParameters(['uint256','uint256','uint256','uint256','uint256','address', 'bytes'], [leverageVal, openPrice, liqPrice, stopLoss, takeProfit,stra, data1]);
    console.log(data2);
}

// Strategy - Liquidate
if (stra == liquidate) {
    const minBaseToken = 0;
    const data1 = web3.eth.abi.encodeParameters(['uint256'], [minBaseToken]);
    const data2 = web3.eth.abi.encodeParameters(['uint256','uint256','uint256','uint256','uint256','address', 'bytes'], [leverageVal,openPrice, liqPrice, stopLoss, takeProfit, stra, data1]);
    console.log(data2);
}


