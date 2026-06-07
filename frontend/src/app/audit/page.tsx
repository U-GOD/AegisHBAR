"use client";

import { useState } from "react";
import { ContractUploader } from "../../components/ContractUploader";
import { CategorySelector, defaultCategories } from "../../components/CategorySelector";
import { AuditStartButton, AuditStatus } from "../../components/AuditStartButton";
import { useAuditStream } from "../../hooks/useAuditStream";
import { FindingCard, Finding } from "../../components/FindingCard";
import { CertificateViewer } from "../../components/CertificateViewer";

export default function Home() {
    const [sourceCode, setSourceCode] = useState("");
    const [categories, setCategories] = useState(defaultCategories);
    const [auditStatus, setAuditStatus] = useState<AuditStatus>("idle");
    
    const stream = useAuditStream();

    const totalCost = 1.0 + categories.filter(c => c.selected).reduce((sum, c) => sum + c.cost, 0);

    const handleStreamUrlReady = (url: string) => {
        stream.startStream(url);
    };

    const reset = () => {
        setSourceCode("");
        setAuditStatus("idle");
        stream.reset();
    };

    return (
        <main className="flex-1 flex flex-col font-sans">
            <div className="flex-1 container max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8 mt-8">
                
                {/* STATE 1: Not Auditing (Upload & Select) */}
                {(!stream.isStreaming && !stream.report && auditStatus !== "streaming") && (
                    <div className="flex flex-col gap-8 animate-fade-in">
                        <div className="text-center mb-4 mt-4">
                            <h1 className="text-display-sm font-bold text-on-surface mb-4">
                                Secure Your <span className="text-primary">Hedera</span> Smart Contracts
                            </h1>
                            <p className="text-body-md text-on-surface-variant max-w-2xl mx-auto">
                                AI-powered vulnerability detection with immutable, on-chain NFT audit certificates.
                            </p>
                        </div>

                        <ContractUploader sourceCode={sourceCode} setSourceCode={setSourceCode} />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <CategorySelector categories={categories} onChange={setCategories} />
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="bg-surface border border-outline-variant rounded-xl p-6 h-full flex flex-col justify-center shadow-lg">
                                    <h3 className="text-headline-sm font-bold mb-2">Ready to Scan</h3>
                                    <p className="text-body-md text-on-surface-variant mb-6">
                                        Your payment will be locked in an escrow smart contract and only consumed once the analysis is complete.
                                    </p>
                                    <AuditStartButton 
                                        sourceCode={sourceCode}
                                        categories={categories}
                                        totalCost={totalCost}
                                        onStatusChange={setAuditStatus}
                                        onStreamUrl={handleStreamUrlReady}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STATE 2: Streaming Progress */}
                {(stream.isStreaming || auditStatus === "streaming") && !stream.report && (
                    <div className="flex flex-col gap-8 items-center justify-center flex-1 animate-fade-in my-auto">
                        <div className="w-full max-w-2xl bg-surface border border-outline-variant rounded-xl p-8 shadow-lg">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="relative flex items-center justify-center w-16 h-16">
                                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                                    <span className="material-symbols-outlined text-primary text-[24px]">troubleshoot</span>
                                </div>
                                <div>
                                    <h2 className="text-headline-md font-bold text-on-surface">Auditing in Progress...</h2>
                                    <p className="text-body-lg text-primary font-bold uppercase tracking-wide mt-1">
                                        {stream.currentPhase?.replace('-', ' ') || "Initializing Engine..."}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 h-72 overflow-y-auto font-mono text-label-sm flex flex-col gap-3 shadow-inner">
                                {stream.events.map((evt, idx) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                        <span className="text-primary/60 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                                        <span className={evt.phase === "error" ? "text-error font-bold" : "text-on-surface-variant"}>
                                            {evt.message}
                                        </span>
                                    </div>
                                ))}
                                {/* Auto-scroll dummy element could go here */}
                            </div>
                            
                            {stream.error && (
                                <div className="mt-6 text-center">
                                    <button onClick={reset} className="text-error hover:underline font-bold text-label-md">
                                        Reset and Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STATE 3: Complete (Dashboard & Certificate View) */}
                {stream.report && (
                    <div className="flex flex-col gap-8 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-display-sm font-bold text-on-surface">Audit Results</h2>
                            <button onClick={reset} className="text-label-md font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">refresh</span>
                                Start New Audit
                            </button>
                        </div>

                        {/* The Immutable Certificate Card */}
                        <CertificateViewer 
                            report={stream.report} 
                            certificate={stream.certificate} 
                        />

                        {/* Detailed Findings List */}
                        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm mt-4">
                            <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant flex justify-between items-center">
                                <h3 className="text-headline-sm font-bold text-on-surface">Identified Vulnerabilities ({stream.report.findings.length})</h3>
                            </div>
                            <div className="flex flex-col">
                                {stream.report.findings.length === 0 ? (
                                    <div className="p-8 text-center text-on-surface-variant flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-[48px] text-primary/50">verified_user</span>
                                        <p className="text-body-lg">No vulnerabilities detected. Excellent work!</p>
                                    </div>
                                ) : (
                                    stream.report.findings.map((finding: Finding) => (
                                        <FindingCard key={finding.id} finding={finding} fileName={`${stream.report.contractName}.sol`} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
