// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GoldenCowStaking
 * @dev Implements the Web3 Golden Cow Staking Mechanics for Cash Cow Valley.
 * Features two distinct pools:
 * 1. Unlocked (Flexible): Free to enter. Rewards are dynamic based on global emissions.
 * 2. Locked (100-Day Fixed): Requires an upfront fee. Locks NFT for 100 days. Guaranteed fixed daily yield.
 */

// Minimal openzeppelin interfaces to avoid full installation just for compilation
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function mint(address to, uint256 amount) external;
}

interface IERC721 {
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract GoldenCowStaking {
    IERC20 public cashCowToken;
    IERC721 public goldenCowNFT;
    address public treasury;
    address public devWallet; // Wallet for claim fees

    uint256 public CLAIM_FEE = 10 * 10**18; // 10 Tokens fixed

    enum CowType { BABY_GOLDEN, GOLDEN, RANCH }
    enum StakeType { NONE, UNLOCKED, LOCKED }

    struct StakeInfo {
        StakeType stakeType;
        CowType cowType;
        address owner;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 fixedDailyReward; // Only used for LOCKED
        uint256 userRewardPerTokenPaid; // Only used for UNLOCKED
        uint256 accumulatedRewards;
    }

    struct PoolInfo {
        uint256 emissionRatePerMinute;
        uint256 totalStaked;
        uint256 lastGlobalUpdateTime;
        uint256 rewardPerTokenStored;
    }

    // 3 Unlocked Pools
    mapping(CowType => PoolInfo) public unlockedPools;
    
    // Locked Settings
    uint256 public LOCK_DURATION = 100 days;
    mapping(CowType => uint256) public lockedFees;
    mapping(CowType => uint256) public lockedRewards;

    mapping(uint256 => StakeInfo) public stakes;
    address public admin;

    modifier onlyOwner() {
        require(msg.sender == admin, "Not owner");
        _;
    }

    constructor(address _nftToken, address _erc20Token, address _treasury, address _devWallet) {
        admin = msg.sender;
        goldenCowNFT = IERC721(_nftToken);
        cashCowToken = IERC20(_erc20Token);
        treasury = _treasury;
        devWallet = _devWallet;

        // Default Unlocked Emissions
        unlockedPools[CowType.BABY_GOLDEN].emissionRatePerMinute = 2 * 10**18;
        unlockedPools[CowType.GOLDEN].emissionRatePerMinute = 5 * 10**18;
        unlockedPools[CowType.RANCH].emissionRatePerMinute = 20 * 10**18;

        // Default Locked Rewards (Fixed Daily)
        lockedRewards[CowType.BABY_GOLDEN] = 10 * 10**18;
        lockedRewards[CowType.GOLDEN] = 100 * 10**18;
        lockedRewards[CowType.RANCH] = 500 * 10**18;

        // Default Locked Fees (50% of Total Reward for 100 Days)
        // Baby: 10 * 100 = 1000. 50% = 500.
        // Golden: 100 * 100 = 10000. 50% = 5000.
        // Ranch: 500 * 100 = 50000. 50% = 25000.
        lockedFees[CowType.BABY_GOLDEN] = 500 * 10**18;
        lockedFees[CowType.GOLDEN] = 5000 * 10**18;
        lockedFees[CowType.RANCH] = 25000 * 10**18;
    }

    // --- Admin Setter Functions ---

    function setEmissionRate(CowType cType, uint256 newRate) external onlyOwner {
        _updateGlobalReward(cType);
        unlockedPools[cType].emissionRatePerMinute = newRate;
    }

    function setLockDuration(uint256 newDuration) external onlyOwner {
        LOCK_DURATION = newDuration;
    }

    function setFee(CowType cType, uint256 fee) external onlyOwner {
        lockedFees[cType] = fee;
    }

    function setLockedReward(CowType cType, uint256 reward) external onlyOwner {
        lockedRewards[cType] = reward;
    }
    
    function setTreasury(address newTreasury) external onlyOwner {
        treasury = newTreasury;
    }

    function setDevWallet(address _dev) external onlyOwner {
        devWallet = _dev;
    }

    function setClaimFee(uint256 _newFee) external onlyOwner {
        CLAIM_FEE = _newFee;
    }

    // --- Unlocked Pool Mechanics ---

    function _updateGlobalReward(CowType cType) internal {
        PoolInfo storage pool = unlockedPools[cType];
        if (pool.totalStaked == 0) {
            pool.lastGlobalUpdateTime = block.timestamp;
            return;
        }
        uint256 timeDelta = (block.timestamp - pool.lastGlobalUpdateTime) / 60; // Minutes
        if (timeDelta > 0) {
            uint256 rewardToDistribute = timeDelta * pool.emissionRatePerMinute;
            pool.rewardPerTokenStored += (rewardToDistribute * 1e18) / pool.totalStaked;
            pool.lastGlobalUpdateTime = block.timestamp;
        }
    }

    function _earnedUnlocked(uint256 tokenId) internal view returns (uint256) {
        StakeInfo memory st = stakes[tokenId];
        PoolInfo memory pool = unlockedPools[st.cowType];
        return (1 * (pool.rewardPerTokenStored - st.userRewardPerTokenPaid)) / 1e18 + st.accumulatedRewards;
    }

    function stakeUnlocked(uint256 tokenId, CowType cType) external {
        require(stakes[tokenId].stakeType == StakeType.NONE, "Already staked");
        _updateGlobalReward(cType);
        
        goldenCowNFT.transferFrom(msg.sender, address(this), tokenId);
        
        unlockedPools[cType].totalStaked += 1;
        stakes[tokenId] = StakeInfo({
            stakeType: StakeType.UNLOCKED,
            cowType: cType,
            owner: msg.sender,
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            fixedDailyReward: 0,
            userRewardPerTokenPaid: unlockedPools[cType].rewardPerTokenStored,
            accumulatedRewards: 0
        });
    }

    function claimUnlocked(uint256 tokenId) public {
        StakeInfo storage st = stakes[tokenId];
        require(st.owner == msg.sender, "Not owner");
        require(st.stakeType == StakeType.UNLOCKED, "Not unlocked stake");
        
        _updateGlobalReward(st.cowType);
        uint256 reward = _earnedUnlocked(tokenId);
        
        if (reward > 0) {
            // Charge Claim Fee
            require(cashCowToken.transferFrom(msg.sender, devWallet, CLAIM_FEE), "Claim fee failed");
            
            st.accumulatedRewards = 0;
            st.userRewardPerTokenPaid = unlockedPools[st.cowType].rewardPerTokenStored;
            cashCowToken.mint(msg.sender, reward);
        }
    }

    function unstakeUnlocked(uint256 tokenId) external {
        StakeInfo storage st = stakes[tokenId];
        require(st.owner == msg.sender, "Not owner");
        CowType cType = st.cowType;
        
        claimUnlocked(tokenId);
        
        unlockedPools[cType].totalStaked -= 1;
        delete stakes[tokenId];
        
        goldenCowNFT.transferFrom(address(this), msg.sender, tokenId);
    }

    // --- Locked Pool Mechanics ---

    function stakeLocked(uint256 tokenId, CowType cType) external {
        require(stakes[tokenId].stakeType == StakeType.NONE, "Already staked");
        
        uint256 fee = lockedFees[cType];
        
        require(cashCowToken.transferFrom(msg.sender, treasury, fee), "Fee failed");
        goldenCowNFT.transferFrom(msg.sender, address(this), tokenId);

        stakes[tokenId] = StakeInfo({
            stakeType: StakeType.LOCKED,
            cowType: cType,
            owner: msg.sender,
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            fixedDailyReward: lockedRewards[cType],
            userRewardPerTokenPaid: 0,
            accumulatedRewards: 0
        });
    }

    function _earnedLocked(uint256 tokenId) internal view returns (uint256) {
        StakeInfo memory st = stakes[tokenId];
        uint256 timeElapsed = block.timestamp - st.lastClaimTime;
        uint256 totalTimeSinceStart = block.timestamp - st.startTime;
        
        if (totalTimeSinceStart > LOCK_DURATION) {
            uint256 effectiveEnd = st.startTime + LOCK_DURATION;
            if (st.lastClaimTime >= effectiveEnd) return 0;
            timeElapsed = effectiveEnd - st.lastClaimTime;
        }
        
        uint256 daysElapsed = timeElapsed / 1 days;
        return daysElapsed * st.fixedDailyReward;
    }

    function claimLocked(uint256 tokenId) public {
        StakeInfo storage st = stakes[tokenId];
        require(st.owner == msg.sender, "Not owner");
        require(st.stakeType == StakeType.LOCKED, "Not locked stake");

        uint256 reward = _earnedLocked(tokenId);
        if (reward > 0) {
            // Charge Claim Fee
            require(cashCowToken.transferFrom(msg.sender, devWallet, CLAIM_FEE), "Claim fee failed");
            
            uint256 daysClaimed = reward / st.fixedDailyReward;
            st.lastClaimTime += daysClaimed * 1 days;
            cashCowToken.mint(msg.sender, reward);
        }
    }

    function unstakeLocked(uint256 tokenId) external {
        StakeInfo storage st = stakes[tokenId];
        require(st.owner == msg.sender, "Not owner");
        require(block.timestamp >= st.startTime + LOCK_DURATION, "Locked");

        claimLocked(tokenId);
        delete stakes[tokenId];
        
        goldenCowNFT.transferFrom(address(this), msg.sender, tokenId);
    }
}
