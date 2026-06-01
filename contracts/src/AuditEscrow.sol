// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AuditEscrow is ReentrancyGuard, Ownable {
    struct Deposit {
        address depositor;
        uint256 amount;
        uint256 consumed;
        uint256 depositTime;
        uint256 timeoutDuration;
        bool refunded;
    }

    mapping(bytes32 => Deposit) public deposits;
    uint256 private _depositCounter;

    event DepositCreated(bytes32 indexed depositId, address indexed depositor, uint256 amount);
    event PaymentConsumed(bytes32 indexed depositId, string category, uint256 amount);
    event RefundIssued(bytes32 indexed depositId, address indexed depositor, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Creates an escrow deposit for audit payments.
     * @param timeoutSeconds Duration after which unconsumed funds can be refunded.
     * @return depositId Unique identifier for the created deposit.
     */
    function deposit(uint256 timeoutSeconds) external payable returns (bytes32 depositId) {
        require(msg.value > 0, "Amount must be greater than 0");
        require(timeoutSeconds >= 1 hours, "Timeout must be at least 1 hour");

        unchecked {
            _depositCounter++;
        }
        
        depositId = keccak256(abi.encodePacked(msg.sender, block.timestamp, _depositCounter));

        deposits[depositId] = Deposit({
            depositor: msg.sender,
            amount: msg.value,
            consumed: 0,
            depositTime: block.timestamp,
            timeoutDuration: timeoutSeconds,
            refunded: false
        });

        emit DepositCreated(depositId, msg.sender, msg.value);
    }

    /**
     * @notice Deducts the cost of a completed audit category scan.
     * @dev Restricted to contract owner (the auditor agent).
     * @param depositId Identifier of the target deposit.
     * @param category Name of the audit category executed.
     * @param amount Amount to deduct and transfer to the owner.
     */
    function consumePayment(bytes32 depositId, string calldata category, uint256 amount) external onlyOwner nonReentrant {
        Deposit storage dep = deposits[depositId];
        require(dep.depositor != address(0), "Deposit does not exist");
        require(!dep.refunded, "Deposit already refunded");
        require(dep.amount - dep.consumed >= amount, "Insufficient deposit balance");

        dep.consumed += amount;
        
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Transfer to owner failed");

        emit PaymentConsumed(depositId, category, amount);
    }

    /**
     * @notice Refunds unused balance to the depositor after the timeout period.
     * @param depositId Identifier of the target deposit.
     */
    function refund(bytes32 depositId) external nonReentrant {
        Deposit storage dep = deposits[depositId];
        require(dep.depositor != address(0), "Deposit does not exist");
        require(!dep.refunded, "Deposit already refunded");
        require(block.timestamp >= dep.depositTime + dep.timeoutDuration, "Timeout period not reached");

        uint256 remaining = dep.amount - dep.consumed;
        require(remaining > 0, "No remaining balance to refund");

        dep.refunded = true;

        (bool success, ) = dep.depositor.call{value: remaining}("");
        require(success, "Refund transfer failed");

        emit RefundIssued(depositId, dep.depositor, remaining);
    }

    /**
     * @notice Retrieves details of a specific deposit.
     * @param depositId Identifier of the target deposit.
     * @return Deposit struct containing deposit state.
     */
    function getDeposit(bytes32 depositId) external view returns (Deposit memory) {
        return deposits[depositId];
    }
}
