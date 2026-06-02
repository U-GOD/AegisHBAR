import crypto from "crypto";
import { parseSolidityCode } from "../utils/parser";
import { Finding, AuditReport, Category, Severity } from "./types";

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

        // Walk the AST and collect findings from each category analyzer
        for (const node of ast.children) {
            if (node.type === "ContractDefinition") {
                const contractFindings = await this.analyzeContract(node);
                findings.push(...contractFindings);
            }
        }

        return this.buildReport(findings);
    }

    /**
     * Dispatches a contract AST node through all registered category analyzers.
     * Each analyzer inspects the node for a specific class of vulnerability.
     */
    private async analyzeContract(contractNode: any): Promise<Finding[]> {
        const findings: Finding[] = [];

        const analyzers: { category: Category; analyze: (node: any) => Finding[] }[] = [
            { category: "reentrancy", analyze: (node) => this.analyzeReentrancy(node) },
            { category: "access-control", analyze: (node) => this.analyzeAccessControl(node) },
            { category: "overflow", analyze: (node) => this.analyzeOverflow(node) },
            { category: "gas-optimization", analyze: (node) => this.analyzeGas(node) },
            { category: "logic", analyze: (node) => this.analyzeLogic(node) },
        ];

        for (const analyzer of analyzers) {
            const result = analyzer.analyze(contractNode);
            findings.push(...result);
        }

        return findings;
    }

    // -- Category Analyzer Stubs --
    // Each will be implemented in the next step as dedicated modules.

    private analyzeReentrancy(node: any): Finding[] {
        return [];
    }

    private analyzeAccessControl(node: any): Finding[] {
        return [];
    }

    private analyzeOverflow(node: any): Finding[] {
        return [];
    }

    private analyzeGas(node: any): Finding[] {
        return [];
    }

    private analyzeLogic(node: any): Finding[] {
        return [];
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

        // Risk score: weighted sum normalized to 0-100
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
