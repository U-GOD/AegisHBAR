// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AuditCertificate is ERC721URIStorage, Ownable {
    struct CertificateMetadata {
        bytes32 auditId;
        bytes32 contractHash;
        string hcsTopicId;
        uint256 totalFindings;
        uint256 criticalCount;
        uint256 highCount;
        uint256 mediumCount;
        uint256 lowCount;
        uint256 informationalCount;
        uint256 auditTimestamp;
    }

    mapping(uint256 => CertificateMetadata) private _certificateData;
    uint256 private _nextTokenId;

    event CertificateMinted(uint256 indexed tokenId, bytes32 indexed auditId, address indexed recipient);

    constructor() ERC721("AegisHBAR Audit Certificate", "AHAC") Ownable(msg.sender) {}

    /**
     * @notice Mints an audit certificate NFT with full metadata.
     * @dev Restricted to contract owner.
     * @param recipient The address receiving the NFT.
     * @param tokenURI_ The URI containing external metadata JSON.
     * @param metadata Structured on-chain data summarizing the audit results.
     * @return tokenId The identifier of the newly minted certificate.
     */
    function mintCertificate(
        address recipient,
        string calldata tokenURI_,
        CertificateMetadata calldata metadata
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = ++_nextTokenId;

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        _certificateData[tokenId] = metadata;

        emit CertificateMinted(tokenId, metadata.auditId, recipient);
    }

    /**
     * @notice Retrieves the structured on-chain metadata for a given certificate.
     * @param tokenId The identifier of the certificate.
     * @return CertificateMetadata struct containing audit details.
     */
    function getCertificateMetadata(uint256 tokenId) external view returns (CertificateMetadata memory) {
        ownerOf(tokenId); // Implicitly reverts if token does not exist
        return _certificateData[tokenId];
    }
}
