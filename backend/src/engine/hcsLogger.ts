import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import crypto from "crypto";
import { AuditReport } from "./types";
import { agentKit } from "../agent";

/**
 * Publishes a compact audit summary to the Hedera Consensus Service topic.
 * The full report is hashed and only the hash + metadata are submitted on-chain,
 * keeping transaction costs minimal while ensuring tamper-proof verification.
 */
export async function logFindingsToHCS(report: AuditReport): Promise<string> {
    const topicId = process.env.HEDERA_HCS_TOPIC_ID;

    if (!topicId) {
        console.warn("[HCS Logger] No HEDERA_HCS_TOPIC_ID configured. Skipping on-chain log.");
        return "";
    }

    const reportJson = JSON.stringify(report);
    const reportHash = crypto.createHash("sha256").update(reportJson).digest("hex");

    const message = JSON.stringify({
        version: "1.0",
        contract: report.contractName,
        sourceHash: report.sourceHash,
        reportHash,
        timestamp: report.timestamp,
        summary: report.summary,
        riskScore: report.overallRiskScore,
    });

    try {
        const hederaClient = agentKit.client;

        if (!hederaClient) {
            console.warn("[HCS Logger] Hedera client not initialized. Skipping on-chain log.");
            return "";
        }

        const tx = new TopicMessageSubmitTransaction()
            .setTopicId(topicId)
            .setMessage(message);

        const response = await tx.execute(hederaClient);
        const receipt = await response.getReceipt(hederaClient);
        const sequenceNumber = receipt.topicSequenceNumber?.toString() || "unknown";

        console.log(`[HCS Logger] Finding logged to topic ${topicId}, sequence #${sequenceNumber}`);

        return sequenceNumber;
    } catch (error: any) {
        console.error("[HCS Logger] Failed to submit to HCS:", error.message);
        return "";
    }
}
