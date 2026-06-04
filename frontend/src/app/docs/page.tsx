export default function DocsPage() {
    return (
        <main className="flex-1 flex flex-col font-sans">
            <div className="container max-w-4xl mx-auto px-4 py-8 mt-8">
                <h1 className="text-headline-lg font-bold text-on-surface mb-6">Documentation</h1>

                <div className="flex flex-col gap-8">
                    {/* Getting Started */}
                    <section className="bg-surface border border-outline-variant rounded-xl p-6">
                        <h2 className="text-headline-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">rocket_launch</span>
                            Getting Started
                        </h2>
                        <ol className="list-decimal list-inside text-body-md text-on-surface-variant flex flex-col gap-2 ml-2">
                            <li><strong className="text-on-surface">Connect Wallet</strong> — Click "Connect Wallet" in the top-right corner. MetaMask will prompt you to connect to the Hedera Testnet.</li>
                            <li><strong className="text-on-surface">Upload Contract</strong> — Paste your Solidity source code into the editor, or drag and drop a <code className="text-primary bg-primary/10 px-1 rounded">.sol</code> file.</li>
                            <li><strong className="text-on-surface">Select Modules</strong> — Pick the vulnerability categories you want to scan for. Each module has a small HBAR cost.</li>
                            <li><strong className="text-on-surface">Run Audit</strong> — Click the audit button. MetaMask will ask you to confirm the HBAR deposit into our escrow contract.</li>
                            <li><strong className="text-on-surface">Receive Certificate</strong> — Once complete, you will receive an immutable NFT certificate and a downloadable PDF report.</li>
                        </ol>
                    </section>

                    {/* Architecture */}
                    <section className="bg-surface border border-outline-variant rounded-xl p-6">
                        <h2 className="text-headline-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">architecture</span>
                            Architecture Overview
                        </h2>
                        <p className="text-body-md text-on-surface-variant mb-4">
                            AegisHBAR is a full-stack decentralized auditing platform built on the Hedera network.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-surface-container rounded-lg p-4">
                                <h3 className="text-label-md font-bold text-on-surface mb-1">Static Analysis Engine</h3>
                                <p className="text-body-sm text-on-surface-variant">Parses the Solidity AST and runs pattern-matching analyzers for reentrancy, access control, integer overflow, gas optimization, and business logic flaws.</p>
                            </div>
                            <div className="bg-surface-container rounded-lg p-4">
                                <h3 className="text-label-md font-bold text-on-surface mb-1">AI Fix Suggestions</h3>
                                <p className="text-body-sm text-on-surface-variant">Each finding is passed to an LLM which generates an exact code-diff fix suggestion with a before/after comparison.</p>
                            </div>
                            <div className="bg-surface-container rounded-lg p-4">
                                <h3 className="text-label-md font-bold text-on-surface mb-1">Hedera Consensus Service</h3>
                                <p className="text-body-sm text-on-surface-variant">A hash of the final audit report is permanently logged to HCS, creating an immutable, timestamped proof of the audit.</p>
                            </div>
                            <div className="bg-surface-container rounded-lg p-4">
                                <h3 className="text-label-md font-bold text-on-surface mb-1">NFT Certificates</h3>
                                <p className="text-body-sm text-on-surface-variant">An ERC-721 NFT is minted on Hedera with full on-chain metadata (findings summary, risk score, source hash) and an IPFS-pinned PDF.</p>
                            </div>
                        </div>
                    </section>

                    {/* Smart Contracts */}
                    <section className="bg-surface border border-outline-variant rounded-xl p-6">
                        <h2 className="text-headline-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">description</span>
                            Smart Contracts
                        </h2>
                        <div className="flex flex-col gap-3 text-body-md">
                            <div className="flex justify-between items-center bg-surface-container rounded-lg p-3">
                                <span className="text-on-surface font-bold">AuditEscrow.sol</span>
                                <span className="text-on-surface-variant text-body-sm">Handles HBAR deposits and refunds</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface-container rounded-lg p-3">
                                <span className="text-on-surface font-bold">AuditCertificate.sol</span>
                                <span className="text-on-surface-variant text-body-sm">ERC-721 NFT with on-chain audit metadata</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface-container rounded-lg p-3">
                                <span className="text-on-surface font-bold">AuditRegistry.sol</span>
                                <span className="text-on-surface-variant text-body-sm">Global registry mapping contracts to audits</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
