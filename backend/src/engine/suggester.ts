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
    const apiKey = process.env.OPENAI_API_KEY;
    
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
            suggestedFix: "// Please configure OPENAI_API_KEY in .env to generate automatic code fixes.",
            explanation: finding.recommendation
        };
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a senior smart contract auditor. Provide the exact code replacement to fix the specified vulnerability. Return ONLY the fixed code snippet (no markdown tags), followed by a brief 1-sentence explanation separated by the literal string '|||'."
                    },
                    {
                        role: "user",
                        content: `Vulnerability: ${finding.title}\nDescription: ${finding.description}\n\nOriginal Code Context:\n${snippet}`
                    }
                ],
                temperature: 0.2
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const output = data.choices[0].message.content;
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
