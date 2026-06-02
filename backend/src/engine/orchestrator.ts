import crypto from "crypto";
import { parseSolidityCode } from "../utils/parser";
import { Finding, AuditReport } from "./types";
import { analyzeReentrancy } from "./analyzers/reentrancy";
import { analyzeAccessControl } from "./analyzers/accessControl";
import { analyzeOverflow } from "./analyzers/overflow";
import { analyzeGas } from "./analyzers/gas";
import { analyzeLogic } from "./analyzers/logic";

/**
 * Central orchestrator for the AI-driven smart contract analysis pipeline.
 * Takes raw Solidity source code, decomposes it via the AST parser,
 * dispatches each relevant node to the appropriate category analyzer,
 * and aggregates results into a structured audit report.
 */
export class AnalysisEngine {
    private sourceCode: string;
    private contractName: string;

    constructor(sourceCode: string, contractName: string) {
        this.sourceCode = sourceCode;
        this.contractName = contractName;
    }

    async run(): Promise<AuditReport> {
        const ast = parseSolidityCode(this.sourceCode);
        const findings: Finding[] = [];

        for (const node of ast.children) {
            if (node.type === "ContractDefinition") {
                const contractFindings = this.analyzeContract(node);
                findings.push(...contractFindings);
            }
        }

        return this.buildReport(findings);
    }

    private analyzeContract(contractNode: any): Finding[] {
        const findings: Finding[] = [];

        findings.push(...analyzeReentrancy(contractNode));
        findings.push(...analyzeAccessControl(contractNode));
        findings.push(...analyzeOverflow(contractNode));
        findings.push(...analyzeGas(contractNode));
        findings.push(...analyzeLogic(contractNode));

        return findings;
    }

    private buildReport(findings: Finding[]): AuditReport {
        const summary = {
            critical: findings.filter((f) => f.severity === "critical").length,
            high: findings.filter((f) => f.severity === "high").length,
            medium: findings.filter((f) => f.severity === "medium").length,
            low: findings.filter((f) => f.severity === "low").length,
            informational: findings.filter((f) => f.severity === "informational").length,
            total: findings.length,
        };

        const riskScore = Math.min(
            100,
            summary.critical * 25 + summary.high * 15 + summary.medium * 8 + summary.low * 3
        );

        const sourceHash = crypto.createHash("sha256").update(this.sourceCode).digest("hex");

        return {
            contractName: this.contractName,
            sourceHash,
            timestamp: Date.now(),
            findings,
            summary,
            overallRiskScore: riskScore,
        };
    }
}
