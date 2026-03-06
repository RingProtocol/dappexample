// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleStorage
 * @dev A simple contract to store and retrieve a number
 */
contract SimpleStorage {
    uint256 private storedData;
    
    event DataChanged(uint256 newValue);
    
    /**
     * @dev Set the stored value
     * @param x The new value to store
     */
    function set(uint256 x) public {
        storedData = x;
        emit DataChanged(x);
    }
    
    /**
     * @dev Get the stored value
     * @return The currently stored value
     */
    function get() public view returns (uint256) {
        return storedData;
    }
}
