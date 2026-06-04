"use client";

import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { AuditCategory } from "./CategorySelector";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment } from "@x402/fetch";
import { ethers } from "ethers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export type AuditStatus = "idle" | "depositing" | "submitting" | "streaming" | "complete" | "error";

interface AuditStartProps {
    sourceCode: string;
    categories: AuditCategory[];
    totalCost: number;
    onStatusChange: (status: AuditStatus) => void;
    onStreamUrl: (url: string) => void;
}

export function AuditStartButton({ sourceCode, categories, totalCost, onStatusChange, onStreamUrl }: AuditStartProps) {
    const { isConnected, connect, signer } = useWallet();
    const [status, setStatus] = useState<AuditStatus>("idle");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const updateStatus = (s: AuditStatus) => {
        setStatus(s);
        onStatusChange(s);
    };

    const startAudit = async () => {
        setErrorMsg(null);

        if (!isConnected || !signer) {
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
            
            // Create a pseudo-depositId since we no longer have an on-chain escrow ID
            // The backend uses this to uniquely identify the SSE stream
            const depositId = ethers.hexlify(ethers.randomBytes(32));
            const address = await signer.getAddress();

            // 1. Wrap the ethers Signer into a ClientEvmSigner for @x402/evm
            const evmSigner = {
                address: address as `0x${string}`,
                signTypedData: async (args: any) => {
                    // Ethers v6 signTypedData signature: (domain, types, value)
                    // We must filter out the EIP712Domain type from types, as ethers adds it automatically
                    const types = { ...args.types };
                    delete types.EIP712Domain;
                    
                    return (await signer.signTypedData(
                        args.domain,
                        types,
                        args.message
                    )) as `0x${string}`;
                }
            };

            // 2. Initialize the x402 client with the EVM Scheme
            const client = new x402Client().register(
                "eip155:296", // Hedera Testnet EVM
                new ExactEvmScheme(evmSigner)
            );

            // 3. Make the API request using wrapped fetch
            // This will automatically intercept the 402 Payment Required response,
            // prompt the user to sign the transaction via MetaMask, and retry the request.
            updateStatus("submitting");
            
            const fetchWithPay = wrapFetchWithPayment(window.fetch, client);
            
            const response = await fetchWithPay(`${BACKEND_URL}/api/audit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sourceCode,
                    categories: selectedCategories,
                    depositId,
                    depositor: address,
                }),
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || `Backend returned ${response.status}`);
            }

            // Step 3: Hand off to the SSE stream
            updateStatus("streaming");
            onStreamUrl(`${BACKEND_URL}/api/audit/stream/${depositId}`);

        } catch (err: any) {
            console.error("[AuditStart] Error:", err);
            updateStatus("error");

            if (err.code === "ACTION_REJECTED" || err.message?.includes("rejected")) {
                setErrorMsg("Payment transaction was rejected in MetaMask.");
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
