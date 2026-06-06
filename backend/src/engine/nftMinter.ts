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

    if (!client) {
        throw new Error("Hedera client not initialized. Cannot mint NFT.");
    }

    const mintTool = agentKit.token.tools(agentKit.context).find(t => t.name === "Mint Non-Fungible Token");
    if (!mintTool) {
        throw new Error("Mint Non-Fungible Token tool not found in Hedera Agent Kit");
    }

    const mintResponse = await mintTool.execute(client, agentKit.context, {
        tokenId: CERTIFICATE_TOKEN_ID,
        uris: [tokenUri]
    });

    const serialMatch = mintResponse.match(/serial number:?\s*(\d+)/i);
    if (!serialMatch) {
        throw new Error("Minting succeeded but could not extract serial number from tool response: " + mintResponse);
    }
    
    const serialNumber = parseInt(serialMatch[1], 10);
    console.log(`[NFT Minter] Successfully minted HTS Certificate Serial #${serialNumber}`);


    try {
        console.log(`[NFT Minter] Transferring Serial #${serialNumber} to ${recipientAddress}...`);
        
        let targetAccountId = recipientAddress;
        


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
        console.warn(`[NFT Minter] Transfer failed: ${err.message}`);
    }

    return serialNumber;
}
