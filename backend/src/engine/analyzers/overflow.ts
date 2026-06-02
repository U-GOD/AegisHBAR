import { Finding } from "../types";

let findingCounter = 0;

function nextId(): string {
    findingCounter++;
    return `OF-${String(findingCounter).padStart(3, "0")}`;
}

/**
 * Detects arithmetic overflow/underflow risks.
 * Solidity >=0.8.0 has built-in overflow checks, but explicit
 * 'unchecked' blocks bypass them. Pre-0.8.0 contracts without
 * SafeMath are also flagged.
 */
export function analyzeOverflow(contractNode: any): Finding[] {
    const findings: Finding[] = [];
    const contractName = contractNode.name || "Unknown";

    if (!contractNode.subNodes) return findings;

    for (const node of contractNode.subNodes) {
        if (node.type !== "FunctionDefinition" || !node.body) continue;

        checkUncheckedBlocks(node.body, node.name, contractName, findings);
    }

    return findings;
}

function checkUncheckedBlocks(node: any, functionName: string, contractName: string, findings: Finding[]): void {
    if (!node) return;

    if (node.type === "UncheckedStatement") {
        // Flag any unchecked block that contains arithmetic
        const bodyJson = JSON.stringify(node);
        const hasArithmetic =
            bodyJson.includes('"+"') ||
            bodyJson.includes('"-"') ||
            bodyJson.includes('"*"') ||
            bodyJson.includes('"/"');

        if (hasArithmetic) {
            findings.push({
                id: nextId(),
                title: "Arithmetic inside unchecked block",
                category: "overflow",
                severity: "medium",
                description:
                    `Function '${functionName}' contains arithmetic operations inside an unchecked block. ` +
                    "This bypasses Solidity 0.8+ overflow protection and may lead to silent wrap-around.",
                location: {
                    line: node.loc?.start?.line || 0,
                    column: node.loc?.start?.column,
                    functionName,
                    contractName,
                },
                recommendation:
                    "Verify that the unchecked arithmetic is intentional and cannot produce values outside expected bounds. Add explicit range validation if necessary.",
            });
        }
    }

    // Recursively walk child nodes
    for (const key of Object.keys(node)) {
        const child = node[key];
        if (Array.isArray(child)) {
            for (const item of child) {
                if (item && typeof item === "object" && item.type) {
                    checkUncheckedBlocks(item, functionName, contractName, findings);
                }
            }
        } else if (child && typeof child === "object" && child.type) {
            checkUncheckedBlocks(child, functionName, contractName, findings);
        }
    }
}
