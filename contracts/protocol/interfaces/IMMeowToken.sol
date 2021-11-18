// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IMMeowToken {
  function allowance(address owner, address spender) external view returns (uint256);

  function approve(address spender, uint256 amount) external returns (bool);

  function balanceOf(address account) external view returns (uint256);

  function burn(uint256 _amount) external;

  function decimals() external view returns (uint8);

  function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool);

  function deposit(address _for, uint256 _amount) external;

  function depositTime() external view returns (uint256);

  function endDeposit() external view returns (uint256);

  function increaseAllowance(address spender, uint256 addedValue) external returns (bool);

  function isLockEnd() external view returns (bool);

  function isStart() external view returns (bool);

  function lockTime() external view returns (uint256);

  function meow() external view returns (address);

  function name() external view returns (string memory);

  function owner() external view returns (address);

  function renounceOwnership() external;

  function start() external;

  function startWithdraw() external view returns (uint256);

  function symbol() external view returns (string memory);

  function totalSupply() external view returns (uint256);

  function transfer(address recipient, uint256 amount) external returns (bool);

  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) external returns (bool);

  function transferOwnership(address newOwner) external;

  function withdraw(uint256 _share) external;
}
