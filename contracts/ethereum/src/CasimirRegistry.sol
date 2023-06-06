// SPDX-License-Identifier: Apache
pragma solidity 0.8.18;

import './interfaces/ICasimirRegistry.sol';
import './interfaces/ICasimirManager.sol';
import './libraries/Types.sol';
import './vendor/interfaces/ISSVNetworkViews.sol';
import "@openzeppelin/contracts/access/Ownable.sol";

// Todo efficiently reshare or exit pools when deregistering

contract CasimirRegistry is ICasimirRegistry, Ownable {
    using TypesAddress for address;

    ICasimirManager private manager;
    ISSVNetworkViews private ssvNetworkViews;
    uint256 requiredCollateral = 4 ether;
    uint256 minimumCollateralDeposit = 100000000000000000;
    uint256 totalCollateral;
    mapping(uint64 => Operator) private operators;

    /*************/
    /* Modifiers */
    /*************/

    /**
     * @dev Validate the caller is owner or the authorized pool
     */
    modifier onlyOwnerOrPool(uint32 poolId) {
        require(
            msg.sender == owner() ||
            msg.sender == manager.getPoolAddress(poolId),
            "Only owner or the authorized pool can call this function"
        );
        _;
    }

    constructor(address ssvNetworkViewsAddress) {
        manager = ICasimirManager(msg.sender);
        ssvNetworkViews = ISSVNetworkViews(ssvNetworkViewsAddress);
    }

    /**
     * @notice Register an operator with the set
     * @param operatorId The operator ID
     */
    function registerOperator(uint64 operatorId) external payable {
        require(msg.value >= requiredCollateral, "Insufficient registration collateral");
        (address operatorOwner, , , ,) = ssvNetworkViews.getOperatorById(operatorId);
        require(msg.sender == operatorOwner, "Only operator owner can register");

        totalCollateral += msg.value;
        Operator storage operator = operators[operatorId]; 
        operator.active = true;
        operator.collateral = int256(msg.value);

        emit OperatorRegistered(operatorId);
    }

    /**
     * @notice Deposit collateral for an operator
     * @param operatorId The operator ID
     */
    function depositCollateral(uint64 operatorId) external payable {
        require(msg.value > minimumCollateralDeposit, "Insufficient collateral deposit");
        Operator storage operator = operators[operatorId];
        (address operatorOwner, , , ,) = ssvNetworkViews.getOperatorById(operatorId);
        require(msg.sender == operatorOwner, "Only operator owner can deposit collateral");

        operator.collateral += int256(msg.value);
    }

    /**
     * @notice Withdraw collateral for an operator
     * @param operatorId The operator ID
     * @param amount The amount to withdraw
     */
    function withdrawCollateral(uint64 operatorId, uint256 amount) external {
        Operator storage operator = operators[operatorId];
        (address operatorOwner, , , ,) = ssvNetworkViews.getOperatorById(operatorId);
        require(msg.sender == operatorOwner, "Only operator owner can withdraw collateral");
        require(operator.collateral >= int256(amount), "Insufficient collateral");

        operator.collateral -= int256(amount);
        totalCollateral -= amount;
        operatorOwner.send(amount);
    }

    /**
     * @notice Add a pool to an operator
     * @param operatorId The operator ID
     * @param poolId The pool ID
     */
    function addOperatorPool(uint64 operatorId, uint32 poolId) external onlyOwner {
        Operator storage operator = operators[operatorId];
        require(operator.active, "Operator is not active");
        require(operator.collateral >= 0, "Operator owes collateral");
        require(!operator.deregistering, "Operator is deregistering");
        require(!operator.pools[poolId], "Pool is already active for operator");
        operator.pools[poolId] = true;
        operator.poolCount += 1;
    }

    /**
     * @notice Remove a pool from an operator
     * @param operatorId The operator ID
     * @param poolId The pool ID
     * @param blameAmount The amount to recover from collateral
     */
    function removeOperatorPool(uint64 operatorId, uint32 poolId, uint256 blameAmount) external onlyOwnerOrPool(poolId) {
        Operator storage operator = operators[operatorId];
        require(operator.pools[poolId], "Pool is not active for operator");

        operator.pools[poolId] = false;
        operator.poolCount -= 1;

        if (blameAmount > 0) {
            uint256 recoverableCollateral;
            if (operator.collateral >= int256(blameAmount)) {
                recoverableCollateral = blameAmount;
            } else if (operator.collateral > 0) {
                recoverableCollateral = uint256(operator.collateral);
            }
            operator.collateral -= int256(blameAmount);
            manager.depositRecoveredBalance{value: recoverableCollateral}(poolId);
        }
    }

    /**
     * @notice Get the collateral for an operator
     * @param operatorId The operator ID
     * @return The collateral
     */
    function getOperatorCollateral(uint64 operatorId) external view returns (int256) {
        return operators[operatorId].collateral;
    }    
}