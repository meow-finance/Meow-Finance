const Web3 = require("web3");
const web3 = new Web3("https://rpc-mainnet.maticvigil.com");
var utils = require('ethers').utils;

 // ===== Value ===== //

const leverageVal = 200;
const openPrice = 0;
const liqPrice = 0;
const stopLoss = 0;
const takeProfit = 0;

 // ================ //

 // ===== Spooky ===== //

const baseOnly = '0x961604b6b234Ae9B353D11Df8a19F6D8d9959087';
const twosides = '0x57546E0359AA783468fD54fD68965851e3AF98B6'; //FTM
const liquidate = '0xb341dA4889e122A48977C1Fa2bFaC4c0205c35DA';
const minimize = '0xC054B08f980C93165B4bEA37a3D611D5368687E6';

// ================== //

// ===== Spirit ===== //

// const baseOnly = '';
// const twosides = '';
// const liquidate = '';
// const minimize = '';

// ================== //


const stra = liquidate;

// Strategy - BaseOnly
if (stra == baseOnly) {
    const minLPAmount = 0;
    const data1 = web3.eth.abi.encodeParameters(['uint256'], [minLPAmount]);
    const data2 = web3.eth.abi.encodeParameters(['uint256','uint256','uint256','uint256','uint256','address', 'bytes'], [leverageVal, openPrice, liqPrice, stopLoss, takeProfit,stra, data1]);
    console.log(data2);
}


//Strategy - TwoSides
if (stra == twosides) {
    const farmingTokenAmount = utils.parseUnits('60','6');
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


