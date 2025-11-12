// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AIPRegistry {
    mapping(address => bytes32) public identity;
    event Registered(address indexed user, bytes32 hash);

    function registerIdentity(bytes32 hash) external {
        identity[msg.sender] = hash;
        emit Registered(msg.sender, hash);
    }

    function verify(address user) external view returns (bytes32) {
        return identity[user];
    }
}
