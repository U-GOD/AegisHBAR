"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { HashConnect, HashConnectConnectionState, SessionData } from "hashconnect";

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
let hc: any = null;

export function WalletProvider({ children }: { children: ReactNode }) {
    const [accountId, setAccountId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [hashconnect, setHashconnect] = useState<HashConnect | null>(null);

    useEffect(() => {
        let mounted = true;

        const initHashConnect = async () => {
            try {
                if (!hc) {
                    const hcModule = await import("hashconnect");
                    const HashConnect = hcModule.HashConnect || (hcModule.default as any)?.HashConnect;
                    const HashConnectConnectionState = hcModule.HashConnectConnectionState || (hcModule.default as any)?.HashConnectConnectionState;
                    const { LedgerId } = await import("@hashgraph/sdk");

                    if (!HashConnect) throw new Error("HashConnect class not found in dynamically imported module");

                    hc = new HashConnect(LedgerId.TESTNET, "03231d174fa60611f3d27d71636c63b3", appMetadata, false);
                    
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

                    hc.connectionStatusChangeEvent.on((state: any) => {
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
            } catch (err) {
                console.error("Failed to initialize HashConnect:", err);
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
