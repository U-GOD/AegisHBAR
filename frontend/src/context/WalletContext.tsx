"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { HashConnect, HashConnectConnectionState, SessionData } from "hashconnect";
import { LedgerId } from "@hashgraph/sdk";

interface WalletContextType {
    accountId: string | null;
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
    hashconnect: HashConnect | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const appMetadata = {
    name: "AegisHBAR",
    description: "Hedera Smart Contract Auditing",
    icons: ["https://cryptologos.cc/logos/hedera-hbar-logo.png"],
    url: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
};

// Initialize once outside the component to prevent hot-reloading duplicate instances
let hc: HashConnect | null = null;

export function WalletProvider({ children }: { children: ReactNode }) {
    const [accountId, setAccountId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [hashconnect, setHashconnect] = useState<HashConnect | null>(null);

    useEffect(() => {
        let mounted = true;

        const initHashConnect = async () => {
            if (!hc) {
                // Using a common public test Project ID for WalletConnect. In production, get your own from cloud.walletconnect.com
                hc = new HashConnect(LedgerId.TESTNET, "1133ab4373a2af4a69daed2381e4b85c", appMetadata, false);
                
                hc.pairingEvent.on((pairingData: SessionData) => {
                    if (pairingData.accountIds.length > 0) {
                        setAccountId(pairingData.accountIds[0]);
                        setIsConnected(true);
                    }
                });

                hc.disconnectionEvent.on(() => {
                    setAccountId(null);
                    setIsConnected(false);
                });

                hc.connectionStatusChangeEvent.on((state: HashConnectConnectionState) => {
                    if (state === HashConnectConnectionState.Disconnected) {
                        setAccountId(null);
                        setIsConnected(false);
                    }
                });

                await hc.init();
            }
            if (mounted) {
                setHashconnect(hc);
            }
        };

        initHashConnect();

        return () => {
            mounted = false;
        };
    }, []);

    const connect = () => {
        if (hashconnect) {
            hashconnect.openPairingModal();
        }
    };

    const disconnect = () => {
        if (hashconnect) {
            hashconnect.disconnect();
            setAccountId(null);
            setIsConnected(false);
        }
    };

    return (
        <WalletContext.Provider value={{ accountId, isConnected, connect, disconnect, hashconnect }}>
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
