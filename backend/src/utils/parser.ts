import parser from "@solidity-parser/parser";

/**
 * Parses raw Solidity source code into an Abstract Syntax Tree (AST).
 * This decomposes the code into structural components (contracts, functions, modifiers, etc.)
 * allowing the AI to analyze discrete pieces rather than a monolithic string.
 *
 * @param sourceCode - The raw Solidity smart contract source code.
 * @returns The parsed AST object.
 */
export function parseSolidityCode(sourceCode: string) {
    try {
        // We use { loc: true } to retain line/column numbers so the AI can pinpoint vulnerabilities exactly
        const ast = parser.parse(sourceCode, { loc: true, tolerant: true });
        return ast;
    } catch (error: any) {
        throw new Error(`Failed to parse Solidity code: ${error.message}`);
    }
}
