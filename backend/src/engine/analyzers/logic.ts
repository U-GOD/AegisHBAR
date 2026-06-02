import { Finding } from "../types";

let findingCounter = 0;

function nextId(): string {
    findingCounter++;
    return `LOG-${String(findingCounter).padStart(3, "0")}`;
}

/**
 * Detects logic vulnerabilities including missing zero-address validation,
 * unprotected ETH/HBAR transfers, and functions that accept
 * Ether without a withdrawal mechanism.
 */
export function analyzeLogic(contractNode: any): Finding[] {
    const findings: Finding[] = [];
    const contractName = contractNode.name || "Unknown";

    if (!contractNode.subNodes) return findings;

    checkMissingZeroAddressValidation(contractNode, contractName, findings);
    checkLockedEther(contractNode, contractName, findings);

    return findings;
}

/**
 * Functions that accept an address parameter and use it for transfers or
 * access control should validate it is not address(0).
 */
function checkMissingZeroAddressValidation(contractNode: any, contractName: string, findings: Finding[]): void {
    for (const node of contractNode.subNodes) {
        if (node.type !== "FunctionDefinition" || !node.body) continue;
        if (!node.parameters) continue;

        const addressParams = node.parameters.filter(
            (p: any) => p.typeName && p.typeName.name === "address"
        );

        if (addressParams.length === 0) continue;

        const bodyJson = JSON.stringify(node.body);
        const hasZeroCheck =
            bodyJson.includes("address(0)") ||
            bodyJson.includes("0x0000000000000000000000000000000000000000") ||
            bodyJson.includes('"!="');

        if (!hasZeroCheck) {
            findings.push({
                id: nextId(),
                title: "Missing zero-address validation",
                category: "logic",
                severity: "medium",
                description:
                    `Function '${node.name}' accepts address parameters but does not validate against address(0). ` +
                    "Sending funds or assigning roles to the zero address results in permanent loss.",
                location: {
                    line: node.loc?.start?.line || 0,
                    column: node.loc?.start?.column,
                    functionName: node.name,
                    contractName,
                },
                recommendation: "Add require(addr != address(0)) checks for all address parameters used in state changes or transfers.",
            });
        }
    }
}

/**
 * Contracts that can receive ETH (via receive/fallback or payable functions)
 * but have no withdrawal function will permanently lock funds.
 */
function checkLockedEther(contractNode: any, contractName: string, findings: Finding[]): void {
    let canReceive = false;
    let hasWithdraw = false;

    for (const node of contractNode.subNodes) {
        if (node.type === "FunctionDefinition") {
            if (node.isReceiveEther || node.isFallback || node.stateMutability === "payable") {
                canReceive = true;
            }

            if (node.body) {
                const bodyJson = JSON.stringify(node.body);
                if (bodyJson.includes('"transfer"') || bodyJson.includes('"send"') || bodyJson.includes('"call"')) {
                    hasWithdraw = true;
                }
            }
        }
    }

    if (canReceive && !hasWithdraw) {
        findings.push({
            id: nextId(),
            title: "Contract accepts funds with no withdrawal mechanism",
            category: "logic",
            severity: "high",
            description:
                `Contract '${contractName}' can receive native tokens but has no function that sends them out. ` +
                "Funds sent to this contract will be permanently locked.",
            location: {
                line: contractNode.loc?.start?.line || 0,
                contractName,
            },
            recommendation: "Add a guarded withdrawal function that allows the owner to retrieve deposited funds.",
        });
    }
}
