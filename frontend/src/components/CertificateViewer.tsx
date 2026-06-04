"use client";

interface CertificateViewerProps {
    report: any;
    certificate: {
        tokenId: number;
        hcsTopicId: string;
        metadataUri: string;
        pdfUri: string;
    };
}

export function CertificateViewer({ report, certificate }: CertificateViewerProps) {
    const CERTIFICATE_ADDRESS = process.env.NEXT_PUBLIC_CERTIFICATE_ADDRESS || "0xC26fc21486624F3C1F2B55BeDBeDa39CFF79c4D4";

    // Convert ipfs:// URI to a public HTTP gateway URL for easy viewing
    const ipfsToHttp = (ipfsUri: string) => {
        if (!ipfsUri) return "#";
        return ipfsUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
    };

    const hashscanUrl = `https://hashscan.io/testnet/token/${CERTIFICATE_ADDRESS}?p=1&k=${certificate.tokenId}`;

    return (
        <div className="bg-surface border border-outline-variant rounded-xl p-stack-lg overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                    <span className="material-symbols-outlined text-[32px]">verified</span>
                </div>
                <h2 className="text-display-sm font-bold text-on-surface mb-2">Audit Complete</h2>
                <p className="text-body-lg text-on-surface-variant max-w-lg mx-auto">
                    Your smart contract has been thoroughly analyzed and your immutable Audit Certificate NFT has been successfully minted to your wallet.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md mb-8">
                <div className="bg-surface-container border border-outline-variant rounded-lg p-5">
                    <h3 className="text-label-sm uppercase text-on-surface-variant mb-4 font-bold tracking-wider">Certificate Details</h3>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-body-md text-on-surface-variant">Contract Name</span>
                            <span className="text-label-md font-bold text-on-surface">{report.contractName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-body-md text-on-surface-variant">Risk Score</span>
                            <span className={`text-label-md font-bold px-2 py-0.5 rounded ${
                                report.overallRiskScore >= 80 ? 'bg-primary/20 text-primary' : 
                                report.overallRiskScore >= 50 ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'
                            }`}>
                                {report.overallRiskScore} / 100
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-body-md text-on-surface-variant">NFT Token ID</span>
                            <span className="text-label-md font-bold text-on-surface">#{certificate.tokenId}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-container border border-outline-variant rounded-lg p-5">
                    <h3 className="text-label-sm uppercase text-on-surface-variant mb-4 font-bold tracking-wider">Immutable Proof</h3>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-body-md text-on-surface-variant">HCS Topic ID</span>
                            <span className="text-label-md text-primary truncate max-w-[150px]" title={certificate.hcsTopicId}>
                                {certificate.hcsTopicId || "Pending..."}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-body-md text-on-surface-variant">Metadata IPFS CID</span>
                            <a 
                                href={ipfsToHttp(certificate.metadataUri)} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-label-md text-primary hover:underline truncate max-w-[150px]"
                            >
                                {certificate.metadataUri?.split("ipfs://")[1]?.slice(0, 8)}...
                            </a>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-body-md text-on-surface-variant">Source Hash</span>
                            <span className="text-label-md text-on-surface truncate max-w-[150px]" title={report.sourceHash}>
                                {report.sourceHash.slice(0, 12)}...
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <a 
                    href={hashscanUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-surface font-bold text-label-md border border-outline-variant flex justify-center items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">explore</span>
                    View NFT on HashScan
                </a>
                
                <a 
                    href={ipfsToHttp(certificate.pdfUri)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 transition-colors text-background font-bold text-label-md flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(var(--primary),0.4)]"
                >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Download PDF Report
                </a>
            </div>
        </div>
    );
}
