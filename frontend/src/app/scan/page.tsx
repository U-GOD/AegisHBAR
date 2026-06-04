"use client";

import { ContractUploader } from "../../components/ContractUploader";
import { CategorySelector, defaultCategories } from "../../components/CategorySelector";
import { AuditStartButton, AuditStatus } from "../../components/AuditStartButton";
import { useState } from "react";

export default function ScanPage() {
    const [sourceCode, setSourceCode] = useState("");
    const [categories, setCategories] = useState(defaultCategories);
    const [auditStatus, setAuditStatus] = useState<AuditStatus>("idle");
    const totalCost = 1.0 + categories.filter(c => c.selected).reduce((sum, c) => sum + c.cost, 0);

    return (
        <main className="flex-1 flex flex-col font-sans">
            <div className="container max-w-6xl mx-auto px-4 py-8 mt-8 flex flex-col gap-8">
                <div className="mb-4">
                    <h1 className="text-headline-lg font-bold text-on-surface mb-2">Quick Scan</h1>
                    <p className="text-body-md text-on-surface-variant">
                        Paste your Solidity code below or drop a .sol file to run a standalone security scan.
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
                                onStreamUrl={() => {}}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
