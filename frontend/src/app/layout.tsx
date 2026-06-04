import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { WalletProvider } from "../context/WalletContext";
import { ToastProvider } from "../context/ToastContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "AegisHBAR - Findings Dashboard",
    description: "Enterprise Smart Contract Auditor secured by Hedera.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
        >
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
            </head>
            <body className="bg-background text-on-surface font-body-md min-h-screen flex flex-col selection:bg-primary/30">
                <WalletProvider>
                <ToastProvider>
                    <TopNav />
                    <div className="flex-1 flex flex-col w-full">
                        {children}
                    </div>
                    <Footer />
                </ToastProvider>
                </WalletProvider>
            </body>
        </html>
    );
}
