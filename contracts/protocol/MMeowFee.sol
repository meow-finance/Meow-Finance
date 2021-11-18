// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./interfaces/IERC20.sol";
import "./interfaces/IVault.sol";
import "./interfaces/IMMeowToken.sol";

interface IMeowUtil {
  function mMeowPrice() external view returns (uint256);
  function mMeowValue(address _user) external view returns (uint256);
  function getmMeowAmountOut(address baseToken, uint256 amountIn) external view returns (uint256);
}

contract MMeowFee is Ownable {
  using SafeMath for uint256;

  address public meowUtil;
  address public mMeowToken;
  address public mMeowFeeAddress;
  uint256 public maxMMeowFeeBps;

  struct MMeowFeeInfo
  {
    //value of position in usdc
    uint256 feeVaule;
    //fee 0-100% is 0 => 10000
    uint256 feeBps;
  }
  MMeowFeeInfo[] public feeInfo;
  uint256 public mMeowReserveBps;

 constructor(address _meowUtil, address _mMeowFeeAddress, address _mMeowToken, uint256 _maxMMeowFeeBps) public
  {
    meowUtil = _meowUtil;
    mMeowFeeAddress = _mMeowFeeAddress;
    mMeowToken = _mMeowToken;
    maxMMeowFeeBps = _maxMMeowFeeBps;
  }

  ///@dev price mMeow Per Token
  function mMeowPrice() public view returns (uint256) {
    return IMeowUtil(meowUtil).mMeowPrice();
  }

  function mMeowValue(address _user) public view returns (uint256) {
    return IMeowUtil(meowUtil).mMeowValue(_user);
  }


  function feeInfoLength() public view returns (uint256) {
    return feeInfo.length;
  }

  function calMMeowFee(address _baseToken, uint256 _health, address _user ) public view returns (uint256,uint256,uint256) {
    require(meowUtil != address(0), "Meow util not set");
    require(feeInfo.length > 0 , "please set fee");
    //start in mMeow value hold
    uint256 mMeowVal = mMeowValue(_user);
    require(mMeowVal > 0, "mMeowVal is zero");
    require(mMeowVal >= feeInfo[0].feeVaule, "mMeow in your wallet less than minimum amount");
    for (uint i=(feeInfo.length - 1); i>=0; i--)
    {
      MMeowFeeInfo storage info = feeInfo[i];
      if (mMeowVal >= info.feeVaule)
      {
          uint256 mMeowFee = calMMeowAmount( _baseToken , _health.mul(info.feeBps).div(10000));
          uint256 mMeowFeeInUSDC = mMeowFee.mul(mMeowPrice()).div(1e18);
          require(mMeowVal.sub(mMeowFeeInUSDC) >= feeInfo[0].feeVaule , "mMeow less than minimum amount");
          if( mMeowVal.sub(mMeowFeeInUSDC) >= info.feeVaule )
          {
            return  (info.feeVaule, info.feeBps, mMeowFee);
          }
      }
    }
    return  (0, 0, 0);
  }

 
  function calMMeowAmount(address _baseToken, uint256 _baseTokenAmount) public view returns (uint256) {
      return IMeowUtil(meowUtil).getmMeowAmountOut(_baseToken , _baseTokenAmount);
  }

  function setMeowUtil(address _meowUtil) public onlyOwner {
    meowUtil = _meowUtil;
  }

  /// @dev Update fee address.
  function setMMeowFeeAddress(address _mMeowFeeAddress) public onlyOwner {
    require(_mMeowFeeAddress != address(0), "Meow fee address must not address(0)");
    mMeowFeeAddress = _mMeowFeeAddress;
  }

  function setMMeowFee(uint256[] calldata _feeValue, uint256[] calldata _feeBps) public onlyOwner
  {
    uint256 feeValueLength = _feeValue.length;
    require(feeValueLength == _feeBps.length , "array size not equal" );
    delete feeInfo;
    for (uint i=0; i<feeValueLength; i++)
    {
      require(_feeBps[i] <= 10000, "Fee Bps between 0 and 10000");
      require( _feeBps[i]  <= maxMMeowFeeBps, "feeBps too much" );
      if ( i > 0 ) require( _feeValue[i] > _feeValue[i-1] , "Fee value must sort by lowest to highest" );
      feeInfo.push( MMeowFeeInfo({ feeVaule: _feeValue[i], feeBps:_feeBps[i] }) );
    }
  }


  function setMMeowReserveBps(uint256 _mMeowReserveBps) public onlyOwner {
    require(_mMeowReserveBps <= 10000, "Fee Bps between 0 and 10000");
    mMeowReserveBps = _mMeowReserveBps;
  }
}