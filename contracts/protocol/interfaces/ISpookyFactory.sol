// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

interface ISpookyFactory {
  function INIT_CODE_PAIR_HASH() external view returns (bytes32);

  function allPairs(uint256) external view returns (address);

  function allPairsLength() external view returns (uint256);

  function createPair(address tokenA, address tokenB) external returns (address pair);

  function feeTo() external view returns (address);

  function feeToSetter() external view returns (address);

  function getPair(address, address) external view returns (address);

  function pairCodeHash() external pure returns (bytes32);

  function setFeeTo(address _feeTo) external;

  function setFeeToSetter(address _feeToSetter) external;
}
