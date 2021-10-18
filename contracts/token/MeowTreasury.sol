// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MeowTreasury is Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  // Meow Token.
  IERC20 public Meow;
  // Treasury address.
  address public treasury;
  // Locked time for dev around 1 years.
  uint256 public lockPeriod = 365 days;
  // How many Meow tokens locked.
  uint256 public lockedAmount;
  // last time that Meow tokens unlocked.
  uint256 public lastUnlockTime;
  // Time that Meow tokens locked to.
  uint256 public lockTo;
  /// list of whitelisted callers
  mapping(address => bool) public whitelistedCallers;

  event SetWhitelistedCaller(address indexed caller, address indexed addr, bool ok);
  event Unlock(address indexed caller, address indexed treasury, uint256 amount);
  event SetTreasury(address indexed treasury);

  constructor(IERC20 _Meow, address _treasury) public {
    Meow = _Meow;
    treasury = _treasury;
  }

  modifier onlyTreasury() {
    require(msg.sender == treasury, "MeowTreasury::onlyTreasury:: Forbidden");
    _;
  }

  modifier onlyWhitelistedCaller() {
    require(whitelistedCallers[msg.sender] == true, "MeowTreasury::onlyWhitelistedCaller:: !okCaller");
    _;
  }

  // Update treasury address by the previous treasury.
  function setTreasury(address _treasury) external onlyTreasury {
    treasury = _treasury;
    emit SetTreasury(treasury);
  }

  // Lock Meow tokens for a period of time.
  function lock(uint256 _amount) public onlyWhitelistedCaller {
    Meow.safeTransferFrom(msg.sender, address(this), _amount);
    unlock();
    if (_amount > 0) {
      lockedAmount = lockedAmount.add(_amount);
      lockTo = block.timestamp.add(lockPeriod);
    }
  }

  // Return pending unlock Meow.
  function availableUnlock() public view returns (uint256) {
    if (block.timestamp >= lockTo) {
      return lockedAmount;
    } else {
      uint256 releaseTime = block.timestamp.sub(lastUnlockTime);
      uint256 lockTime = lockTo.sub(lastUnlockTime);
      return lockedAmount.mul(releaseTime).div(lockTime);
    }
  }

  // Unlock the locked Meow.
  function unlock() public {
    uint256 amount = availableUnlock();
    lastUnlockTime = block.timestamp;
    if (amount > 0) {
      if (amount > Meow.balanceOf(address(this))) {
        amount = Meow.balanceOf(address(this));
      }
      lockedAmount = lockedAmount.sub(amount);
      Meow.safeTransfer(treasury, amount);
      emit Unlock(msg.sender, treasury, amount);
    }
  }

  // Set whitelisted callers.
  function setWhitelistedCallers(address[] calldata callers, bool ok) external onlyOwner {
    for (uint256 idx = 0; idx < callers.length; idx++) {
      whitelistedCallers[callers[idx]] = ok;
      emit SetWhitelistedCaller(msg.sender, callers[idx], ok);
    }
  }
}
