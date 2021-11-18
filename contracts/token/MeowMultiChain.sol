// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MeowMultiChain is Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  // Meow Token.
  IERC20 public Meow;
  // Locked time for MeowMultiChain around 2 months.
  uint256 public lockPeriod = 30 days * 2;
  // Time that Meow tokens locked to.
  uint256 public lockTo;

  event Lock(address indexed caller, uint256 amount);
  event Unlock(address indexed to, uint256 amount);

  constructor(IERC20 _Meow) public {
    require(address(_Meow) != address(0), "MeowMultiChain::constructor:: not ZERO address.");
    Meow = _Meow;
    lockTo = block.timestamp.add(lockPeriod);
  }

  // Lock Meow tokens.
  function lock(uint256 _amount) external {
    if (_amount > 0) {
      uint256 currentBal = Meow.balanceOf(address(this));
      Meow.safeTransferFrom(msg.sender, address(this), _amount);
      uint256 receivedAmount = Meow.balanceOf(address(this)) - currentBal;
      emit Lock(msg.sender, receivedAmount);
    }
  }

  // Unlock the locked Meow.
  function unlock(address _to, uint256 _amount) external onlyOwner {
    require(block.timestamp > lockTo, "MeowMultiChain::unlock:: not within the specified period");
    if (_amount > 0) {
      if (_amount > Meow.balanceOf(address(this))) {
        _amount = Meow.balanceOf(address(this));
      }
      Meow.safeTransfer(_to, _amount);
      emit Unlock(_to, _amount);
    }
  }
}
