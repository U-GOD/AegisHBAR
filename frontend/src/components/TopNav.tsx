"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "../context/WalletContext";

export function TopNav() {
    const { accountId, isConnected, connect, disconnect } = useWallet();
    const pathname = usePathname();

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Launch App", path: "/audit" },
        { name: "Reports", path: "/reports" },
        { name: "Documentation", path: "/docs" },
    ];

    return (
        <header className="bg-background w-full top-0 border-b border-outline-variant">
            <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 max-w-container-max mx-auto">
                <div className="md:hidden text-headline-sm font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        security
                    </span>
                    AegisHBAR
                </div>
                <div className="hidden md:flex gap-gutter h-full items-end pt-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link 
                                key={item.path}
                                href={item.path}
                                className={
                                    isActive 
                                    ? "text-primary border-b-2 border-primary pb-1 transition-colors duration-200 text-label-md mb-[-1px]"
                                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors duration-200 text-label-md pb-1 mb-[-1px] px-2 rounded-t"
                                }
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
                <div className="flex items-center gap-stack-md">
                    {!isConnected ? (
                        <button 
                            onClick={connect}
                            className="hidden md:flex bg-transparent border border-outline text-on-surface py-1.5 px-4 rounded text-label-md hover:bg-surface-container transition-colors items-center gap-2"
                        >
                            Connect Wallet
                        </button>
                    ) : (
                        <div className="hidden md:flex items-center gap-2 bg-surface-container border border-outline-variant py-1.5 px-4 rounded text-label-md text-primary font-bold cursor-pointer hover:bg-surface-container-high transition-colors" onClick={disconnect}>
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                            {accountId}
                        </div>
                    )}
                    <button className="md:hidden text-on-surface">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
