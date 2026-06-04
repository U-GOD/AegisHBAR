import { ethers } from "ethers";
import { AuditReport } from "./types";

const PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY || "";
const CERTIFICATE_ADDRESS = process.env.AUDIT_CERTIFICATE_ADDRESS || "";

// Use the public Hedera Hashio RPC for Testnet
const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");

const CERTIFICATE_ABI = [
    "function mintCertificate(address recipient, string tokenURI_, tuple(bytes32 auditId, bytes32 contractHash, string hcsTopicId, uint256 totalFindings, uint256 criticalCount, uint256 highCount, uint256 mediumCount, uint256 lowCount, uint256 informationalCount, uint256 auditTimestamp) metadata) external returns (uint256 tokenId)",
    "event CertificateMinted(uint256 indexed tokenId, bytes32 indexed auditId, address indexed recipient)"
];

/**
 * Mints an Audit Certificate NFT (ERC721) on Hedera Testnet.
 * @param recipientAddress The wallet address of the developer who requested the audit
 * @param tokenUri The IPFS URI containing the JSON metadata
 * @param report The full Audit Report
 * @param depositId The Escrow deposit ID (bytes32) that paid for this audit
 * @param hcsTopicId The Hedera Consensus Service Topic ID where the finding hashes are logged
 * @returns The new tokenId of the minted NFT
 */
export async function mintAuditNFT(
    recipientAddress: string, 
    tokenUri: string, 
    report: AuditReport, 
    depositId: string, 
    hcsTopicId: string
): Promise<number> {
    if (!PRIVATE_KEY || !CERTIFICATE_ADDRESS) {
        throw new Error("Missing HEDERA_PRIVATE_KEY or AUDIT_CERTIFICATE_ADDRESS in environment variables.");
    }

    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CERTIFICATE_ADDRESS, CERTIFICATE_ABI, wallet);

    // Format strings as bytes32 for Solidity
    const contractHashBytes32 = report.sourceHash.startsWith("0x") ? report.sourceHash : "0x" + report.sourceHash;
    const auditIdBytes32 = depositId.startsWith("0x") ? depositId : "0x" + depositId;

    const metadata = {
        auditId: auditIdBytes32,
        contractHash: contractHashBytes32,
        hcsTopicId: hcsTopicId,
        totalFindings: report.findings.length,
        criticalCount: report.summary.critical,
        highCount: report.summary.high,
        mediumCount: report.summary.medium,
        lowCount: report.summary.low,
        informationalCount: report.summary.informational,
        auditTimestamp: Math.floor(report.timestamp / 1000) // Convert JS ms timestamp to Unix seconds
    };

    console.log(`[NFT Minter] Minting certificate for ${recipientAddress}...`);
    
    // Call the smart contract
    const tx = await contract.mintCertificate(recipientAddress, tokenUri, metadata);
    const receipt = await tx.wait();

    // Extract the tokenId from the emitted event
    const event = receipt.logs.find((log: any) => {
        try {
            return contract.interface.parseLog(log)?.name === "CertificateMinted";
        } catch { return false; }
    });

    if (!event) {
        throw new Error("Transaction succeeded, but CertificateMinted event was not found.");
    }

    const parsed = contract.interface.parseLog(event);
    const tokenId = Number(parsed?.args[0]);

    console.log(`[NFT Minter] Successfully minted Certificate #${tokenId}`);
    
    return tokenId;
}
