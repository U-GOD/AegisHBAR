import { Finding } from "../types";

let findingCounter = 0;

function nextId(): string {
    findingCounter++;
    return `REEN-${String(findingCounter).padStart(3, "0")}`;
}

/**
 * Detects reentrancy vulnerabilities by identifying external calls
 * that occur before state variable modifications (violations of
 * the checks-effects-interactions pattern).
 */
export function analyzeReentrancy(contractNode: any): Finding[] {
    const findings: Finding[] = [];
    const contractName = contractNode.name || "Unknown";

    if (!contractNode.subNodes) return findings;

    for (const node of contractNode.subNodes) {
        if (node.type !== "FunctionDefinition" || !node.body) continue;

        const statements = node.body.statements || [];
        let hasExternalCall = false;
        let externalCallLine = 0;

        for (const stmt of statements) {
            if (isExternalCall(stmt)) {
                hasExternalCall = true;
                externalCallLine = stmt.loc?.start?.line || 0;
            }

            if (hasExternalCall && isStateModification(stmt)) {
                findings.push({
                    id: nextId(),
                    title: "State modification after external call",
                    category: "reentrancy",
                    severity: "critical",
                    description:
                        `Function '${node.name}' modifies state after an external call at line ${externalCallLine}. ` +
                        "This violates the checks-effects-interactions pattern and may allow reentrancy attacks.",
                    location: {
                        line: stmt.loc?.start?.line || 0,
                        column: stmt.loc?.start?.column,
                        functionName: node.name,
                        contractName,
                    },
                    recommendation:
                        "Move all state changes before external calls, or use a reentrancy guard (e.g., OpenZeppelin ReentrancyGuard).",
                });
            }
        }
    }

    return findings;
}

function isExternalCall(node: any): boolean {
    if (!node) return false;

    if (node.type === "ExpressionStatement" && node.expression) {
        const expr = node.expression;
        if (expr.type === "FunctionCall" && expr.expression) {
            const callee = expr.expression;
            // Matches: address.call, address.send, address.transfer
            if (callee.type === "MemberAccess") {
                const member = callee.memberName;
                if (["call", "send", "transfer", "delegatecall", "staticcall"].includes(member)) {
                    return true;
                }
            }
        }
    }

    return false;
}

function isStateModification(node: any): boolean {
    if (!node) return false;

    if (node.type === "ExpressionStatement" && node.expression) {
        const expr = node.expression;
        // Assignment to a state variable
        if (expr.type === "BinaryOperation" && expr.operator === "=") {
            return true;
        }
    }

    return false;
}
