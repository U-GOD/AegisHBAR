// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {AuditEscrow} from "../src/AuditEscrow.sol";

contract AuditEscrowTest is Test {
    AuditEscrow public escrow;
    address public auditor;
    address public user;

    function setUp() public {
        auditor = address(this); // Test contract acts as the owner (auditor)
        user = address(0x123);
        
        escrow = new AuditEscrow();
    }

    // Allow the test contract to receive ETH/HBAR transfers from the escrow
    receive() external payable {}

    function test_Deposit() public {
        vm.deal(user, 10 ether);
        
        vm.prank(user);
        bytes32 depositId = escrow.deposit{value: 5 ether}(2 hours);

        AuditEscrow.Deposit memory dep = escrow.getDeposit(depositId);
        
        assertEq(dep.depositor, user);
        assertEq(dep.amount, 5 ether);
        assertEq(dep.consumed, 0);
        assertEq(dep.timeoutDuration, 2 hours);
        assertFalse(dep.refunded);
    }

    function test_ConsumePayment() public {
        vm.deal(user, 10 ether);
        
        vm.prank(user);
        bytes32 depositId = escrow.deposit{value: 5 ether}(2 hours);

        uint256 initialAuditorBalance = auditor.balance;

        escrow.consumePayment(depositId, "reentrancy", 1 ether);

        AuditEscrow.Deposit memory dep = escrow.getDeposit(depositId);
        assertEq(dep.consumed, 1 ether);
        assertEq(auditor.balance, initialAuditorBalance + 1 ether);
    }

    function test_RefundAfterTimeout() public {
        vm.deal(user, 10 ether);
        
        vm.prank(user);
        bytes32 depositId = escrow.deposit{value: 5 ether}(2 hours);

        // Fast forward time past the timeout duration
        vm.warp(block.timestamp + 3 hours);

        uint256 initialUserBalance = user.balance;

        escrow.refund(depositId);

        AuditEscrow.Deposit memory dep = escrow.getDeposit(depositId);
        assertTrue(dep.refunded);
        assertEq(user.balance, initialUserBalance + 5 ether);
    }

    function test_Revert_ConsumePaymentNonOwner() public {
        vm.deal(user, 10 ether);
        
        vm.prank(user);
        bytes32 depositId = escrow.deposit{value: 5 ether}(2 hours);

        vm.prank(user);
        vm.expectRevert(); // Should revert because user is not the owner
        escrow.consumePayment(depositId, "reentrancy", 1 ether);
    }

    function test_Revert_RefundBeforeTimeout() public {
        vm.deal(user, 10 ether);
        
        vm.prank(user);
        bytes32 depositId = escrow.deposit{value: 5 ether}(2 hours);

        vm.expectRevert("Timeout period not reached");
        escrow.refund(depositId);
    }
}
