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

        const hcsTool = agentKit.consensus.tools(agentKit.context).find(t => t.name === "Submit Topic Message");
        if (!hcsTool) {
            throw new Error("Submit Topic Message tool not found in Hedera Agent Kit");
        }

        const response = await hcsTool.execute(hederaClient as any, agentKit.context, {
            topicId,
            message
        });

        // The tool returns a human-readable string with the sequence number and tx id
        // e.g. "Message submitted to topic 0.0.1234. Sequence number: 5. Transaction ID: 0.0.123@123.456"
        const sequenceNumberMatch = response.match(/Sequence number:\s*(\d+)/i);
        const sequenceNumber = sequenceNumberMatch ? sequenceNumberMatch[1] : "unknown";

        console.log(`[HCS Logger] Finding logged to topic ${topicId}, sequence #${sequenceNumber}`);

        return sequenceNumber;
    } catch (error: any) {
        console.error("[HCS Logger] Failed to submit to HCS:", error.message);
        return "";
    }
}
