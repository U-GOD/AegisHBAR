"use client";

import { useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export function CertificateVerifier() {
    const [tokenId, setTokenId] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "verified" | "error">("idle");
    const [certificateData, setCertificateData] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState("");

    const verifyCertificate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!tokenId.trim()) return;

        setStatus("loading");
        setErrorMsg("");
        setCertificateData(null);

        try {
            const res = await fetch(`${BACKEND_URL}/api/certificate/${tokenId}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to verify certificate");
            }

            setCertificateData(data);
            setStatus("verified");
        } catch (err: any) {
            setStatus("error");
            setErrorMsg(err.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto w-full">
            <div className="bg-surface border border-outline-variant rounded-xl p-stack-lg shadow-sm">
                <div className="text-center mb-8">
                    <h2 className="text-headline-sm font-bold text-on-surface mb-2">Verify Audit Certificate</h2>
                    <p className="text-body-md text-on-surface-variant">
                        Enter an AegisHBAR NFT Token ID to query its immutable audit metadata directly from the Hedera blockchain.
                    </p>
                </div>

                <form onSubmit={verifyCertificate} className="flex flex-col sm:flex-row gap-4 mb-8">
                    <input 
                        type="number"
                        min="1"
                        placeholder="e.g. 1"
                        value={tokenId}
                        onChange={(e) => setTokenId(e.target.value)}
                        className="flex-1 bg-surface-container text-on-surface font-label-md px-4 py-3 rounded-lg border border-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/50"
                    />
                    <button 
                        type="submit"
                        disabled={status === "loading" || !tokenId}
                        className="px-6 py-3 rounded-lg bg-primary text-on-primary font-bold text-label-md transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                    >
                        {status === "loading" ? "Verifying..." : "Verify"}
                    </button>
                </form>

                {status === "error" && (
                    <div className="bg-error/10 border border-error/30 text-error rounded-lg p-4 flex items-center gap-3">
                        <span className="material-symbols-outlined">cancel</span>
                        <span className="text-label-md font-bold">{errorMsg}</span>
                    </div>
                )}

                {status === "verified" && certificateData && (
                    <div className="animate-fade-in border-t border-outline-variant pt-8">
                        <div className="flex items-center justify-center gap-2 text-primary mb-6">
                            <span className="material-symbols-outlined text-[32px]">verified</span>
                            <h3 className="text-headline-sm font-bold">Authentic AegisHBAR Audit</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-sm text-label-md">
                            <div className="bg-surface-container p-4 rounded-lg flex flex-col gap-1">
                                <span className="text-on-surface-variant text-label-sm uppercase tracking-wider">Owner Wallet</span>
                                <span className="text-on-surface truncate font-bold" title={certificateData.owner}>{certificateData.owner.slice(0, 8)}...{certificateData.owner.slice(-6)}</span>
                            </div>
                            
                            <div className="bg-surface-container p-4 rounded-lg flex flex-col gap-1">
                                <span className="text-on-surface-variant text-label-sm uppercase tracking-wider">Audit Date</span>
                                <span className="text-on-surface font-bold">{new Date(certificateData.auditTimestamp).toLocaleDateString()}</span>
                            </div>

                            <div className="bg-surface-container p-4 rounded-lg flex flex-col gap-1 col-span-1 md:col-span-2">
                                <span className="text-on-surface-variant text-label-sm uppercase tracking-wider">HCS Topic ID (Immutable Proof)</span>
                                <span className="text-primary font-bold">{certificateData.hcsTopicId}</span>
                            </div>

                            <div className="bg-surface-container p-4 rounded-lg flex flex-col gap-1 col-span-1 md:col-span-2">
                                <span className="text-on-surface-variant text-label-sm uppercase tracking-wider">Contract Source Hash</span>
                                <span className="text-on-surface truncate font-mono text-label-sm">{certificateData.contractHash}</span>
                            </div>
                        </div>

                        <div className="mt-stack-md bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
                            <div className="bg-surface-container-high px-4 py-2 border-b border-outline-variant text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                                Findings Summary
                            </div>
                            <div className="grid grid-cols-5 divide-x divide-outline-variant text-center text-label-md">
                                <div className="p-3">
                                    <div className="text-error font-bold text-headline-sm mb-1">{certificateData.criticalCount}</div>
                                    <div className="text-on-surface-variant text-[10px] uppercase">Critical</div>
                                </div>
                                <div className="p-3">
                                    <div className="text-tertiary font-bold text-headline-sm mb-1">{certificateData.highCount}</div>
                                    <div className="text-on-surface-variant text-[10px] uppercase">High</div>
                                </div>
                                <div className="p-3">
                                    <div className="text-secondary font-bold text-headline-sm mb-1">{certificateData.mediumCount}</div>
                                    <div className="text-on-surface-variant text-[10px] uppercase">Medium</div>
                                </div>
                                <div className="p-3">
                                    <div className="text-primary font-bold text-headline-sm mb-1">{certificateData.lowCount}</div>
                                    <div className="text-on-surface-variant text-[10px] uppercase">Low</div>
                                </div>
                                <div className="p-3 bg-surface-container-low">
                                    <div className="text-on-surface font-bold text-headline-sm mb-1">{certificateData.totalFindings}</div>
                                    <div className="text-on-surface-variant text-[10px] uppercase">Total</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
