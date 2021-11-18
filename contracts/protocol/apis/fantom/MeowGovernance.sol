// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

import "../IUniswapV2Router02.sol";
import "../../interfaces/IERC20.sol";
import "../../../utils/Math.sol";
import "../../interfaces/IMeowMining.sol";
interface IWNative {
  function symbol() external view returns (string memory);
}

contract MeowGovernance {
  using SafeMath for uint256;
  address public meowToken;
  address public mMeow;
  address public usdcToken;
  address public wNative;
  address public meowMining;
  IUniswapV2Router02 public spookyRouter;
  IUniswapV2Factory public spookyFactory;

  constructor(
    IUniswapV2Router02 _spookyRouter,
    address _meowToken,
    address _mMeow,
    address _usdcToken,
    address _meowMining
  ) public {
    spookyRouter = _spookyRouter;
    spookyFactory = IUniswapV2Factory(_spookyRouter.factory());
    wNative = _spookyRouter.WETH();
    meowToken = _meowToken;
    mMeow = _mMeow;
    usdcToken = _usdcToken;
    meowMining = _meowMining;
  }

  // ===== Price function ===== //

  // Return Token per Native. 
  // Decimal in BaseToken
  function getTokenPerNative(address _lp) public view returns (uint256) {
    (uint112 reserve0, uint112 reserve1, ) = IUniswapV2Pair(_lp).getReserves();
    string memory symbol = IERC20(IUniswapV2Pair(_lp).token0()).symbol();
    return
      keccak256(bytes(symbol)) == keccak256(bytes(IWNative(wNative).symbol()))
        ? uint256(reserve1).mul(1e18).div(uint256(reserve0))
        : uint256(reserve0).mul(1e18).div(uint256(reserve1));
  }

  // Return MeowToken price in USDC.
  // Decimal is 18
  function meowPrice() public view returns (uint256) {
    if (spookyFactory.getPair(wNative, meowToken) == address(0)) return 0;
    uint256 meowPerNative = getTokenPerNative(spookyFactory.getPair(wNative, meowToken));
    uint256 usdcPerNative = getTokenPerNative(spookyFactory.getPair(wNative, usdcToken));
    return usdcPerNative.mul(1e18).div(meowPerNative);
  }


  // Rerturn MeowToken / 1 BaseToken
  // Decimal in 18
  function meowPricePerToken(address baseToken) public view returns (uint256) {
    if (spookyFactory.getPair(wNative, meowToken) == address(0)) return 0;
    uint256 meowPerNative = getTokenPerNative(spookyFactory.getPair(wNative, meowToken));
    address pair = spookyFactory.getPair(wNative, baseToken);
    require(pair != address(0) , "pair is zero address");
    uint256 TokenPerNative = getTokenPerNative(pair);
    uint256 decimalOfBase = IERC20(baseToken).decimals();
    // M1e18/N1e18 * N1e18/T1eb = M1e18/T1eb => mul 1eb both fot convert to 1e18
    return meowPerNative.mul(10**decimalOfBase).div(TokenPerNative);
  }

  // Return Meow value of given user in USDC.
  function meowValue(address _user) public view returns (uint256) {
      return  IERC20(meowToken).balanceOf(_user).mul(meowPrice()).div(1e18);
  }

  // Return mMeowToken price in USDC.
  function mMeowPrice() public view returns (uint256) {
    uint256 mMeowTotal = IERC20(mMeow).totalSupply();
    if (mMeowTotal == 0) return 0;
    return IERC20(meowToken).balanceOf(mMeow).mul(meowPrice()).div(mMeowTotal);
  }

  // Return mMeowToken price in mMeow
  function mMeowPricePerMeow() public view returns (uint256) {
    uint256 mMeowTotal = IERC20(mMeow).totalSupply();
    if (mMeowTotal == 0) return 0;
    return mMeowTotal.mul(1e18).div(IERC20(meowToken).balanceOf(mMeow));
  }

  // Return mMeow value of given user in USDC.
  function mMeowValue(address _user) public view returns (uint256) {
      return IERC20(mMeow).balanceOf(_user).mul( mMeowPrice()).div(1e18);
  }

  function getmMeowAmountOut(address baseToken, uint256 amountIn) public view returns (uint256){
    require(baseToken != address(0), "baseToken cannot be the zero address.");
    require(wNative != address(0), "wNative cannot be the zero address.");
    require(meowToken != address(0), "meowToken cannot be the zero address.");
    require(amountIn > 0, "amountIn must be greater than 0");
    //A*1eb * B*1eb = C*1e2b ==> div 1eb both  for convert to 1eb
    //C Decimal in BaseToken
    uint decimalOfBase = IERC20(baseToken).decimals();
    uint256 meowAmount =  (amountIn.mul(meowPricePerToken(baseToken))).div( 10**decimalOfBase  );
    //MeowAmount*1e18 * mMeowPricePerMeow*1e18 = E*1e36 div 1e18 both for convert to 1e18
    return (meowAmount.mul(mMeowPricePerMeow())).div(1e18);
  }

  // =========================== //

  // ===== Frontend function ===== //

  // ===== Voting function ===== //

  // Return Power for Create Proposal / Voting
  function getPower(address _user) public view returns (uint256) {
    return meowValue(_user).add(mMeowValue(_user));
  }

  //Return min power voting for win vote of proposal
  //5% of reward + dev token * meow price
  function getMinWinPower() public view returns (uint256){
    IMeowMining meowMiningContract =  IMeowMining(meowMining);
    uint256 totalReward = meowMiningContract.mintedDevFund().add(meowMiningContract.mintedMeowReward());
    return  totalReward.mul(meowPrice()).div(20).div(1e18);
  }

  

  // ======================== //
}
