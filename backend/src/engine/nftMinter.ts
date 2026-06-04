import { TokenMintTransaction, TransferTransaction, AccountId } from "@hashgraph/sdk";
import { AuditReport } from "./types";
import { agentKit } from "../agent";

const CERTIFICATE_TOKEN_ID = process.env.AUDIT_CERTIFICATE_TOKEN_ID || process.env.AUDIT_CERTIFICATE_ADDRESS || "";

/**
 * Mints an Audit Certificate NFT (HTS) on Hedera Testnet.
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
    if (!CERTIFICATE_TOKEN_ID) {
        throw new Error("Missing AUDIT_CERTIFICATE_TOKEN_ID in environment variables.");
    }

    console.log(`[NFT Minter] Minting HTS certificate for ${recipientAddress}...`);
    
    const client = agentKit.client;

    // 1. Mint the NFT on the HTS Token
    // We store the IPFS URI in the metadata field of the HTS NFT
    const mintTx = new TokenMintTransaction()
        .setTokenId(CERTIFICATE_TOKEN_ID)
        .addMetadata(Buffer.from(tokenUri));

    const mintResponse = await mintTx.execute(client);
    const mintReceipt = await mintResponse.getReceipt(client);
    
    if (!mintReceipt.serials || mintReceipt.serials.length === 0) {
        throw new Error("Minting succeeded but no serial number was returned.");
    }
    
    const serialNumber = mintReceipt.serials[0].toNumber();
    console.log(`[NFT Minter] Successfully minted HTS Certificate Serial #${serialNumber}`);

    // 2. Transfer the NFT to the recipient
    // Note: The recipient must have associated the token ID to their account beforehand!
    try {
        console.log(`[NFT Minter] Transferring Serial #${serialNumber} to ${recipientAddress}...`);
        
        let targetAccountId = recipientAddress;
        
        // If the frontend passed an EVM address, we can attempt to transfer to it, 
        // but Hedera typically expects a 0.0.x account ID for HTS transfers if aliasing isn't fully established.
        // The SDK handles EVM address aliases automatically in TransferTransaction.

        const transferTx = new TransferTransaction()
            .addNftTransfer(
                CERTIFICATE_TOKEN_ID, 
                serialNumber, 
                client.operatorAccountId!, 
                AccountId.fromString(targetAccountId)
            );
        
        const transferResponse = await transferTx.execute(client);
        await transferResponse.getReceipt(client);
        
        console.log(`[NFT Minter] Transfer complete.`);
    } catch (err: any) {
        console.warn(`[NFT Minter] Transfer failed (user likely hasn't associated the token yet): ${err.message}`);
        // We don't throw here because the mint succeeded. The user can claim it later.
    }

    return serialNumber;
}
