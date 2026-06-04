"use client";

import { CertificateVerifier } from "../../components/CertificateVerifier";

export default function ReportsPage() {
    return (
        <main className="flex-1 flex flex-col font-sans">
            <div className="container max-w-6xl mx-auto px-4 py-8 mt-8">
                <div className="mb-8">
                    <h1 className="text-headline-lg font-bold text-on-surface mb-2">Audit Reports</h1>
                    <p className="text-body-md text-on-surface-variant">
                        Verify any AegisHBAR audit certificate by entering its NFT Token ID below. The data is fetched directly from the Hedera blockchain.
                    </p>
                </div>
                <CertificateVerifier />
            </div>
        </main>
    );
}
