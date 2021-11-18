// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/Initializable.sol";

import "./interfaces/IVaultConfig.sol";
import "./interfaces/IWorkerConfig.sol";
import "./interfaces/ITripleSlopeModel.sol";
import "./interfaces/IMMeowFee.sol";

contract ConfigurableInterestVaultConfig is IVaultConfig, OwnableUpgradeSafe {
  /// @notice Events
  event SetWhitelistedCaller(address indexed caller, address indexed addr, bool ok);
  event SetWhitelistedBot(address indexed caller, address indexed addr, bool ok);
  event SetParams(
    address indexed caller,
    uint256 minDebtSize,
    uint256 reservePoolBps,
    uint256 killBps,
    address interestModel,
    address wrappedNative,
    address wNativeRelayer,
    address meowMining
  );
  event SetWorkers(address indexed caller, address worker, address workerConfig);
  event SetMaxKillBps(address indexed caller, uint256 maxKillBps);
  event SetMMeowFee(address indexed mMeowFee);

  /// The minimum debt size per position.
  uint256 public override minDebtSize;
  /// The portion of interests allocated to the reserve pool.
  uint256 public override getReservePoolBps;
  /// The reward for successfully killing a position.
  uint256 public override getKillBps;
  /// Mapping for worker address to its configuration.
  mapping(address => IWorkerConfig) public workers;
  /// Interest rate model
  ITripleSlopeModel public interestModel;
  /// address for wrapped native eg WBNB, WETH
  address public wrappedNative;
  /// address for wNtive Relayer
  address public wNativeRelayer;
  /// address of meowMining contract
  address public meowMining;
  /// maximum killBps
  uint256 public maxKillBps;
  /// address of MMeowFee contract
  address public override mMeowFee;
  /// list of whitelisted callers
  mapping(address => bool) public override whitelistedCallers;
  /// list of whitelisted bots
  mapping(address => bool) public override whitelistedBots;

  function initialize(
    uint256 _minDebtSize,
    uint256 _reservePoolBps,
    uint256 _killBps,
    ITripleSlopeModel _interestModel,
    address _wrappedNative,
    address _wNativeRelayer,
    address _meowMining
  ) external initializer {
    OwnableUpgradeSafe.__Ownable_init();

    maxKillBps = 500;
    setParams(_minDebtSize, _reservePoolBps, _killBps, _interestModel, _wrappedNative, _wNativeRelayer, _meowMining);
  }

  /// @dev Set all the basic parameters. Must only be called by the owner.
  /// @param _minDebtSize The new minimum debt size value.
  /// @param _reservePoolBps The new interests allocated to the reserve pool value.
  /// @param _killBps The new reward for killing a position value.
  /// @param _interestModel The new interest rate model contract.
  function setParams(
    uint256 _minDebtSize,
    uint256 _reservePoolBps,
    uint256 _killBps,
    ITripleSlopeModel _interestModel,
    address _wrappedNative,
    address _wNativeRelayer,
    address _meowMining
  ) public onlyOwner {
    require(_killBps <= maxKillBps, "ConfigurableInterestVaultConfig::setParams:: kill bps exceeded max kill bps");

    minDebtSize = _minDebtSize;
    getReservePoolBps = _reservePoolBps;
    getKillBps = _killBps;
    interestModel = _interestModel;
    wrappedNative = _wrappedNative;
    wNativeRelayer = _wNativeRelayer;
    meowMining = _meowMining;

    emit SetParams(
      _msgSender(),
      minDebtSize,
      getReservePoolBps,
      getKillBps,
      address(interestModel),
      wrappedNative,
      wNativeRelayer,
      meowMining
    );
  }

  function setmMeowFee(address _mMeowFee) external onlyOwner {
    require(_mMeowFee != address(0), "setmMeowFee should not zero address");
    mMeowFee = _mMeowFee;
    emit SetMMeowFee(mMeowFee);
  }

  /// @dev Set the configuration for the given workers. Must only be called by the owner.
  function setWorkers(address[] calldata addrs, IWorkerConfig[] calldata configs) external onlyOwner {
    require(addrs.length == configs.length, "ConfigurableInterestVaultConfig::setWorkers:: bad length");
    for (uint256 idx = 0; idx < addrs.length; idx++) {
      workers[addrs[idx]] = configs[idx];
      emit SetWorkers(_msgSender(), addrs[idx], address(configs[idx]));
    }
  }

  /// @dev Set whitelisted callers. Must only be called by the owner.
  function setWhitelistedCallers(address[] calldata callers, bool ok) external onlyOwner {
    for (uint256 idx = 0; idx < callers.length; idx++) {
      whitelistedCallers[callers[idx]] = ok;
      emit SetWhitelistedCaller(_msgSender(), callers[idx], ok);
    }
  }

  /// @dev Set whitelisted bots.
  function setWhitelistedBots(address[] calldata bots, bool ok) external onlyOwner {
    for (uint256 idx = 0; idx < bots.length; idx++) {
      whitelistedBots[bots[idx]] = ok;
      emit SetWhitelistedBot(_msgSender(), bots[idx], ok);
    }
  }

  /// @dev Set max kill bps. Must only be called by the owner.
  function setMaxKillBps(uint256 _maxKillBps) external onlyOwner {
    require(_maxKillBps < 1000, "ConfigurableInterestVaultConfig::setMaxKillBps:: bad _maxKillBps");
    maxKillBps = _maxKillBps;
    emit SetMaxKillBps(_msgSender(), maxKillBps);
  }

  /// @dev Return the address of wrapped native token
  function getWrappedNativeAddr() external view override returns (address) {
    return wrappedNative;
  }

  function getWNativeRelayer() external view override returns (address) {
    return wNativeRelayer;
  }

  /// @dev Return the address of MeowMining contract
  function getMeowMiningAddr() external view override returns (address) {
    return meowMining;
  }

  /// @dev Return the interest rate per year.
  function getInterestRate(
    uint256 debt,
    uint256 floating,
    uint8 decimals
  ) external view override returns (uint256) {
    return interestModel.getInterestRate(debt, floating, decimals);
  }

  /// @dev Return whether the given address is a worker.
  function isWorker(address worker) external view override returns (bool) {
    return address(workers[worker]) != address(0);
  }

  /// @dev Return whether the given worker accepts more debt. Revert on non-worker.
  function acceptDebt(address worker) external view override returns (bool) {
    return workers[worker].acceptDebt(worker);
  }

  /// @dev Return the work factor for the worker + debt, using 1e4 as denom. Revert on non-worker.
  function workFactor(address worker, uint256 debt) external view override returns (uint256) {
    return workers[worker].workFactor(worker, debt);
  }

  /// @dev Return the kill factor for the worker + debt, using 1e4 as denom. Revert on non-worker.
  function killFactor(address worker, uint256 debt) external view override returns (uint256) {
    return workers[worker].killFactor(worker, debt);
  }
}
