// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IMMeowFee {
  function meowUtil() external view returns (address);

  function mMeowToken() external view returns (address);

  function mMeowFeeAddress() external view returns (address);

  function mMeowReserveBps() external view returns (uint256);

  function mMeowPrice() external view returns (uint256);

  function mMeowValue(address _user) external view returns (uint256);

  function calMMeowFee(address _user) external view returns (uint256);
}
