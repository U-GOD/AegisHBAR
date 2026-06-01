// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AuditRegistry is Ownable {
    struct AuditRecord {
        bytes32 contractHash;
        bytes32[] findingHashes;
        string hcsTopicId;
        uint256 timestamp;
        address auditor;
        bool finalized;
    }

    mapping(bytes32 => AuditRecord) public audits;

    event AuditStarted(bytes32 indexed auditId, bytes32 contractHash, string hcsTopicId);
    event FindingRecorded(bytes32 indexed auditId, bytes32 findingHash, uint256 index);
    event AuditFinalized(bytes32 indexed auditId, uint256 totalFindings);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Initializes an audit session.
     * @dev Restricted to contract owner (the auditor agent).
     * @param contractHash Keccak256 hash of the audited contract source.
     * @param hcsTopicId The Hedera Consensus Service topic ID for this audit.
     * @return auditId Unique identifier for the audit session.
     */
    function startAudit(bytes32 contractHash, string calldata hcsTopicId) external onlyOwner returns (bytes32 auditId) {
        auditId = keccak256(abi.encodePacked(contractHash, hcsTopicId, block.timestamp));
        
        AuditRecord storage record = audits[auditId];
        record.contractHash = contractHash;
        record.hcsTopicId = hcsTopicId;
        record.timestamp = block.timestamp;
        record.auditor = msg.sender;
        record.finalized = false;

        emit AuditStarted(auditId, contractHash, hcsTopicId);
    }

    /**
     * @notice Records the hash of a specific vulnerability finding.
     * @dev Restricted to contract owner. Audit must not be finalized.
     * @param auditId Identifier of the target audit session.
     * @param findingHash Keccak256 hash of the finding data.
     */
    function recordFinding(bytes32 auditId, bytes32 findingHash) external onlyOwner {
        AuditRecord storage record = audits[auditId];
        require(record.timestamp != 0, "Audit does not exist");
        require(!record.finalized, "Audit is already finalized");

        record.findingHashes.push(findingHash);
        
        emit FindingRecorded(auditId, findingHash, record.findingHashes.length - 1);
    }

    /**
     * @notice Locks the audit session to prevent further findings from being added.
     * @dev Restricted to contract owner.
     * @param auditId Identifier of the target audit session.
     */
    function finalizeAudit(bytes32 auditId) external onlyOwner {
        AuditRecord storage record = audits[auditId];
        require(record.timestamp != 0, "Audit does not exist");
        require(!record.finalized, "Audit is already finalized");

        record.finalized = true;

        emit AuditFinalized(auditId, record.findingHashes.length);
    }

    /**
     * @notice Retrieves details of a specific audit session.
     * @param auditId Identifier of the target audit session.
     * @return AuditRecord struct containing audit state.
     */
    function getAudit(bytes32 auditId) external view returns (AuditRecord memory) {
        return audits[auditId];
    }

    /**
     * @notice Verifies if a specific finding hash exists at a given index in an audit.
     * @param auditId Identifier of the target audit session.
     * @param index The index of the finding to verify.
     * @param findingHash The hash to compare against the stored record.
     * @return True if the finding hash matches the on-chain record, false otherwise.
     */
    function verifyFinding(bytes32 auditId, uint256 index, bytes32 findingHash) external view returns (bool) {
        AuditRecord storage record = audits[auditId];
        require(record.timestamp != 0, "Audit does not exist");
        require(index < record.findingHashes.length, "Index out of bounds");

        return record.findingHashes[index] == findingHash;
    }
}
