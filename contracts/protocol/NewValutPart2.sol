// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/Math.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/Initializable.sol";

import "../utils/SafeToken.sol";
import "./interfaces/INewVault.sol";
import "./interfaces/IWorker.sol";
import "./interfaces/IMMeowFee.sol";
interface IMMeow {
  function burn(uint256 _amount) external;
}

contract NewValutPart2 is ReentrancyGuardUpgradeSafe, OwnableUpgradeSafe {
  /// @notice Libraries
  using SafeToken for address;
  using SafeMath for uint256;
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
      uint256 baseHelth;
    }
    INewVault public vaultPart1;
    IVaultConfig public config;
    modifier onlyValut() {
      require(msg.sender == address(vaultPart1) , "vault only");
      _;
    }
    function initialize() external initializer {
      OwnableUpgradeSafe.__Ownable_init();
      ReentrancyGuardUpgradeSafe.__ReentrancyGuard_init();
    }
    function setValut1(address _vaultPart1) public onlyOwner nonReentrant
    { 
      vaultPart1 = INewVault(_vaultPart1);
      config = vaultPart1.config();
    }

    function _mapPosition(uint256 _id) public view returns( Position memory pos)
    {
      (address _worker, address _owner,uint256 _debtShare,uint256 _leverageVal,uint256 _openPrice,uint256 _liqPrice,uint256 _stopLoss, uint256 _takeProfit,uint256 _openBlock,uint256 _baseHelth ) = vaultPart1.positions(_id);
      pos.worker = _worker;
      pos.owner = _owner;
      pos.debtShare = _debtShare;
      pos.leverageVal = _leverageVal;
      pos.openPrice = _openPrice;
      pos.liqPrice = _liqPrice;
      pos.stopLoss = _stopLoss;
      pos.takeProfit = _takeProfit;
      pos.openBlock = _openBlock;
      pos.baseHelth = _baseHelth;
    }
    function getmMeowFee(uint256 id , bytes calldata data) public view returns(uint256){
    
      (uint256 HEALTH_AFTER, uint256 HEALTH_BEFORE) = abi.decode( data , (uint256,uint256));
      Position memory pos = _mapPosition(id);
      pos.baseHelth = HEALTH_AFTER;
      require(config.mMeowFee() != address(0) , "meowFee should not zero address");
      IMMeowFee mMeowFee = IMMeowFee(config.mMeowFee());
      require(pos.owner == tx.origin, "not position owner");
      require(IWorker(pos.worker).health(id) != 0, "not active position");
      (,,uint256 mMeowFeeAmt )= mMeowFee.calMMeowFee(  IWorker(pos.worker).baseToken() , (HEALTH_AFTER.sub(HEALTH_BEFORE)) , pos.owner);
      return mMeowFeeAmt;
    }
      
  function canChangeSLTP(uint256 id, uint256 sl, uint256 tp) public view  returns(bool) {
    Position memory pos = _mapPosition(id);
    require(pos.owner == tx.origin , "canChangeSLTP::not position owner");
    uint256 health = IWorker(pos.worker).health(id);
    require(health > 0 , "canChangeSLTP::position is closed");
    uint256 debt = vaultPart1.debtShareToVal(pos.debtShare);
    if(sl > 0) require( health.mul(sl) >  debt.mul(10000)  , "canChangeSLTP::bad stop loss factor");
    if(tp > 0) require( health.mul(tp) <  debt.mul(10000)  , "canChangeSLTP::bad take profit factor");
    return true;
  }

      
     

}