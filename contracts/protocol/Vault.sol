// SPDX-License-Identifier: MIT
pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/Math.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/Initializable.sol";

import "./interfaces/IDebtToken.sol";
import "./interfaces/IVaultConfig.sol";
import "./interfaces/IWorker.sol";
import "./interfaces/IVault.sol";
import "../token/interfaces/IMeowMining.sol";
import "../utils/SafeToken.sol";
import "./WNativeRelayer.sol";

contract Vault is IVault, ERC20UpgradeSafe, ReentrancyGuardUpgradeSafe, OwnableUpgradeSafe {
  /// @notice Libraries
  using SafeToken for address;
  using SafeMath for uint256;

  /// @notice Events
  event AddDebt(uint256 indexed id, uint256 debtShare);
  event RemoveDebt(uint256 indexed id, uint256 debtShare);
  event Work(uint256 indexed id, uint256 loan);
  event Kill(
    uint256 indexed id,
    address indexed killer,
    address owner,
    uint256 posVal,
    uint256 debt,
    uint256 prize,
    uint256 left
  );

  /// @dev Flags for manage execution scope
  uint256 private constant _NOT_ENTERED = 1;
  uint256 private constant _ENTERED = 2;
  uint256 private constant _NO_ID = uint256(-1);
  address private constant _NO_ADDRESS = address(1);
  uint256 private constant _NO_VALUE = 0;

  /// @dev Temporay variables to manage execution scope
  uint256 public _IN_EXEC_LOCK;
  uint256 public POSITION_ID;
  address public STRATEGY;
  uint256 public LEVVAL;
  uint256 public OPEN_PRICE;
  uint256 public LIQ_PRICE;
  uint256 public STOP_LOSS;
  uint256 public TAKE_PROFIT;

  /// @dev Attributes for Vault
  /// token - address of the token to be deposited in this pool
  /// name - name of the ibERC20
  /// symbol - symbol of ibERC20
  /// decimals - decimals of ibERC20, this depends on the decimal of the token
  /// debtToken - just a simple ERC20 token for staking with MeowMining
  address public override token;
  address public debtToken;

  struct Position {
    address worker;
    address owner;
    uint256 debtShare;
    uint256 leverageVal;
    uint256 openPrice;
    uint256 liqPrice;
    uint256 stopLoss;
    uint256 takeProfit;
    uint256 openBlock;
  }

  struct Liquidated {
    address worker;
    uint256 posVal;
    uint256 debt;
    uint256 killFactor;
    uint256 left;
  }

  IVaultConfig public override config;
  mapping(uint256 => Position) public override positions;
  mapping(address => Liquidated[]) public killedPosition;
  uint256 public override nextPositionID;
  uint256 public override meowMiningPoolId;

  uint256 public vaultDebtShare;
  uint256 public override vaultDebtVal;
  uint256 public lastAccrueTime;
  uint256 public override reservePool;

  /// @dev Require that the caller must be an EOA account if not whitelisted.
  modifier onlyEOAorWhitelisted() {
    if (!config.whitelistedCallers(msg.sender)) {
      require(msg.sender == tx.origin, "Vault::onlyEOAorWhitelisted:: not eoa");
    }
    _;
  }

  /// @dev Require that the caller must be whitelisted.
  modifier onlyWhitelistedCaller() {
    require(config.whitelistedCallers(msg.sender) == true, "Vault::onlyWhitelistedCaller:: !okCaller");
    _;
  }

  /// @dev Get token from msg.sender
  modifier transferTokenToVault(uint256 value) {
    if (msg.value != 0) {
      require(token == config.getWrappedNativeAddr(), "Vault::transferTokenToVault:: baseToken is not wNative");
      require(value == msg.value, "Vault::transferTokenToVault:: value != msg.value");
      IWETH(config.getWrappedNativeAddr()).deposit{ value: msg.value }();
    } else {
      SafeToken.safeTransferFrom(token, msg.sender, address(this), value);
    }
    _;
  }

  /// @dev Ensure that the function is called with the execution scope
  modifier inExec() {
    require(POSITION_ID != _NO_ID, "Vault::inExec:: not within execution scope");
    require(STRATEGY == msg.sender, "Vault::inExec:: not from the strategy");
    require(_IN_EXEC_LOCK == _NOT_ENTERED, "Vault::inExec:: in exec lock");
    _IN_EXEC_LOCK = _ENTERED;
    _;
    _IN_EXEC_LOCK = _NOT_ENTERED;
  }

  /// @dev Add more debt to the bank debt pool.
  modifier accrue(uint256 value) {
    if (now > lastAccrueTime) {
      uint256 interest = pendingInterest(value);
      uint256 toReserve = interest.mul(config.getReservePoolBps()).div(10000);
      reservePool = reservePool.add(toReserve);
      vaultDebtVal = vaultDebtVal.add(interest);
      lastAccrueTime = now;
    }
    _;
  }

  function initialize(
    IVaultConfig _config,
    address _token,
    string calldata _name,
    string calldata _symbol,
    uint8 _decimals,
    address _debtToken
  ) external initializer {
    OwnableUpgradeSafe.__Ownable_init();
    ReentrancyGuardUpgradeSafe.__ReentrancyGuard_init();
    ERC20UpgradeSafe.__ERC20_init(_name, _symbol);
    _setupDecimals(_decimals);

    nextPositionID = 1;
    config = _config;
    lastAccrueTime = now;
    token = _token;

    meowMiningPoolId = uint256(-1);

    debtToken = _debtToken;

    SafeToken.safeApprove(debtToken, config.getMeowMiningAddr(), uint256(-1));

    // free-up execution scope
    _IN_EXEC_LOCK = _NOT_ENTERED;
    POSITION_ID = _NO_ID;
    STRATEGY = _NO_ADDRESS;
    LEVVAL = _NO_VALUE;
    OPEN_PRICE = _NO_VALUE;
    LIQ_PRICE = _NO_VALUE;
    STOP_LOSS = _NO_VALUE;
    TAKE_PROFIT = _NO_VALUE;
  }

  /// @dev Return the pending interest that will be accrued in the next call.
  /// @param value Balance value to subtract off address(this).balance when called from payable functions.
  function pendingInterest(uint256 value) public view returns (uint256) {
    if (now > lastAccrueTime) {
      uint256 timePast = now.sub(lastAccrueTime);
      uint256 balance = SafeToken.myBalance(token).sub(value).sub(reservePool);
      uint256 ratePerYear = config.getInterestRate(vaultDebtVal, balance, decimals());
      return ratePerYear.mul(vaultDebtVal).mul(timePast).div(365 days).div(1e18).div(10**uint256(decimals()));
    } else {
      return 0;
    }
  }

  /// @dev Return the Token debt value given the debt share. Be careful of unaccrued interests.
  /// @param debtShare The debt share to be converted.
  function debtShareToVal(uint256 debtShare) public view returns (uint256) {
    if (vaultDebtShare == 0) return debtShare; // When there's no share, 1 share = 1 val.
    return debtShare.mul(vaultDebtVal).div(vaultDebtShare);
  }

  /// @dev Return the debt share for the given debt value. Be careful of unaccrued interests.
  /// @param debtVal The debt value to be converted.
  function debtValToShare(uint256 debtVal) public view returns (uint256) {
    if (vaultDebtShare == 0) return debtVal; // When there's no share, 1 share = 1 val.
    return debtVal.mul(vaultDebtShare).div(vaultDebtVal);
  }

  /// @dev Return Token value and debt of the given position. Be careful of unaccrued interests.
  /// @param id The position ID to query.
  function positionInfo(uint256 id) external view override returns (uint256, uint256) {
    Position storage pos = positions[id];
    return (IWorker(pos.worker).health(id), debtShareToVal(pos.debtShare));
  }

  /// @dev Return the total token entitled to the token holders. Be careful of unaccrued interests.
  function totalToken() public view override returns (uint256) {
    return SafeToken.myBalance(token).add(vaultDebtVal).sub(reservePool);
  }

  /// @dev Add more token to the lending pool. Hope to get some good returns.
  function deposit(uint256 amountToken)
    external
    payable
    override
    transferTokenToVault(amountToken)
    accrue(amountToken)
    nonReentrant
  {
    _deposit(amountToken);
  }

  function _deposit(uint256 amountToken) internal {
    uint256 total = totalToken().sub(amountToken);
    uint256 share = total == 0 ? amountToken : amountToken.mul(totalSupply()).div(total);
    _mint(msg.sender, share);
    require(totalSupply() > 10**uint256(decimals() - 1), "Vault::deposit:: total supply too low");
  }

  /// @dev Withdraw token from the lending and burning ibToken.
  function withdraw(uint256 share) external override accrue(0) nonReentrant {
    uint256 amount = share.mul(totalToken()).div(totalSupply());
    _burn(msg.sender, share);
    if (token == config.getWrappedNativeAddr()) {
      SafeToken.safeTransfer(token, config.getWNativeRelayer(), amount);
      WNativeRelayer(uint160(config.getWNativeRelayer())).withdraw(amount);
      SafeToken.safeTransferETH(msg.sender, amount);
    } else {
      SafeToken.safeTransfer(token, msg.sender, amount);
    }
    require(
      totalSupply() > 10**uint256(decimals() - 1) || totalSupply() == 0,
      "Vault::withdraw:: total supply too low"
    );
  }

  /// @dev Request Funds from user through Vault
  function requestFunds(address targetedToken, uint256 amount) external override inExec {
    SafeToken.safeTransferFrom(targetedToken, positions[POSITION_ID].owner, msg.sender, amount);
  }

  /// @dev Mint & deposit debtToken on behalf of farmers
  /// @param id The ID of the position
  /// @param amount The amount of debt that the position holds
  function _meowMiningDeposit(uint256 id, uint256 amount) internal {
    if (amount > 0) {
      IDebtToken(debtToken).mint(address(this), amount);
      IMeowMining(config.getMeowMiningAddr()).deposit(positions[id].owner, meowMiningPoolId, amount);
    }
  }

  /// @dev Withdraw & burn debtToken on behalf of farmers
  /// @param id The ID of the position
  function _meowMiningWithdraw(uint256 id) internal {
    if (positions[id].debtShare > 0) {
      // Note: Do this way because we don't want to fail open, close, or kill position
      // if cannot withdraw from MeowMining somehow. 0xb5c5f672 is a signature of withdraw(address,uint256,uint256)
      (bool success, ) = config.getMeowMiningAddr().call(
        abi.encodeWithSelector(0xb5c5f672, positions[id].owner, meowMiningPoolId, positions[id].debtShare)
      );
      if (success) IDebtToken(debtToken).burn(address(this), positions[id].debtShare);
    }
  }

  /// @dev Create a new farming position to unlock your yield farming potential.
  /// @param id The ID of the position to unlock the earning. Use ZERO for new position.
  /// @param worker The address of the authorized worker to work for this position.
  /// @param loan The amount of Token to borrow from the pool.
  /// @param maxReturn The max amount of Token to return to the pool.
  /// @param data The calldata to pass along to the worker for more working context.
  function work(
    uint256 id,
    address worker,
    uint256 principalAmount,
    uint256 loan,
    uint256 maxReturn,
    bytes calldata data
  ) external payable onlyEOAorWhitelisted transferTokenToVault(principalAmount) accrue(principalAmount) nonReentrant {
    require(meowMiningPoolId != uint256(-1), "Vault::work:: poolId not set");
    (LEVVAL, OPEN_PRICE, LIQ_PRICE, STOP_LOSS, TAKE_PROFIT, , ) = abi.decode(
      data,
      (uint256, uint256, uint256, uint256, uint256, address, bytes)
    );
    // 1. Sanity check the input position, or add a new position of ID is 0.
    Position storage pos;
    if (id == 0) {
      id = nextPositionID++;
      pos = positions[id];
      pos.worker = worker;
      pos.owner = msg.sender;
      pos.leverageVal = LEVVAL;
      pos.openPrice = OPEN_PRICE;
      pos.liqPrice = LIQ_PRICE;
      pos.stopLoss = STOP_LOSS;
      pos.takeProfit = TAKE_PROFIT;
      pos.openBlock = block.number;
    } else {
      pos = positions[id];
      require(id < nextPositionID, "Vault::work:: bad position id");
      require(pos.worker == worker, "Vault::work:: bad position worker");
      require(pos.owner == msg.sender, "Vault::work:: not position owner");
      _meowMiningWithdraw(id);
    }
    emit Work(id, loan);
    // Update execution scope variables
    POSITION_ID = id;
    (, , , , , STRATEGY, ) = abi.decode(data, (uint256, uint256, uint256, uint256, uint256, address, bytes));
    // 2. Make sure the worker can accept more debt and remove the existing debt.
    require(config.isWorker(worker), "Vault::work:: not a worker");
    require(loan == 0 || config.acceptDebt(worker), "Vault::work:: worker not accept more debt");
    uint256 debt = _removeDebt(id).add(loan);
    // 3. Perform the actual work, using a new scope to avoid stack-too-deep errors.
    uint256 back;
    {
      uint256 sendERC20 = principalAmount.add(loan);
      require(
        sendERC20 <= SafeToken.myBalance(token).sub(reservePool),
        "Vault::work:: insufficient funds in the vault"
      );
      uint256 beforeERC20 = SafeToken.myBalance(token).sub(sendERC20);
      SafeToken.safeTransfer(token, worker, sendERC20);
      IWorker(worker).work(id, msg.sender, debt, data);
      back = SafeToken.myBalance(token).sub(beforeERC20);
    }
    // 4. Check and update position debt.
    uint256 lessDebt = Math.min(debt, Math.min(back, maxReturn));
    debt = debt.sub(lessDebt);
    if (debt > 0) {
      require(debt >= config.minDebtSize(), "Vault::work:: too small debt size");
      uint256 health = IWorker(worker).health(id);
      uint256 workFactor = config.workFactor(worker, debt);
      require(health.mul(workFactor) >= debt.mul(10000), "Vault::work:: bad work factor");
      _addDebt(id, debt);
      _meowMiningDeposit(id, pos.debtShare);
    }
    // 5. Release execution scope
    POSITION_ID = _NO_ID;
    STRATEGY = _NO_ADDRESS;
    LEVVAL = _NO_VALUE;
    OPEN_PRICE = _NO_VALUE;
    LIQ_PRICE = _NO_VALUE;
    STOP_LOSS = _NO_VALUE;
    TAKE_PROFIT = _NO_VALUE;
    // 6. Return excess token back.
    if (back > lessDebt) {
      if (token == config.getWrappedNativeAddr()) {
        SafeToken.safeTransfer(token, config.getWNativeRelayer(), back.sub(lessDebt));
        WNativeRelayer(uint160(config.getWNativeRelayer())).withdraw(back.sub(lessDebt));
        SafeToken.safeTransferETH(msg.sender, back.sub(lessDebt));
      } else {
        SafeToken.safeTransfer(token, msg.sender, back.sub(lessDebt));
      }
    }
  }

  /// @dev Kill the given to the position. Liquidate it immediately if killFactor condition is met.
  /// @param id The position ID to be killed.
  function kill(uint256 id) external onlyWhitelistedCaller accrue(0) nonReentrant {
    require(meowMiningPoolId != uint256(-1), "Vault::kill:: poolId not set");
    // 1. Verify that the position is eligible for liquidation.
    Position storage pos = positions[id];
    require(pos.debtShare > 0, "Vault::kill:: no debt");
    // 2. Distribute ALPACAs in MeowMining to owner
    _meowMiningWithdraw(id);
    uint256 debt = _removeDebt(id);
    uint256 health = IWorker(pos.worker).health(id);
    uint256 killFactor = config.killFactor(pos.worker, debt);
    require(health.mul(killFactor) < debt.mul(10000), "Vault::kill:: can't liquidate");
    // 3. Perform liquidation and compute the amount of token received.
    uint256 beforeToken = SafeToken.myBalance(token);
    IWorker(pos.worker).liquidate(id);
    uint256 back = SafeToken.myBalance(token).sub(beforeToken);
    uint256 prize = back.mul(config.getKillBps()).div(10000);
    uint256 rest = back.sub(prize);
    // 4. Clear position debt and return funds to liquidator and position owner.
    if (prize > 0) {
      if (token == config.getWrappedNativeAddr()) {
        SafeToken.safeTransfer(token, config.getWNativeRelayer(), prize);
        WNativeRelayer(uint160(config.getWNativeRelayer())).withdraw(prize);
        SafeToken.safeTransferETH(msg.sender, prize);
      } else {
        SafeToken.safeTransfer(token, msg.sender, prize);
      }
    }
    uint256 left = rest > debt ? rest - debt : 0;
    if (left > 0) {
      if (token == config.getWrappedNativeAddr()) {
        SafeToken.safeTransfer(token, config.getWNativeRelayer(), left);
        WNativeRelayer(uint160(config.getWNativeRelayer())).withdraw(left);
        SafeToken.safeTransferETH(pos.owner, left);
      } else {
        SafeToken.safeTransfer(token, pos.owner, left);
      }
    }
    // 5. Keep liquidated position.
    killedPosition[pos.owner].push(
      Liquidated({ worker: pos.worker, posVal: health, debt: debt, killFactor: killFactor, left: left })
    );

    emit Kill(id, msg.sender, pos.owner, health, debt, prize, left);
  }

  /// @dev Return liquidated positions for given address.
  function getKilledPosition(address _owner) public view returns (Liquidated[] memory) {
    return killedPosition[_owner];
  }

  /// @dev Internal function to add the given debt value to the given position.
  function _addDebt(uint256 id, uint256 debtVal) internal {
    Position storage pos = positions[id];
    uint256 debtShare = debtValToShare(debtVal);
    pos.debtShare = pos.debtShare.add(debtShare);
    vaultDebtShare = vaultDebtShare.add(debtShare);
    vaultDebtVal = vaultDebtVal.add(debtVal);
    emit AddDebt(id, debtShare);
  }

  /// @dev Internal function to clear the debt of the given position. Return the debt value.
  function _removeDebt(uint256 id) internal returns (uint256) {
    Position storage pos = positions[id];
    uint256 debtShare = pos.debtShare;
    if (debtShare > 0) {
      uint256 debtVal = debtShareToVal(debtShare);
      pos.debtShare = 0;
      vaultDebtShare = vaultDebtShare.sub(debtShare);
      vaultDebtVal = vaultDebtVal.sub(debtVal);
      emit RemoveDebt(id, debtShare);
      return debtVal;
    } else {
      return 0;
    }
  }

  /// @dev Update bank configuration to a new address. Must only be called by owner.
  /// @param _config The new configurator address.
  function updateConfig(IVaultConfig _config) external onlyOwner {
    config = _config;
  }

  /// @dev Update debtToken to a new address. Must only be called by owner.
  /// @param _debtToken The new DebtToken
  function updateDebtToken(address _debtToken, uint256 _newPid) external onlyOwner {
    require(_debtToken != token, "Vault::updateDebtToken:: _debtToken must not be the same as token");
    address[] memory okHolders = new address[](2);
    okHolders[0] = address(this);
    okHolders[1] = config.getMeowMiningAddr();
    IDebtToken(_debtToken).setOkHolders(okHolders, true);
    debtToken = _debtToken;
    meowMiningPoolId = _newPid;
    SafeToken.safeApprove(debtToken, config.getMeowMiningAddr(), uint256(-1));
  }

  function setMeowMiningPoolId(uint256 _poolId) external onlyOwner {
    SafeToken.safeApprove(debtToken, config.getMeowMiningAddr(), uint256(-1));
    meowMiningPoolId = _poolId;
  }

  /// @dev Withdraw BaseToken reserve for underwater positions to the given address.
  /// @param to The address to transfer BaseToken to.
  /// @param value The number of BaseToken tokens to withdraw. Must not exceed `reservePool`.
  function withdrawReserve(address to, uint256 value) external onlyOwner nonReentrant {
    reservePool = reservePool.sub(value);
    SafeToken.safeTransfer(token, to, value);
  }

  /// @dev Reduce BaseToken reserve, effectively giving them to the depositors.
  /// @param value The number of BaseToken reserve to reduce.
  function reduceReserve(uint256 value) external onlyOwner {
    reservePool = reservePool.sub(value);
  }

  /// @dev Fallback function to accept ETH. Workers will send ETH back the pool.
  receive() external payable {}
}
