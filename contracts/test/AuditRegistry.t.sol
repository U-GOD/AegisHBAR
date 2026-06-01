// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {AuditRegistry} from "../src/AuditRegistry.sol";

contract AuditRegistryTest is Test {
    AuditRegistry public registry;
    address public auditor;
    address public user;
    
    bytes32 constant CONTRACT_HASH = keccak256("contract source code");
    string constant HCS_TOPIC = "0.0.12345";
    
    function setUp() public {
        auditor = address(this); // Test contract acts as the auditor (owner)
        user = address(0x123);
        registry = new AuditRegistry();
    }

    function test_StartAudit() public {
        bytes32 auditId = registry.startAudit(CONTRACT_HASH, HCS_TOPIC);
        
        AuditRegistry.AuditRecord memory record = registry.getAudit(auditId);
        assertEq(record.contractHash, CONTRACT_HASH);
        assertEq(record.hcsTopicId, HCS_TOPIC);
        assertEq(record.auditor, auditor);
        assertFalse(record.finalized);
        assertGt(record.timestamp, 0);
    }

    function test_RecordFinding() public {
        bytes32 auditId = registry.startAudit(CONTRACT_HASH, HCS_TOPIC);
        
        bytes32 findingHash1 = keccak256("finding 1");
        bytes32 findingHash2 = keccak256("finding 2");
        
        registry.recordFinding(auditId, findingHash1);
        registry.recordFinding(auditId, findingHash2);
        
        assertTrue(registry.verifyFinding(auditId, 0, findingHash1));
        assertTrue(registry.verifyFinding(auditId, 1, findingHash2));
    }

    function test_FinalizeAudit() public {
        bytes32 auditId = registry.startAudit(CONTRACT_HASH, HCS_TOPIC);
        
        registry.recordFinding(auditId, keccak256("finding 1"));
        
        registry.finalizeAudit(auditId);
        
        AuditRegistry.AuditRecord memory record = registry.getAudit(auditId);
        assertTrue(record.finalized);
    }

    function test_Revert_StartAuditNonOwner() public {
        vm.prank(user);
        vm.expectRevert(); // Ownable UnauthorizedAccount error
        registry.startAudit(CONTRACT_HASH, HCS_TOPIC);
    }

    function test_Revert_RecordFindingWhenFinalized() public {
        bytes32 auditId = registry.startAudit(CONTRACT_HASH, HCS_TOPIC);
        registry.finalizeAudit(auditId);
        
        vm.expectRevert("Audit is already finalized");
        registry.recordFinding(auditId, keccak256("finding 1"));
    }

    function test_Revert_RecordFindingNonExistent() public {
        vm.expectRevert("Audit does not exist");
        registry.recordFinding(keccak256("fake audit"), keccak256("finding 1"));
    }

    function test_Revert_VerifyFindingOutOfBounds() public {
        bytes32 auditId = registry.startAudit(CONTRACT_HASH, HCS_TOPIC);
        registry.recordFinding(auditId, keccak256("finding 1"));
        
        vm.expectRevert("Index out of bounds");
        registry.verifyFinding(auditId, 1, keccak256("finding 2"));
    }
}
