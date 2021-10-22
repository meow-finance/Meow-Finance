// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IOracle {
  function consult(
    address _factory,
    address _tokenIn,
    uint256 _amountIn,
    address _tokenOut
  ) external view returns (uint256 amountOut);
}
