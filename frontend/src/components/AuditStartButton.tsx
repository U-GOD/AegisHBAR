"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import { AuditCategory } from "./CategorySelector";

const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// Minimal ABI for the deposit function
const ESCROW_ABI = [
    "function deposit(uint256 timeoutSeconds) external payable returns (bytes32 depositId)",
    "event DepositCreated(bytes32 indexed depositId, address indexed depositor, uint256 amount)"
];

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
            // Step 1: Deposit HBAR into the escrow contract
            updateStatus("depositing");
            const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
            const depositValue = ethers.parseEther(totalCost.toString());
            const timeoutSeconds = 3600; // 1 hour

            const tx = await escrow.deposit(timeoutSeconds, { value: depositValue });
            const receipt = await tx.wait();

            // Extract depositId from the DepositCreated event
            const event = receipt.logs.find((log: any) => {
                try {
                    return escrow.interface.parseLog(log)?.name === "DepositCreated";
                } catch { return false; }
            });

            if (!event) {
                throw new Error("Deposit transaction succeeded but no DepositCreated event was found.");
            }

            const parsed = escrow.interface.parseLog(event);
            const depositId = parsed?.args[0];

            // Step 2: Submit source code + deposit receipt to the backend
            updateStatus("submitting");
            const response = await fetch(`${BACKEND_URL}/api/audit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sourceCode,
                    categories: selectedCategories,
                    depositId,
                    depositor: await signer.getAddress(),
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

            if (err.code === "ACTION_REJECTED") {
                setErrorMsg("Transaction was rejected in MetaMask.");
            } else {
                setErrorMsg(err.message || "An unexpected error occurred.");
            }
        }
    };

    const isLoading = status === "depositing" || status === "submitting";

    const statusLabels: Record<string, string> = {
        idle: `Run Audit (${totalCost.toFixed(1)} HBAR)`,
        depositing: "Depositing to Escrow...",
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
