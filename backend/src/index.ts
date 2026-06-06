import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { SSEStreamManager } from "./engine/stream";
import { runAuditPipeline } from "./engine/orchestrator";
import { ethers } from "ethers";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Manual CORS middleware - runs before EVERYTHING, sets headers on ALL responses
app.use((req: Request, res: Response, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-402-Payment, X-Requested-With, Accept");
    res.setHeader("Access-Control-Expose-Headers", "WWW-Authenticate, X-402-PaymentRequired");

    // Short-circuit preflight requests immediately
    if (req.method === "OPTIONS") {
        res.status(204).end();
        return;
    }
    next();
});

app.use(express.json());

// x402 payment verification is handled on the frontend via MetaMask.
// The backend trusts the frontend payment flow for the hackathon demo.

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

        // Mock x402 Payment Gate for Hackathon Demo
        // If the frontend hasn't attached a payment proof header yet, return 402.
        // This triggers the @x402/client on the frontend to open MetaMask and pay.
        if (!req.headers['x-402-payment']) {
            const payTo = process.env.HEDERA_ACCOUNT_ID || "0x0000000000000000000000000000000000000000";
            res.setHeader('WWW-Authenticate', `x402 scheme="exact", network="eip155:296", asset="0x0000000000000000000000000000000000000000", payTo="${payTo}", price="0.5"`);
            return res.status(402).json({ error: "Payment required" });
        }

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

const serverPort = Number(process.env.PORT) || 8080;

app.listen(serverPort, "0.0.0.0", () => {
    console.log(`[AegisHBAR] Server running securely on 0.0.0.0:${serverPort}`);
});

process.on("uncaughtException", (err) => {
    console.error("CRITICAL CRASH (uncaughtException):", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("CRITICAL CRASH (unhandledRejection):", reason);
});
