import PDFDocument from "pdfkit";
import { AuditReport } from "./types";

/**
 * Generates a structured PDF report from an AuditReport object.
 * Returns a Buffer containing the raw PDF binary data.
 */
export async function generatePdfReport(report: AuditReport): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- Cover Page ---
            doc.fontSize(28).font('Helvetica-Bold').text("AegisHBAR Audit Report", { align: "center" });
            doc.moveDown();
            doc.fontSize(14).font('Helvetica').text(`Contract: ${report.contractName}`, { align: "center" });
            doc.text(`Timestamp: ${new Date(report.timestamp).toUTCString()}`, { align: "center" });
            doc.text(`Source Hash: ${report.sourceHash}`, { align: "center" });
            doc.moveDown(2);

            // --- Summary ---
            doc.fontSize(20).font('Helvetica-Bold').text("Executive Summary");
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica');
            doc.text(`Overall Risk Score: ${report.overallRiskScore} / 100`);
            doc.moveDown();
            
            doc.font('Helvetica-Bold').text("Findings Breakdown:");
            doc.font('Helvetica');
            doc.text(`Critical: ${report.summary.critical}`);
            doc.text(`High: ${report.summary.high}`);
            doc.text(`Medium: ${report.summary.medium}`);
            doc.text(`Low: ${report.summary.low}`);
            doc.text(`Informational: ${report.summary.informational}`);
            doc.moveDown(2);

            // --- Detailed Findings ---
            doc.fontSize(20).font('Helvetica-Bold').text("Detailed Findings");
            doc.moveDown(0.5);

            if (report.findings.length === 0) {
                doc.fontSize(12).font('Helvetica-Oblique').text("No vulnerabilities found.");
            } else {
                report.findings.forEach((finding, index) => {
                    doc.fontSize(14).font('Helvetica-Bold').text(`${index + 1}. [${finding.severity}] ${finding.title}`);
                    doc.fontSize(11).font('Helvetica').text(`Location: Line ${finding.location.line}`);
                    doc.moveDown(0.5);
                    doc.text(`Description: ${finding.description}`);
                    doc.moveDown(0.5);
                    doc.font('Helvetica-Oblique').text(`Recommendation: ${finding.recommendation}`);
                    doc.moveDown(1.5);
                });
            }

            // --- Footer ---
            doc.moveDown(2);
            doc.fontSize(10).font('Helvetica').text("Secured by Hedera Consensus Service", { align: "center" });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}
