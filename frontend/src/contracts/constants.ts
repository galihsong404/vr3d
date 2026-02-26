export const CASH_COW_TOKEN_ADDRESS = '0x...'; // Placeholder
export const GOLDEN_COW_STAKING_ADDRESS = '0x...'; // Placeholder
export const GOLDEN_COW_NFT_ADDRESS = '0x...'; // Placeholder
export const CASH_COW_ACCESS_ADDRESS = '0x...'; // Placeholder - Registration Contract

export const CASH_COW_TOKEN_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address, uint256) returns (bool)",
    "function allowance(address, address) view returns (uint256)",
    "function approve(address, uint256) returns (bool)",
    "function transferFrom(address, address, uint256) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

export const GOLDEN_COW_STAKING_ABI = [
    "function cashCowToken() view returns (address)",
    "function goldenCowNFT() view returns (address)",
    "function treasury() view returns (address)",
    "function LOCK_DURATION() view returns (uint256)",
    "function unlockedPools(uint8) view returns (uint256 emissionRatePerMinute, uint256 totalStaked, uint256 lastGlobalUpdateTime, uint256 rewardPerTokenStored)",
    "function lockedFees(uint8) view returns (uint256)",
    "function lockedRewards(uint8) view returns (uint256)",
    "function stakes(uint256) view returns (uint8 stakeType, uint8 cowType, address owner, uint256 startTime, uint256 lastClaimTime, uint256 fixedDailyReward, uint256 userRewardPerTokenPaid, uint256 accumulatedRewards)",
    "function stakeUnlocked(uint256 tokenId, uint8 cType)",
    "function claimUnlocked(uint256 tokenId)",
    "function unstakeUnlocked(uint256 tokenId)",
    "function stakeLocked(uint256 tokenId, uint8 cType)",
    "function claimLocked(uint256 tokenId)",
    "function unstakeLocked(uint256 tokenId)",
    "function setEmissionRate(uint8 cType, uint256 newRate)",
    "function setLockDuration(uint256 newDuration)",
    "function setFee(uint8 cType, uint256 fee)",
    "function setLockedReward(uint8 cType, uint256 reward)",
    "function setTreasury(address newTreasury)"
];

export const GOLDEN_COW_NFT_ABI = [
    "function buyNFT(uint8 cType, bool useCOW)",
    "function getCowType(uint256 tokenId) view returns (uint8)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)"
];

export const CASH_COW_ACCESS_ABI = [
    "function register() payable",
    "function registered(address) view returns (bool)",
    "function registrationFee() view returns (uint256)",
    "function isUserRegistered(address user) view returns (bool)"
];
