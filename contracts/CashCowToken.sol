// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CashCowToken
 * @dev The official token for Cash Cow Valley ($CASHCOW).
 */
contract CashCowToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("CashCow", "COW") Ownable(initialOwner) {
        // Initial supply for liquidity and eco-system if needed
        _mint(initialOwner, 1000000 * 10**decimals());
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
