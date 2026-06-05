"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ethers } from "ethers";

declare global {
    interface Window {
        ethereum?: any;
    }
}

interface WalletContextType {
    address: string | null;
    isConnected: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    provider: ethers.BrowserProvider | null;
    signer: ethers.JsonRpcSigner | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Hedera Testnet Configuration
const HEDERA_TESTNET_CHAIN_ID = "0x128"; // 296 in hex

export function WalletProvider({ children }: { children: ReactNode }) {
    const [address, setAddress] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

    useEffect(() => {
        // Automatically check if already connected
        if (typeof window !== "undefined" && window.ethereum) {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(browserProvider);

            window.ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
                if (accounts.length > 0) {
                    setAddress(accounts[0]);
                    browserProvider.getSigner().then(setSigner);
                }
            });

            window.ethereum.on("accountsChanged", (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAddress(accounts[0]);
                    browserProvider.getSigner().then(setSigner);
                } else {
                    setAddress(null);
                    setSigner(null);
                }
            });

            window.ethereum.on("chainChanged", () => {
                window.location.reload();
            });
        }
    }, []);

    const connect = async () => {
        if (!window.ethereum) {
            alert("MetaMask is not installed. Please install it to use this app.");
            return;
        }

        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            
            // Switch to Hedera Testnet if not already on it
            const network = await browserProvider.getNetwork();
            if (network.chainId !== BigInt(296)) {
                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: HEDERA_TESTNET_CHAIN_ID }],
                    });
                } catch (switchError: any) {
                    // This error code indicates that the chain has not been added to MetaMask.
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: "wallet_addEthereumChain",
                            params: [
                                {
                                    chainId: HEDERA_TESTNET_CHAIN_ID,
                                    chainName: "Hedera Testnet",
                                    rpcUrls: ["https://testnet.hashio.io/api"],
                                    nativeCurrency: {
                                        name: "HBAR",
                                        symbol: "HBAR",
                                        decimals: 18,
                                    },
                                    blockExplorerUrls: ["https://hashscan.io/testnet"],
                                },
                            ],
                        });
                    } else {
                        throw switchError;
                    }
                }
            }

            const accounts = await browserProvider.send("eth_requestAccounts", []);
            setAddress(accounts[0]);
            setProvider(browserProvider);
            setSigner(await browserProvider.getSigner());
        } catch (error) {
            console.error("Failed to connect wallet:", error);
        }
    };

    const disconnect = () => {
        setAddress(null);
        setSigner(null);
        // MetaMask doesn't have a true "disconnect" method that apps can trigger,
        // so we just clear local state.
    };

    return (
        <WalletContext.Provider value={{ address, isConnected: !!address, connect, disconnect, provider, signer }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}
