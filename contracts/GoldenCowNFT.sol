// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GoldenCowNFT is ERC721, Ownable {
    using Counters for uint256;
    Counters.Counter private _tokenIds;

    IERC20 public cowToken;
    IERC20 public usdtToken;
    address public treasury;

    enum CowType { BABY_GOLDEN, GOLDEN, RANCH }

    struct ItemPrice {
        uint256 cowPrice;
        uint256 usdtPrice;
    }

    mapping(CowType => ItemPrice) public prices;
    mapping(uint256 => CowType) public tokenTypes;

    event NFTBought(address indexed buyer, uint256 tokenId, CowType cType, string currency);

    constructor(address _cowToken, address _usdtToken, address _treasury) ERC721("Golden Cow NFT", "GCOW") Ownable(msg.sender) {
        cowToken = IERC20(_cowToken);
        usdtToken = IERC20(_usdtToken);
        treasury = _treasury;

        // Default Prices
        prices[CowType.BABY_GOLDEN] = ItemPrice(1000 * 10**18, 10 * 10**18); // 1000 COW or 10 USDT
        prices[CowType.GOLDEN] = ItemPrice(10000 * 10**18, 100 * 10**18);    // 10000 COW or 100 USDT
        prices[CowType.RANCH] = ItemPrice(50000 * 10**18, 500 * 10**18);     // 50000 COW or 500 USDT
    }

    function setPrice(CowType cType, uint256 cowPrice, uint256 usdtPrice) external onlyOwner {
        prices[cType] = ItemPrice(cowPrice, usdtPrice);
    }

    function buyNFT(CowType cType, bool useCOW) external {
        uint256 price;
        IERC20 token;
        string memory currency;

        if (useCOW) {
            price = prices[cType].cowPrice;
            token = cowToken;
            currency = "COW";
        } else {
            price = prices[cType].usdtPrice;
            token = usdtToken;
            currency = "USDT";
        }

        require(token.transferFrom(msg.sender, treasury, price), "Transfer failed");

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        tokenTypes[newItemId] = cType;

        emit NFTBought(msg.sender, newItemId, cType, currency);
    }

    // Admin mint for rewards or airdrops
    function adminMint(address to, CowType cType) external onlyOwner {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(to, newItemId);
        tokenTypes[newItemId] = cType;
    }

    function getCowType(uint256 tokenId) external view returns (CowType) {
        require(_exists(tokenId), "Nonexistent token");
        return tokenTypes[tokenId];
    }
}
