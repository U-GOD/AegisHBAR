// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {AuditCertificate} from "../src/AuditCertificate.sol";

contract AuditCertificateTest is Test {
    AuditCertificate public cert;
    address public auditor;
    address public user;
    
    bytes32 constant AUDIT_ID = keccak256("audit 1");
    bytes32 constant CONTRACT_HASH = keccak256("contract hash");
    string constant HCS_TOPIC = "0.0.9999";
    string constant TOKEN_URI = "ipfs://QmTest123";

    function setUp() public {
        auditor = address(this);
        user = address(0x123);
        cert = new AuditCertificate();
    }

    function _createMockMetadata() internal view returns (AuditCertificate.CertificateMetadata memory) {
        return AuditCertificate.CertificateMetadata({
            auditId: AUDIT_ID,
            contractHash: CONTRACT_HASH,
            hcsTopicId: HCS_TOPIC,
            totalFindings: 5,
            criticalCount: 0,
            highCount: 1,
            mediumCount: 2,
            lowCount: 2,
            informationalCount: 0,
            auditTimestamp: block.timestamp
        });
    }

    function test_MintCertificate() public {
        AuditCertificate.CertificateMetadata memory metadata = _createMockMetadata();
        
        uint256 tokenId = cert.mintCertificate(user, TOKEN_URI, metadata);
        
        assertEq(tokenId, 1);
        assertEq(cert.ownerOf(1), user);
        assertEq(cert.tokenURI(1), TOKEN_URI);
        
        AuditCertificate.CertificateMetadata memory storedMeta = cert.getCertificateMetadata(1);
        assertEq(storedMeta.auditId, AUDIT_ID);
        assertEq(storedMeta.totalFindings, 5);
        assertEq(storedMeta.highCount, 1);
    }

    function test_Revert_MintNonOwner() public {
        AuditCertificate.CertificateMetadata memory metadata = _createMockMetadata();
        
        vm.prank(user);
        vm.expectRevert(); // Ownable UnauthorizedAccount error
        cert.mintCertificate(user, TOKEN_URI, metadata);
    }

    function test_Revert_GetMetadataNonExistent() public {
        vm.expectRevert(); // ERC721NonexistentToken error
        cert.getCertificateMetadata(99);
    }
}
