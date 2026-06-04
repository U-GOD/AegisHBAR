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
import { logReportToHCS } from "./hcsLogger";
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
        stream.send("parsing", "Parsing Solidity AST...");
        const ast = parseSolidityCode(sourceCode);
        const findings: Finding[] = [];

        // 1. Static Analysis
        stream.send("analyzing", "Running static analysis modules...");
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
        stream.send("generating-fixes", "Generating AI fix suggestions...");
        for (const finding of findings) {
            try {
                finding.fixSuggestion = await generateFixSuggestion(finding, sourceCode);
            } catch (err) {
                console.warn(`Failed to generate fix for finding ${finding.id}`, err);
            }
        }

        const report = buildReport(sourceCode, contractName, findings);

        // 3. Log to Hedera Consensus Service
        stream.send("logging-hcs", "Logging immutable audit report to HCS...");
        let hcsTopicId = "";
        try {
            hcsTopicId = await logReportToHCS(report);
        } catch (err) {
            console.error("HCS logging failed:", err);
            hcsTopicId = "failed-to-log";
        }

        // 4. Generate PDF
        stream.send("analyzing", "Generating PDF report...");
        const pdfBuffer = await generatePdfReport(report);

        // 5. Upload to IPFS via Pinata
        stream.send("analyzing", "Pinning report to IPFS...");
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
        stream.send("analyzing", "Minting Audit Certificate NFT...");
        let tokenId = 0;
        try {
            tokenId = await mintAuditNFT(depositorAddress, metadataIpfsUri, report, depositId, hcsTopicId);
        } catch (err) {
            console.error("NFT Minting failed:", err);
        }

        stream.send("complete", "Audit pipeline finished successfully.", {
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
        critical: findings.filter((f) => f.severity === "Critical").length,
        high: findings.filter((f) => f.severity === "High").length,
        medium: findings.filter((f) => f.severity === "Medium").length,
        low: findings.filter((f) => f.severity === "Low").length,
        informational: findings.filter((f) => f.severity === "Info").length,
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
