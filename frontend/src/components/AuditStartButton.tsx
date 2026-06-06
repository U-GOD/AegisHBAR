"use client";

import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { AuditCategory } from "./CategorySelector";
import { TransferTransaction, Hbar, AccountId, TransactionId } from "@hashgraph/sdk";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export type AuditStatus = "idle" | "depositing" | "submitting" | "streaming" | "complete" | "error";

interface AuditStartProps {
    sourceCode: string;
    categories: AuditCategory[];
    totalCost: number;
    onStatusChange: (status: AuditStatus) => void;
    onStreamUrl: (url: string) => void;
}

function toBase64(arr: Uint8Array) {
    let binary = '';
    for (let i = 0; i < arr.byteLength; i++) {
        binary += String.fromCharCode(arr[i]);
    }
    return btoa(binary);
}

export function AuditStartButton({ sourceCode, categories, totalCost, onStatusChange, onStreamUrl }: AuditStartProps) {
    const { isConnected, connect, accountId, hashconnect } = useWallet();
    const [status, setStatus] = useState<AuditStatus>("idle");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const updateStatus = (s: AuditStatus) => {
        setStatus(s);
        onStatusChange(s);
    };

    const startAudit = async () => {
        setErrorMsg(null);

        if (!isConnected || !accountId || !hashconnect) {
            await connect();
            return;
        }

        if (!sourceCode.trim()) {
            setErrorMsg("Paste or upload a Solidity contract first.");
            return;
        }

        const selectedCategories = categories.filter(c => c.selected).map(c => c.id);
        if (selectedCategories.length === 0) {
            setErrorMsg("Select at least one analysis category.");
            return;
        }

        try {
            updateStatus("depositing");

            const depositId = "audit_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
            
            const reqBody = {
                sourceCode,
                categories: selectedCategories,
                depositId,
                depositor: accountId,
            };

            let response = await fetch(`${BACKEND_URL}/api/audit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reqBody),
            });

            if (response.status === 402) {
                const authHeader = response.headers.get("x-402-payment");
                if (!authHeader) throw new Error("Missing x-402-payment header");

                const paymentUrl = authHeader.split(" ")[1];
                if (!paymentUrl) throw new Error("Invalid x-402-payment header format");

                const invoiceRes = await fetch(paymentUrl);
                const invoice = await invoiceRes.json();

                if (!invoice.amount || !invoice.recipient) {
                    throw new Error("Invalid invoice details from facilitator");
                }

                const transaction = new TransferTransaction()
                    .addHbarTransfer(accountId, Hbar.fromTinybars(-invoice.amount))
                    .addHbarTransfer(invoice.recipient, Hbar.fromTinybars(invoice.amount));
                
                transaction.setNodeAccountIds([AccountId.fromString("0.0.3")]);
                transaction.setTransactionId(TransactionId.generate(accountId)); 

                const signer = hashconnect.getSigner(AccountId.fromString(accountId) as any);
                const frozenTx = await transaction.freezeWithSigner(signer as any);
                const signedTx = await frozenTx.signWithSigner(signer as any);

                const payload = {
                    transaction: toBase64(signedTx.toBytes())
                };
                
                const payloadB64 = btoa(JSON.stringify(payload));
                const paymentAuth = `Blocky ${paymentUrl} payment="${payloadB64}"`;

                updateStatus("submitting");

                response = await fetch(`${BACKEND_URL}/api/audit`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "x-402-payment": paymentAuth
                    },
                    body: JSON.stringify(reqBody),
                });
            }

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || `Backend returned ${response.status}`);
            }

            updateStatus("streaming");
            onStreamUrl(`${BACKEND_URL}/api/audit/stream/${depositId}`);

        } catch (err: any) {
            console.error("[AuditStart] Error:", err);
            updateStatus("error");

            if (err.message?.includes("rejected")) {
                setErrorMsg("Payment transaction was rejected.");
            } else {
                setErrorMsg(err.message || "An unexpected error occurred.");
            }
        }
    };

    const isLoading = status === "depositing" || status === "submitting";

    const statusLabels: Record<string, string> = {
        idle: `Run Audit (${totalCost.toFixed(1)} HBAR)`,
        depositing: "Authorizing Payment...",
        submitting: "Submitting to Auditor...",
        streaming: "Audit in Progress...",
        complete: "Audit Complete",
        error: `Run Audit (${totalCost.toFixed(1)} HBAR)`,
    };

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={isConnected ? startAudit : connect}
                disabled={isLoading || status === "streaming"}
                className={`w-full py-3 px-6 rounded-lg text-label-md font-bold transition-all duration-200 flex items-center justify-center gap-2
                    ${isLoading || status === "streaming"
                        ? "bg-surface-container-high text-on-surface-variant border border-outline-variant cursor-wait"
                        : "bg-primary text-on-primary hover:bg-primary/90 active:scale-[0.98]"
                    }
                `}
            >
                {isLoading && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                )}
                {isConnected ? statusLabels[status] : "Connect Wallet to Start"}
            </button>

            {errorMsg && (
                <p className="text-error text-label-sm text-center">{errorMsg}</p>
            )}
        </div>
    );
}
