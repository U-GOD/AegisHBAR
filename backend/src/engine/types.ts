export type Severity = "critical" | "high" | "medium" | "low" | "informational";

export type Category =
    | "reentrancy"
    | "access-control"
    | "overflow"
    | "gas-optimization"
    | "logic";

export interface Finding {
    id: string;
    title: string;
    category: Category;
    severity: Severity;
    description: string;
    location: {
        line: number;
        column?: number;
        functionName?: string;
        contractName?: string;
    };
    recommendation: string;
}

export interface AuditReport {
    contractName: string;
    sourceHash: string;
    timestamp: number;
    findings: Finding[];
    summary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        informational: number;
        total: number;
    };
    overallRiskScore: number;
}
