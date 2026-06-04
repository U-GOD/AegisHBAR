import crypto from "crypto";
import { parseSolidityCode } from "../utils/parser";
import { Finding, AuditReport } from "./types";
import { analyzeReentrancy } from "./analyzers/reentrancy";
import { analyzeAccessControl } from "./analyzers/accessControl";
import { analyzeOverflow } from "./analyzers/overflow";
import { analyzeGas } from "./analyzers/gas";
import { analyzeLogic } from "./analyzers/logic";
import { generateFixSuggestion } from "./suggester";
import { SSEStreamManager } from "./stream";
import { logFindingsToHCS } from "./hcsLogger";
import { generatePdfReport } from "./pdfGenerator";
import { uploadFileToIPFS, uploadMetadataToIPFS } from "./ipfs";
import { mintAuditNFT } from "./nftMinter";

/**
 * Executes the complete AegisHBAR audit pipeline.
 */
export async function runAuditPipeline(
    sourceCode: string,
    contractName: string,
    categories: string[],
    depositorAddress: string,
    depositId: string,
    stream: SSEStreamManager
): Promise<void> {
    try {
        stream.send({ phase: "parsing", message: "Parsing Solidity AST..." });
        const ast = parseSolidityCode(sourceCode);
        const findings: Finding[] = [];

        // 1. Static Analysis
        stream.send({ phase: "analyzing", message: "Running static analysis modules..." });
        for (const node of ast.children) {
            if (node.type === "ContractDefinition") {
                if (categories.includes("reentrancy")) findings.push(...analyzeReentrancy(node));
                if (categories.includes("access")) findings.push(...analyzeAccessControl(node));
                if (categories.includes("overflow")) findings.push(...analyzeOverflow(node));
                if (categories.includes("gas")) findings.push(...analyzeGas(node));
                if (categories.includes("logic")) findings.push(...analyzeLogic(node));
            }
        }

        // 2. AI Fix Suggestions
        stream.send({ phase: "generating-fixes", message: "Generating AI fix suggestions..." });
        for (const finding of findings) {
            try {
                const suggestion = await generateFixSuggestion(finding, sourceCode);
                // Attach suggestion to the recommendation field
                finding.recommendation = finding.recommendation + "\n\nAI Suggested Fix:\n" + suggestion;
            } catch (err) {
                console.warn(`Failed to generate fix for finding ${finding.id}`, err);
            }
        }

        const report = buildReport(sourceCode, contractName, findings);

        // 3. Log to Hedera Consensus Service
        stream.send({ phase: "logging-hcs", message: "Logging immutable audit report to HCS..." });
        let hcsTopicId = "";
        try {
            hcsTopicId = await logFindingsToHCS(report);
        } catch (err) {
            console.error("HCS logging failed:", err);
            hcsTopicId = "failed-to-log";
        }

        // 4. Generate PDF
        stream.send({ phase: "analyzing", message: "Generating PDF report..." });
        const pdfBuffer = await generatePdfReport(report);

        // 5. Upload to IPFS via Pinata
        stream.send({ phase: "analyzing", message: "Pinning report to IPFS..." });
        let pdfIpfsUri = "";
        let metadataIpfsUri = "";
        try {
            pdfIpfsUri = await uploadFileToIPFS(pdfBuffer, `${contractName}_Audit.pdf`);
            metadataIpfsUri = await uploadMetadataToIPFS(report, pdfIpfsUri);
        } catch (err) {
            console.error("IPFS upload failed:", err);
            metadataIpfsUri = "ipfs://error";
        }

        // 6. Mint NFT
        stream.send({ phase: "analyzing", message: "Minting Audit Certificate NFT..." });
        let tokenId = 0;
        try {
            tokenId = await mintAuditNFT(depositorAddress, metadataIpfsUri, report, depositId, hcsTopicId);
        } catch (err) {
            console.error("NFT Minting failed:", err);
        }

        stream.complete({
            report,
            certificate: {
                tokenId,
                hcsTopicId,
                metadataUri: metadataIpfsUri,
                pdfUri: pdfIpfsUri
            }
        });

    } catch (error: any) {
        stream.error(error.message || "An unexpected error occurred during the audit pipeline.");
    }
}

function buildReport(sourceCode: string, contractName: string, findings: Finding[]): AuditReport {
    const summary = {
        critical: findings.filter((f) => f.severity === "critical").length,
        high: findings.filter((f) => f.severity === "high").length,
        medium: findings.filter((f) => f.severity === "medium").length,
        low: findings.filter((f) => f.severity === "low").length,
        informational: findings.filter((f) => f.severity === "informational").length,
        total: findings.length,
    };

    const riskScore = Math.max(0, 100 - (
        summary.critical * 25 + summary.high * 15 + summary.medium * 8 + summary.low * 3
    ));

    const sourceHash = crypto.createHash("sha256").update(sourceCode).digest("hex");

    return {
        contractName,
        sourceHash,
        timestamp: Date.now(),
        findings,
        summary,
        overallRiskScore: riskScore,
    };
}
