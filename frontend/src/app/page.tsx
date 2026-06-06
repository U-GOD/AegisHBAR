"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function LandingPage() {
    const pipelineProgressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    if(entry.target.closest('#pipeline-progress-container') || entry.target.id === 'pipeline-progress-container') {
                        if(pipelineProgressRef.current) {
                            setTimeout(() => {
                                pipelineProgressRef.current!.style.width = '100%';
                            }, 500);
                        }
                    }
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in-up').forEach((elem) => {
            observer.observe(elem);
        });
        
        const pipelineSection = document.getElementById('pipeline-section');
        if (pipelineSection) observer.observe(pipelineSection);

        return () => observer.disconnect();
    }, []);

    return (
        <main className="flex-1 flex flex-col font-sans overflow-x-hidden">
            {/* Hero Section */}
            <header className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-outline-variant">
                <div className="hero-glow"></div>
                <div className="relative z-10 max-w-container-max mx-auto px-margin-desktop text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-stack-lg border border-outline-variant rounded-full bg-surface-container-low fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Testnet Live</span>
                    </div>
                    <h1 className="font-headline-lg text-display-sm md:text-headline-lg text-on-surface max-w-4xl mb-stack-md leading-tight fade-in-up" style={{ transitionDelay: '100ms' }}>
                        AI-Powered Smart Contract Security on <span className="text-primary">Hedera</span>
                    </h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-stack-lg fade-in-up" style={{ transitionDelay: '200ms' }}>
                        Pay only for the scans you need. Every finding is anchored on HCS. Every audit earns an NFT certificate.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 fade-in-up" style={{ transitionDelay: '300ms' }}>
                        <Link href="/audit" className="bg-primary text-background font-label-md text-label-md px-8 py-3 rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                            Launch App
                        </Link>
                        <a href="https://github.com/U-GOD/AegisHBAR" target="_blank" rel="noopener noreferrer" className="border border-outline-variant text-on-surface bg-transparent hover:bg-surface-container font-label-md text-label-md px-8 py-3 rounded transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">code</span>
                            View on GitHub
                        </a>
                    </div>
                </div>
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #3c4a42 1px, transparent 1px), linear-gradient(to bottom, #3c4a42 1px, transparent 1px)', backgroundSize: '64px 64px' }}></div>
            </header>

            {/* How It Works Pipeline */}
            <section id="pipeline-section" className="py-24 px-margin-desktop border-b border-outline-variant bg-surface-container-lowest">
                <div className="max-w-container-max mx-auto">
                    <div className="text-center mb-16 fade-in-up">
                        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">The AegisHBAR Pipeline</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant">Streamlined, verifiable, and granular security.</p>
                    </div>
                    <div id="pipeline-progress-container" className="flex flex-col md:flex-row items-start justify-between relative fade-in-up">
                        <div className="hidden md:block absolute top-8 left-12 right-12 h-px bg-outline-variant z-0">
                            <div ref={pipelineProgressRef} className="h-full bg-primary w-0 transition-all duration-1000 ease-out"></div>
                        </div>
                        
                        <div className="flex flex-col items-center text-center w-full md:w-1/4 mb-12 md:mb-0 relative z-10">
                            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant mb-6 shadow-[0_0_15px_rgba(78,222,163,0.1)]">
                                <span className="material-symbols-outlined text-primary text-[24px]">upload_file</span>
                            </div>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">1. Upload</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant px-4">Submit your Solidity contract source code.</p>
                        </div>
                        
                        <div className="flex flex-col items-center text-center w-full md:w-1/4 mb-12 md:mb-0 relative z-10">
                            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant mb-6 shadow-[0_0_15px_rgba(78,222,163,0.1)]">
                                <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
                            </div>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">2. Pay</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant px-4">Authorize x402 micropayments per requested scan module.</p>
                        </div>
                        
                        <div className="flex flex-col items-center text-center w-full md:w-1/4 mb-12 md:mb-0 relative z-10">
                            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant mb-6 shadow-[0_0_15px_rgba(78,222,163,0.1)]">
                                <span className="material-symbols-outlined text-primary text-[24px]">troubleshoot</span>
                            </div>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">3. Scan</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant px-4">AI engines analyze vulnerabilities, streaming results real-time.</p>
                        </div>
                        
                        <div className="flex flex-col items-center text-center w-full md:w-1/4 relative z-10">
                            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant mb-6 shadow-[0_0_15px_rgba(78,222,163,0.1)]">
                                <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            </div>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">4. Certify</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant px-4">Receive HCS-anchored report and unique NFT certificate.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Bento Grid */}
            <section className="py-24 px-margin-desktop border-b border-outline-variant bg-background">
                <div className="max-w-container-max mx-auto">
                    <div className="text-center mb-16 fade-in-up">
                        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Enterprise-Grade Security</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant">Built on Hedera for speed, finality, and provable transparency.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-surface-container-low border border-outline-variant p-6 rounded hover:border-outline transition-colors group fade-in-up">
                            <div className="mb-4">
                                <span className="material-symbols-outlined text-primary text-[32px] group-hover:scale-110 transition-transform">account_balance_wallet</span>
                            </div>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 border-b border-outline-variant pb-2">x402 Micropayments</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant">Granular billing framework. Pay fractional HBAR only for the specific vulnerability signatures you execute.</p>
                        </div>
                        <div className="bg-surface-container-low border border-outline-variant p-6 rounded hover:border-outline transition-colors group fade-in-up" style={{ transitionDelay: '50ms' }}>
                            <div className="mb-4">
                                <span className="material-symbols-outlined text-primary text-[32px] group-hover:scale-110 transition-transform">history_edu</span>
                            </div>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 border-b border-outline-variant pb-2">Immutable Audit Trail</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant">Every finding, log, and result is cryptographically anchored to the Hedera Consensus Service (HCS).</p>
                        </div>
                        <div className="bg-surface-container-low border border-outline-variant p-6 rounded hover:border-outline transition-colors group fade-in-up" style={{ transitionDelay: '100ms' }}>
                            <div className="mb-4">
                                <span className="material-symbols-outlined text-primary text-[32px] group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                            </div>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 border-b border-outline-variant pb-2">NFT Certificates</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant">Upon passing, receive a dynamic NFT acting as verifiable proof of security for investors and users.</p>
                        </div>
                        <div className="bg-surface-container-low border border-outline-variant p-6 rounded hover:border-outline transition-colors group fade-in-up" style={{ transitionDelay: '150ms' }}>
                            <div className="mb-4">
                                <span className="material-symbols-outlined text-primary text-[32px] group-hover:scale-110 transition-transform">smart_toy</span>
                            </div>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 border-b border-outline-variant pb-2">AI Fix Suggestions</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant">Powered by fine-tuned LLMs, receive actionable, syntax-accurate code remediation strategies instantly.</p>
                        </div>
                        <div className="bg-surface-container-low border border-outline-variant p-6 rounded hover:border-outline transition-colors group fade-in-up" style={{ transitionDelay: '200ms' }}>
                            <div className="mb-4">
                                <span className="material-symbols-outlined text-primary text-[32px] group-hover:scale-110 transition-transform">stream</span>
                            </div>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 border-b border-outline-variant pb-2">Real-Time Streaming</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant">Watch vulnerabilities appear in the dashboard as they are discovered. No waiting for a final PDF report.</p>
                        </div>
                        <div className="bg-surface-container-low border border-outline-variant p-6 rounded hover:border-outline transition-colors group fade-in-up" style={{ transitionDelay: '250ms' }}>
                            <div className="mb-4">
                                <span className="material-symbols-outlined text-primary text-[32px] group-hover:scale-110 transition-transform">api</span>
                            </div>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 border-b border-outline-variant pb-2">Hedera Agent Kit</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant">Deep integration with Hedera native services. Built for autonomous agents to request and verify audits.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Table */}
            <section className="py-24 px-margin-desktop border-b border-outline-variant bg-surface-container-lowest">
                <div className="max-w-container-max mx-auto max-w-4xl">
                    <div className="text-center mb-16 fade-in-up">
                        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Modular Pricing</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant">Only pay for the computational intensity you require.</p>
                    </div>
                    <div className="bg-surface-container-low border border-outline-variant rounded overflow-hidden fade-in-up">
                        <div className="w-full">
                            <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container">
                                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase w-2/3">Module</span>
                                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase w-1/3 text-right">Cost (HBAR)</span>
                            </div>
                            <div className="flex items-center justify-between p-4 border-b border-outline-variant hover:bg-surface-container-high transition-colors">
                                <span className="font-label-md text-label-md text-on-surface w-2/3">AST Parser (Base)</span>
                                <span className="font-label-md text-label-md text-primary font-bold w-1/3 text-right font-mono">1.0</span>
                            </div>
                            <div className="flex items-center justify-between p-4 border-b border-outline-variant hover:bg-surface-container-high transition-colors">
                                <span className="font-label-md text-label-md text-on-surface w-2/3">Reentrancy Analysis</span>
                                <span className="font-label-md text-label-md text-primary font-bold w-1/3 text-right font-mono">0.5</span>
                            </div>
                            <div className="flex items-center justify-between p-4 border-b border-outline-variant hover:bg-surface-container-high transition-colors">
                                <span className="font-label-md text-label-md text-on-surface w-2/3">Access Control</span>
                                <span className="font-label-md text-label-md text-primary font-bold w-1/3 text-right font-mono">0.5</span>
                            </div>
                            <div className="flex items-center justify-between p-4 border-b border-outline-variant hover:bg-surface-container-high transition-colors">
                                <span className="font-label-md text-label-md text-on-surface w-2/3">Integer Overflow</span>
                                <span className="font-label-md text-label-md text-primary font-bold w-1/3 text-right font-mono">0.5</span>
                            </div>
                            <div className="flex items-center justify-between p-4 border-b border-outline-variant hover:bg-surface-container-high transition-colors">
                                <span className="font-label-md text-label-md text-on-surface w-2/3">Gas Optimization</span>
                                <span className="font-label-md text-label-md text-primary font-bold w-1/3 text-right font-mono">0.2</span>
                            </div>
                            <div className="flex items-center justify-between p-4 border-b border-outline-variant hover:bg-surface-container-high transition-colors">
                                <span className="font-label-md text-label-md text-on-surface w-2/3">Business Logic (AI)</span>
                                <span className="font-label-md text-label-md text-primary font-bold w-1/3 text-right font-mono">1.0</span>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-surface-container">
                                <span className="font-headline-sm text-headline-sm text-on-surface w-2/3">Full Audit Suite</span>
                                <div className="w-1/3 text-right flex flex-col items-end">
                                    <span className="font-headline-sm text-headline-sm text-primary font-mono mb-2">3.7 HBAR</span>
                                    <Link href="/audit" className="bg-primary text-background font-label-md text-label-md px-6 py-2 rounded hover:opacity-90 transition-opacity">
                                        Start Your Audit
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="py-12 px-margin-desktop border-b border-outline-variant bg-background">
                <div className="max-w-container-max mx-auto text-center fade-in-up">
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-6 tracking-widest">Powered By Modern Web3 & AI Infrastructure</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <span className="px-4 py-2 border border-outline-variant rounded-full text-on-surface-variant font-label-sm text-label-sm bg-surface-container-low">Hedera Network</span>
                        <span className="px-4 py-2 border border-outline-variant rounded-full text-on-surface-variant font-label-sm text-label-sm bg-surface-container-low">x402 Protocol</span>
                        <span className="px-4 py-2 border border-outline-variant rounded-full text-on-surface-variant font-label-sm text-label-sm bg-surface-container-low">Next.js</span>
                        <span className="px-4 py-2 border border-outline-variant rounded-full text-on-surface-variant font-label-sm text-label-sm bg-surface-container-low">OpenAI Models</span>
                        <span className="px-4 py-2 border border-outline-variant rounded-full text-on-surface-variant font-label-sm text-label-sm bg-surface-container-low">HashPack</span>
                        <span className="px-4 py-2 border border-outline-variant rounded-full text-on-surface-variant font-label-sm text-label-sm bg-surface-container-low">Foundry</span>
                    </div>
                </div>
            </section>
        </main>
    );
}
