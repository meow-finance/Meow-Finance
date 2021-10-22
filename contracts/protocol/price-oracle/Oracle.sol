// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

import "../../utils/UniswapV2OracleLibrary.sol";
import "../../utils/UniswapV2Library.sol";
import "../../utils/FixedPoint.sol";

// fixed window oracle that recomputes the average price for the entire period once every period
// note that the price average is only guaranteed to be over at least 1 period, but may be over a longer period
contract Oracle is Ownable {
  using FixedPoint for *;

  struct PriceData {
    uint32 blockTimestampLast;
    uint256 price0CumulativeLast;
    uint256 price1CumulativeLast;
  }

  address feeder;

  uint256 public constant PERIOD = 1 hours;

  // mapping from pair address to a list of price data of that pair.
  mapping(address => PriceData) public store;

  constructor(address _feeder) public {
    feeder = _feeder;
  }

  modifier onlyFeeder() {
    require(msg.sender == feeder, "Oracle::onlyFeeder:: only feeder");
    _;
  }

  function setFeeder(address _feeder) public onlyOwner {
    feeder = _feeder;
  }

  function update(
    address _factory,
    address _tokenA,
    address _tokenB
  ) external onlyFeeder {
    IUniswapV2Pair pair = IUniswapV2Pair(IUniswapV2Factory(_factory).getPair(_tokenA, _tokenB));
    require(address(pair) != address(0), "Oracle::update:: pair doesn't exist.");

    PriceData storage data = store[address(pair)];
    (uint256 price0Cumulative, uint256 price1Cumulative, uint32 blockTimestamp) = UniswapV2OracleLibrary
      .currentCumulativePrices(address(pair));
    uint32 timeElapsed = blockTimestamp - data.blockTimestampLast; // overflow is desired
    // ensure that at least one full period has passed since the last update
    require(timeElapsed >= PERIOD, "Oracle::update:: PERIOD_NOT_ELAPSED");

    data.price0CumulativeLast = price0Cumulative;
    data.price1CumulativeLast = price1Cumulative;
    data.blockTimestampLast = blockTimestamp;
  }

  function computeAmountOut(
    uint256 priceCumulativeStart,
    uint256 priceCumulativeEnd,
    uint32 timeElapsed,
    uint256 amountIn
  ) private pure returns (uint256 amountOut) {
    // overflow is desired.
    FixedPoint.uq112x112 memory priceAverage = FixedPoint.uq112x112(
      uint224((priceCumulativeEnd - priceCumulativeStart) / timeElapsed)
    );
    amountOut = priceAverage.mul(amountIn).decode144();
  }

  // note this will always return 0 before update has been called successfully for the first time.
  function consult(
    address _factory,
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external view returns (uint256 amountOut) {
    IUniswapV2Pair pair = IUniswapV2Pair(IUniswapV2Factory(_factory).getPair(_tokenIn, _tokenOut));
    require(address(pair) != address(0), "Oracle::consult:: pair doesn't exist.");
    address token0 = pair.token0();
    address token1 = pair.token1();

    PriceData storage data = store[address(pair)];
    (uint256 price0Cumulative, uint256 price1Cumulative, uint32 blockTimestamp) = UniswapV2OracleLibrary
      .currentCumulativePrices(address(pair));
    uint32 timeElapsed = blockTimestamp - data.blockTimestampLast;

    if (_tokenIn == token0) {
      return computeAmountOut(data.price0CumulativeLast, price0Cumulative, timeElapsed, _amountIn);
    } else {
      require(_tokenIn == token1, "Oracle::consult:: INVALID_TOKEN");
      return computeAmountOut(data.price1CumulativeLast, price1Cumulative, timeElapsed, _amountIn);
    }
  }
}
