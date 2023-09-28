// SPDX-License-Identifier: Apache
pragma solidity 0.8.18;

import "../interfaces/ICasimirManager.sol";


library CasimirArray {
    
    error IndexOutOfBounds();
    error EmptyArray();

    function removeUint32Item(uint32[] storage uint32Array, uint index) public {
        if (uint32Array.length == 0) {
            revert EmptyArray();
        }
        if (index >= uint32Array.length) {
            revert IndexOutOfBounds();
        }
        for (uint i = index; i < uint32Array.length - 1; i++) {
            uint32Array[i] = uint32Array[i + 1];
        }
        uint32Array.pop();
    }

    function removeBytesItem(bytes[] storage bytesArray, uint index) public {
        if (bytesArray.length == 0) {
            revert EmptyArray();
        }
        if (index >= bytesArray.length) {
            revert IndexOutOfBounds();
        }
        for (uint i = index; i < bytesArray.length - 1; i++) {
            bytesArray[i] = bytesArray[i + 1];
        }
        bytesArray.pop();
    }

    function removeWithdrawalItem(
        ICasimirManager.Withdrawal[] storage withdrawals,
        uint index
    ) public {
        if (withdrawals.length == 0) {
            revert EmptyArray();
        }
        if (index >= withdrawals.length) {
            revert IndexOutOfBounds();
        }
        for (uint i = index; i < withdrawals.length - 1; i++) {
            withdrawals[i] = withdrawals[i + 1];
        }
        withdrawals.pop();
    }
}
