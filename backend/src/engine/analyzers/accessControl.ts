import { Finding } from "../types";

let findingCounter = 0;

function nextId(): string {
    findingCounter++;
    return `AC-${String(findingCounter).padStart(3, "0")}`;
}

/**
 * Detects access control weaknesses including missing modifiers
 * on sensitive operations, unrestricted selfdestruct/delegatecall,
 * and tx.origin usage for authentication.
 */
export function analyzeAccessControl(contractNode: any): Finding[] {
    const findings: Finding[] = [];
    const contractName = contractNode.name || "Unknown";

    if (!contractNode.subNodes) return findings;

    const sensitiveOps = ["selfdestruct", "delegatecall", "suicide"];

    for (const node of contractNode.subNodes) {
        if (node.type !== "FunctionDefinition" || !node.body) continue;

        // Flag public/external functions with no modifiers that contain sensitive operations
        const isExposed = !node.visibility || node.visibility === "public" || node.visibility === "external";
        const hasModifiers = node.modifiers && node.modifiers.length > 0;

        if (isExposed && !hasModifiers) {
            const containsSensitiveOp = hasSensitiveOperation(node.body, sensitiveOps);
            if (containsSensitiveOp) {
                findings.push({
                    id: nextId(),
                    title: "Sensitive operation without access control",
                    category: "access-control",
                    severity: "critical",
                    description:
                        `Function '${node.name}' contains a sensitive operation but has no access control modifier. ` +
                        "Any external account can invoke this function.",
                    location: {
                        line: node.loc?.start?.line || 0,
                        column: node.loc?.start?.column,
                        functionName: node.name,
                        contractName,
                    },
                    recommendation:
                        "Apply an access control modifier (e.g., onlyOwner) or use OpenZeppelin AccessControl.",
                });
            }
        }

        // Detect tx.origin used for authentication
        if (node.body) {
            checkTxOrigin(node.body, node.name, contractName, findings);
        }
    }

    return findings;
}

function hasSensitiveOperation(node: any, ops: string[]): boolean {
    if (!node) return false;

    const json = JSON.stringify(node);
    return ops.some((op) => json.includes(`"${op}"`));
}

function checkTxOrigin(node: any, functionName: string, contractName: string, findings: Finding[]): void {
    const json = JSON.stringify(node);

    if (json.includes('"tx"') && json.includes('"origin"')) {
        findings.push({
            id: nextId(),
            title: "tx.origin used for authentication",
            category: "access-control",
            severity: "high",
            description:
                `Function '${functionName}' uses tx.origin which can be exploited via phishing contracts. ` +
                "tx.origin returns the original sender of the transaction, not the direct caller.",
            location: {
                line: 0,
                functionName,
                contractName,
            },
            recommendation: "Replace tx.origin with msg.sender for authentication checks.",
        });
    }
}
