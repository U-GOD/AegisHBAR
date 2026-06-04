import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { SSEStreamManager } from "./engine/stream";
import { runAuditPipeline } from "./engine/orchestrator";
import { ethers } from "ethers";
import { createX402Middleware } from "./middleware/x402";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// x402 payment gate: returns HTTP 402 for unpaid requests to protected routes
app.use(createX402Middleware());

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "OK", service: "AegisHBAR Backend" });
});

// In-memory store to hold active streams before they are picked up
const activeStreams = new Map<string, SSEStreamManager>();

app.post("/api/audit", async (req: Request, res: Response) => {
    try {
        const { sourceCode, categories, depositId, depositor } = req.body;

        if (!sourceCode || !categories || !depositId || !depositor) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // x402 middleware has already verified and settled the payment at this point.
        // The request only reaches this handler if the client paid successfully.

        // Create a detached stream manager. 
        // It won't actually send events until the client connects to /api/audit/stream/:depositId
        const streamManager = new SSEStreamManager(null as any);
        activeStreams.set(depositId, streamManager);

        // Attempt to extract the contract name
        const match = sourceCode.match(/contract\s+([A-Za-z0-9_]+)/);
        const contractName = match ? match[1] : "UnknownContract";

        // Start the background pipeline
        // We don't await this because we want to immediately return 200 OK so the frontend can connect to the stream
        runAuditPipeline(sourceCode, contractName, categories, depositor, depositId, streamManager)
            .finally(() => {
                setTimeout(() => activeStreams.delete(depositId), 60000); // cleanup
            });

        res.status(200).json({ success: true, depositId });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/audit/stream/:depositId", (req: Request, res: Response) => {
    const depositId = req.params.depositId as string;
    const streamManager = activeStreams.get(depositId);

    if (!streamManager) {
        return res.status(404).json({ error: "Stream not found or expired" });
    }

    // Attach the actual response object to the stream manager to begin pushing SSE events
    streamManager.attachResponse(res);
});

app.get("/api/certificate/:tokenId", async (req: Request, res: Response) => {
    try {
        const tokenId = req.params.tokenId as string;
        const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");
        const CERTIFICATE_ADDRESS = process.env.AUDIT_CERTIFICATE_ADDRESS || "";
        
        if (!CERTIFICATE_ADDRESS) {
            return res.status(500).json({ error: "Certificate address not configured" });
        }

        const ABI = [
            "function getCertificateMetadata(uint256 tokenId) external view returns (tuple(bytes32 auditId, bytes32 contractHash, string hcsTopicId, uint256 totalFindings, uint256 criticalCount, uint256 highCount, uint256 mediumCount, uint256 lowCount, uint256 informationalCount, uint256 auditTimestamp))",
            "function ownerOf(uint256 tokenId) external view returns (address)"
        ];

        const contract = new ethers.Contract(CERTIFICATE_ADDRESS, ABI, provider);
        
        // Ensure it exists first (ownerOf throws if it doesn't)
        const owner = await contract.ownerOf(tokenId);
        const metadata = await contract.getCertificateMetadata(tokenId);

        res.status(200).json({
            tokenId,
            owner,
            auditId: metadata.auditId,
            contractHash: metadata.contractHash,
            hcsTopicId: metadata.hcsTopicId,
            totalFindings: Number(metadata.totalFindings),
            criticalCount: Number(metadata.criticalCount),
            highCount: Number(metadata.highCount),
            mediumCount: Number(metadata.mediumCount),
            lowCount: Number(metadata.lowCount),
            informationalCount: Number(metadata.informationalCount),
            auditTimestamp: Number(metadata.auditTimestamp) * 1000 // Convert back to ms
        });

    } catch (error: any) {
        if (error.message.includes("ERC721NonexistentToken") || error.message.includes("invalid token ID")) {
            return res.status(404).json({ error: "Certificate not found or invalid" });
        }
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
