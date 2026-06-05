import { Finding } from "./types";

export interface FixSuggestion {
    findingId: string;
    originalCodeSnippet: string;
    suggestedFix: string;
    explanation: string;
}

/**
 * AI-driven code suggestion generator.
 * Takes a specific finding and the original source code,
 * and uses the LLM to generate a concrete code diff to fix the vulnerability.
 */
export async function generateFixSuggestion(
    finding: Finding,
    sourceCode: string
): Promise<FixSuggestion> {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Extract the vulnerable snippet (a few lines before and after for context)
    const lines = sourceCode.split('\n');
    const startLine = Math.max(0, finding.location.line - 5);
    const endLine = Math.min(lines.length, finding.location.line + 10);
    const snippet = lines.slice(startLine, endLine).join('\n');

    // Fallback if no AI key is provided
    if (!apiKey) {
        return {
            findingId: finding.id,
            originalCodeSnippet: snippet,
            suggestedFix: "// Please configure GEMINI_API_KEY in .env to generate automatic code fixes.",
            explanation: finding.recommendation
        };
    }

    try {
        const prompt = `You are a senior smart contract auditor. Provide the exact code replacement to fix the specified vulnerability. Return ONLY the fixed code snippet (no markdown tags), followed by a brief 1-sentence explanation separated by the literal string '|||'.
        
Vulnerability: ${finding.title}
Description: ${finding.description}

Original Code Context:
${snippet}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.2
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const [suggestedFix, explanation] = output.split('|||').map((s: string) => s.trim());

        return {
            findingId: finding.id,
            originalCodeSnippet: snippet,
            suggestedFix: suggestedFix || "// Fix generation parsing failed",
            explanation: explanation || finding.recommendation
        };
    } catch (error: any) {
        console.error(`[Suggester] Failed to generate fix for ${finding.id}:`, error.message);
        return {
            findingId: finding.id,
            originalCodeSnippet: snippet,
            suggestedFix: "// Network error during AI generation",
            explanation: finding.recommendation
        };
    }
}
