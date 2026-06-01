// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AuditEscrow is ReentrancyGuard, Ownable {
    struct Deposit {
        address depositor;
        uint256 amount;
        uint256 consumed;
        uint256 depositTime;
        uint256 timeoutDuration;
        bool refunded;
    }

    // Mapping from deposit ID to Deposit details
    mapping(bytes32 => Deposit) public deposits;
    
    // Counter to ensure unique deposit IDs
    uint256 private _depositCounter;

    event DepositCreated(bytes32 indexed depositId, address indexed depositor, uint256 amount);
    event PaymentConsumed(bytes32 indexed depositId, string category, uint256 amount);
    event RefundIssued(bytes32 indexed depositId, address indexed depositor, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Creates an escrow deposit with HBAR
     * @param timeoutSeconds Duration after which unconsumed funds can be refunded
     * @return depositId The unique ID of the deposit
     */
    function deposit(uint256 timeoutSeconds) external payable returns (bytes32 depositId) {
        require(msg.value > 0, "Must deposit HBAR");
        require(timeoutSeconds >= 1 hours, "Timeout too short");

        _depositCounter++;
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
     * @dev Deducts cost for a completed category scan. Only callable by the agent (owner).
     * @param depositId The ID of the deposit to consume from
     * @param category The name of the audit category (e.g. "reentrancy")
     * @param amount The cost to deduct in HBAR/Tinybar
     */
    function consumePayment(bytes32 depositId, string calldata category, uint256 amount) external onlyOwner nonReentrant {
        Deposit storage dep = deposits[depositId];
        require(dep.depositor != address(0), "Deposit does not exist");
        require(!dep.refunded, "Deposit already refunded");
        require(dep.amount - dep.consumed >= amount, "Insufficient funds in deposit");

        dep.consumed += amount;
        
        // Transfer the consumed amount to the agent (owner)
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Transfer failed");

        emit PaymentConsumed(depositId, category, amount);
    }

    /**
     * @dev Returns unused balance to the depositor after the timeout has passed.
     * @param depositId The ID of the deposit to refund
     */
    function refund(bytes32 depositId) external nonReentrant {
        Deposit storage dep = deposits[depositId];
        require(dep.depositor != address(0), "Deposit does not exist");
        require(!dep.refunded, "Deposit already refunded");
        require(block.timestamp >= dep.depositTime + dep.timeoutDuration, "Timeout not reached");

        uint256 remaining = dep.amount - dep.consumed;
        require(remaining > 0, "No funds left to refund");

        dep.refunded = true;

        (bool success, ) = dep.depositor.call{value: remaining}("");
        require(success, "Transfer failed");

        emit RefundIssued(depositId, dep.depositor, remaining);
    }

    /**
     * @dev Retrieves deposit details
     */
    function getDeposit(bytes32 depositId) external view returns (Deposit memory) {
        return deposits[depositId];
    }
}
