pragma solidity 0.6.12;

interface IMeowMining {
  function MAX_DEV_FUND (  ) external view returns ( uint256 );
  function MAX_MEOW_REWARD (  ) external view returns ( uint256 );
  function addPool ( uint256 _allocPoint, address _stakeToken ) external;
  function availableUnlock ( uint256 _pid, address _holder ) external view returns ( uint256 );
  function deposit ( address _for, uint256 _pid, uint256 _amount ) external;
  function devaddr (  ) external view returns ( address );
  function developmentFund (  ) external view returns ( address );
  function emergencyWithdraw ( uint256 _pid ) external;
  function harvest ( uint256 _pid ) external;
  function isPoolExist ( address ) external view returns ( bool );
  function lockPeriod (  ) external view returns ( uint256 );
  function massUpdatePools (  ) external;
  function meow (  ) external view returns ( address );
  function meowPerSecond (  ) external view returns ( uint256 );
  function mintedDevFund (  ) external view returns ( uint256 );
  function mintedMeowReward (  ) external view returns ( uint256 );
  function owner (  ) external view returns ( address );
  function pendingMeow ( uint256 _pid, address _user ) external view returns ( uint256 );
  function poolInfo ( uint256 ) external view returns ( address stakeToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accMeowPerShare );
  function poolLength (  ) external view returns ( uint256 );
  function preShare (  ) external view returns ( uint256 );
  function renounceOwnership (  ) external;
  function setDev ( address _devaddr ) external;
  function setMeowPerSecond ( uint256 _meowPerSecond ) external;
  function setPool ( uint256 _pid, uint256 _allocPoint ) external;
  function startTime (  ) external view returns ( uint256 );
  function totalAllocPoint (  ) external view returns ( uint256 );
  function totalLock (  ) external view returns ( uint256 );
  function transferOwnership ( address newOwner ) external;
  function unlock ( uint256 _pid ) external;
  function updatePool ( uint256 _pid ) external;
  function userInfo ( uint256, address ) external view returns ( uint256 amount, uint256 rewardDebt, address fundedBy, uint256 lockedAmount, uint256 lastUnlockTime, uint256 lockTo );
  function withdraw ( address _for, uint256 _pid, uint256 _amount ) external;
  function withdrawAll ( address _for, uint256 _pid ) external;
}
