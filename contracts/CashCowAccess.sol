// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CashCowAccess
 * @dev Handles on-chain registration for Cash Cow Valley.
 * New players must call register() once to join the game.
 */
contract CashCowAccess is Ownable {
    mapping(address => bool) public registered;
    uint256 public registrationFee = 0.0001 ether; // Small fee for registration

    event UserRegistered(address indexed user);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Registers the caller. Requires the registration fee.
     */
    function register() external payable {
        require(!registered[msg.sender], "Already registered");
        require(msg.value >= registrationFee, "Insufficient registration fee");
        
        registered[msg.sender] = true;
        emit UserRegistered(msg.sender);
    }

    /**
     * @dev Admin can update the registration fee.
     */
    function setFee(uint256 _fee) external onlyOwner {
        registrationFee = _fee;
    }

    /**
     * @dev Check if a user is registered.
     */
    function isUserRegistered(address _user) external view returns (bool) {
        return registered[_user];
    }

    /**
     * @dev Withdraw accumulated fees to the owner.
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }
}
