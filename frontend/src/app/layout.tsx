import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { WalletProvider } from "../context/WalletContext";

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
            <body className="bg-background text-on-surface font-body-md min-h-screen flex selection:bg-primary/30">
                <WalletProvider>
                    <Sidebar />
                    <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                        <TopNav />
                        {children}
                        <Footer />
                    </div>
                </WalletProvider>
            </body>
        </html>
    );
}
