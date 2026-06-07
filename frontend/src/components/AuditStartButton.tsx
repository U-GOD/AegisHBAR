"use client";

import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { AuditCategory } from "./CategorySelector";


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
                // x402 v2: Server sends PAYMENT-REQUIRED header (base64-encoded JSON)
                const paymentRequiredHeader = response.headers.get("payment-required") || response.headers.get("PAYMENT-REQUIRED");
                console.log("402 Response Headers:", [...response.headers.entries()]);
                
                let paymentRequired: any;
                
                if (paymentRequiredHeader) {
                    // v2 header: base64-encoded JSON
                    try {
                        paymentRequired = JSON.parse(atob(paymentRequiredHeader));
                    } catch {
                        // Try reading from response body as fallback
                        paymentRequired = await response.json().catch(() => null);
                    }
                } else {
                    // Fallback: read from JSON body (some x402 versions do this)
                    paymentRequired = await response.json().catch(() => null);
                }

                if (!paymentRequired || !paymentRequired.accepts || paymentRequired.accepts.length === 0) {
                    throw new Error("Invalid 402 response: no payment requirements found");
                }

                console.log("Payment Required:", paymentRequired);

                // Select the matching payment option based on totalCost
                // The amount in the requirements is in the smallest unit (tinybars for HBAR)
                const desiredAmount = String(Math.floor(totalCost * 100_000_000));
                const selectedRequirement = paymentRequired.accepts.find(
                    (a: any) => String(a.amount) === desiredAmount
                ) || paymentRequired.accepts[0];

                console.log("Selected requirement:", selectedRequirement);

                // Build the Hedera transfer transaction
                const { TransferTransaction, Hbar, AccountId, TransactionId } = await import("@hashgraph/sdk");

                const transaction = new TransferTransaction()
                    .addHbarTransfer(accountId, Hbar.fromTinybars(-Number(selectedRequirement.amount)))
                    .addHbarTransfer(selectedRequirement.payTo, Hbar.fromTinybars(Number(selectedRequirement.amount)));

                transaction.setNodeAccountIds([AccountId.fromString("0.0.3")]);
                // Use the feePayer from the requirement (Blocky402's fee payer account)
                const feePayer = selectedRequirement.extra?.feePayer || accountId;
                transaction.setTransactionId(TransactionId.generate(feePayer));
                transaction.freeze();

                const signer = hashconnect.getSigner(AccountId.fromString(accountId) as any);
                const signedTx = await transaction.signWithSigner(signer as any);

                // Build the x402 v2 PaymentPayload
                const paymentPayload = {
                    x402Version: 2,
                    payload: {
                        transaction: toBase64(signedTx.toBytes())
                    },
                    accepted: selectedRequirement,
                    resource: paymentRequired.resource
                };

                console.log("Payment payload:", paymentPayload);

                // Encode as base64 for the PAYMENT-SIGNATURE header
                const paymentSignature = btoa(JSON.stringify(paymentPayload));

                updateStatus("submitting");

                // Retry the request with the payment signature
                response = await fetch(`${BACKEND_URL}/api/audit`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Payment-Signature": paymentSignature
                    },
                    body: JSON.stringify(reqBody),
                });
            }

            if (!response.ok) {
                let errorMsg = `Backend returned ${response.status}`;
                
                if (response.status === 402) {
                    // The backend returned 402 again, which means Blocky402 rejected the transaction.
                    // The error reason is in the PAYMENT-REQUIRED header.
                    const header = response.headers.get("payment-required") || response.headers.get("PAYMENT-REQUIRED");
                    if (header) {
                        try {
                            const pr = JSON.parse(atob(header));
                            if (pr.error) {
                                errorMsg = `Payment rejected: ${pr.error}`;
                            }
                        } catch (e) {
                            console.error("Failed to parse error header", e);
                        }
                    }
                } else {
                    const body = await response.json().catch(() => ({}));
                    if (body.error || body.errorMessage) {
                        errorMsg = body.error || body.errorMessage;
                    }
                }
                
                throw new Error(errorMsg);
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
