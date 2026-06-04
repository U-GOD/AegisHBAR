"use client";

import { useState } from "react";

export interface Finding {
    id: string;
    category: string;
    title: string;
    description: string;
    severity: "Critical" | "High" | "Medium" | "Low" | "Info";
    location: {
        line: number;
        column?: number;
    };
    recommendation: string;
    fixSuggestion?: {
        originalCodeSnippet: string;
        suggestedFix: string;
        explanation: string;
    };
}

interface FindingCardProps {
    finding: Finding;
    fileName?: string;
}

export function FindingCard({ finding, fileName = "Contract.sol" }: FindingCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Severity styling mapping
    const severityMap = {
        Critical: { bg: "bg-error/15", border: "border-error/30", text: "text-error" },
        High: { bg: "bg-tertiary/15", border: "border-tertiary/30", text: "text-tertiary" },
        Medium: { bg: "bg-secondary/15", border: "border-secondary/30", text: "text-secondary" },
        Low: { bg: "bg-primary/15", border: "border-primary/30", text: "text-primary" },
        Info: { bg: "bg-surface-variant/30", border: "border-outline-variant", text: "text-on-surface-variant" },
    };

    const styles = severityMap[finding.severity] || severityMap.Info;

    return (
        <div className={`border-b border-outline-variant transition-colors ${isExpanded ? 'bg-surface-container-lowest' : 'hover:bg-surface-container-lowest cursor-pointer group'}`}>
            {/* Header Row */}
            <div 
                className="grid grid-cols-12 gap-4 p-stack-md items-center"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="col-span-3 md:col-span-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded ${styles.bg} border ${styles.border} ${styles.text} text-label-sm uppercase font-bold`}>
                        {finding.severity}
                    </span>
                </div>
                
                <div className="col-span-5 md:col-span-6 text-on-surface text-label-md font-bold truncate">
                    {finding.title}
                </div>
                
                <div className="col-span-2 text-on-surface-variant text-label-md">
                    L: {finding.location.line}
                </div>
                
                <div className="col-span-2 text-right">
                    <button className={`text-label-sm uppercase tracking-wider flex items-center justify-end w-full gap-1 transition-colors ${isExpanded ? 'text-primary hover:text-primary-fixed' : 'text-on-surface-variant group-hover:text-primary'}`}>
                        {isExpanded ? 'Hide Fix' : 'View Fix'} 
                        <span className={`material-symbols-outlined text-[16px] transition-transform ${isExpanded ? 'rotate-180' : 'opacity-0 group-hover:opacity-100'}`}>
                            {isExpanded ? 'expand_less' : 'arrow_forward'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Expanded Content (Details & Code Diff) */}
            {isExpanded && (
                <div className="px-stack-md pb-stack-md animate-fade-in">
                    <p className="text-body-md text-on-surface-variant mb-4 leading-relaxed">
                        {finding.description}
                    </p>

                    {finding.fixSuggestion ? (
                        <div className="bg-background border border-outline-variant rounded overflow-hidden text-label-md">
                            <div className="flex text-on-surface-variant border-b border-outline-variant bg-surface-container-low px-4 py-2 text-label-sm uppercase">
                                <span className="material-symbols-outlined text-[14px] mr-2">code</span> {fileName}
                            </div>
                            
                            <div className="flex flex-col">
                                {/* Removed Code (Original) */}
                                {finding.fixSuggestion.originalCodeSnippet.split('\n').map((line, idx) => (
                                    <div key={`orig-${idx}`} className="flex bg-error/10 hover:bg-error/20 transition-colors">
                                        <div className="w-12 border-r border-outline-variant border-error/20 text-right pr-2 py-1 text-error/70 select-none bg-error/5">
                                            {finding.location.line + idx}
                                        </div>
                                        <div className="w-12 border-r border-outline-variant text-right pr-2 py-1 select-none"></div>
                                        <div className="pl-4 py-1 text-error line-through decoration-error/50 whitespace-pre">
                                            <span className="text-error/70 mr-2">-</span>{line}
                                        </div>
                                    </div>
                                ))}

                                {/* Added Code (Suggested Fix) */}
                                {finding.fixSuggestion.suggestedFix.split('\n').map((line, idx) => (
                                    <div key={`fix-${idx}`} className="flex bg-primary/10 hover:bg-primary/20 transition-colors">
                                        <div className="w-12 border-r border-outline-variant text-right pr-2 py-1 select-none"></div>
                                        <div className="w-12 border-r border-outline-variant border-primary/20 text-right pr-2 py-1 text-primary/70 select-none bg-primary/5">
                                            {finding.location.line + idx}
                                        </div>
                                        <div className="pl-4 py-1 text-primary whitespace-pre">
                                            <span className="text-primary/70 mr-2">+</span>{line}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="bg-surface-container border-t border-outline-variant p-3 text-body-md text-on-surface-variant italic">
                                <span className="font-bold text-primary mr-2">AI Suggestion:</span> 
                                {finding.fixSuggestion.explanation}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-surface-container border border-outline-variant rounded p-4 text-label-md">
                            <span className="font-bold text-primary mr-2">Recommendation:</span>
                            <span className="text-on-surface-variant">{finding.recommendation}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
