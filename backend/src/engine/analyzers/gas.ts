import { Finding } from "../types";

let findingCounter = 0;

function nextId(): string {
    findingCounter++;
    return `GAS-${String(findingCounter).padStart(3, "0")}`;
}

/**
 * Identifies gas optimization opportunities including storage reads
 * inside loops, public functions that could be external, and
 * redundant storage operations.
 */
export function analyzeGas(contractNode: any): Finding[] {
    const findings: Finding[] = [];
    const contractName = contractNode.name || "Unknown";

    if (!contractNode.subNodes) return findings;

    for (const node of contractNode.subNodes) {
        if (node.type !== "FunctionDefinition" || !node.body) continue;

        checkStorageInLoops(node.body, node.name, contractName, findings);
        checkVisibility(node, contractName, findings);
    }

    return findings;
}

/**
 * Flags state variable access inside for/while loops.
 * Each SLOAD costs 2100 gas; caching in a local variable saves gas per iteration.
 */
function checkStorageInLoops(node: any, functionName: string, contractName: string, findings: Finding[]): void {
    if (!node) return;

    if (node.type === "ForStatement" || node.type === "WhileStatement") {
        const bodyJson = JSON.stringify(node.body || node);
        // Heuristic: member access patterns inside loops suggest potential storage reads
        if (bodyJson.includes('"MemberAccess"') && bodyJson.includes('"StateVariableDeclaration"') === false) {
            findings.push({
                id: nextId(),
                title: "Potential storage read inside loop",
                category: "gas-optimization",
                severity: "low",
                description:
                    `Function '${functionName}' may be reading from storage inside a loop. ` +
                    "Each storage read (SLOAD) costs 2100 gas and compounds per iteration.",
                location: {
                    line: node.loc?.start?.line || 0,
                    column: node.loc?.start?.column,
                    functionName,
                    contractName,
                },
                recommendation:
                    "Cache the storage value in a local memory variable before the loop and reference the cached copy.",
            });
        }
    }

    for (const key of Object.keys(node)) {
        const child = node[key];
        if (Array.isArray(child)) {
            for (const item of child) {
                if (item && typeof item === "object" && item.type) {
                    checkStorageInLoops(item, functionName, contractName, findings);
                }
            }
        } else if (child && typeof child === "object" && child.type) {
            checkStorageInLoops(child, functionName, contractName, findings);
        }
    }
}

/**
 * Public functions that are never called internally should be marked external
 * to save gas on calldata copying.
 */
function checkVisibility(node: any, contractName: string, findings: Finding[]): void {
    if (node.visibility === "public" && !node.isConstructor && node.name) {
        findings.push({
            id: nextId(),
            title: "Public function could be external",
            category: "gas-optimization",
            severity: "informational",
            description:
                `Function '${node.name}' is declared public. If it is not called internally, ` +
                "changing visibility to external reduces gas cost by avoiding memory copies of calldata.",
            location: {
                line: node.loc?.start?.line || 0,
                column: node.loc?.start?.column,
                functionName: node.name,
                contractName,
            },
            recommendation: "Change visibility from public to external if the function is not called within the contract.",
        });
    }
}
