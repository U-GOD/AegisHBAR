import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { SSEStreamManager } from "./engine/stream";
import { runAuditPipeline } from "./engine/orchestrator";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

        // We mock x402 payment verification here for brevity.
        // In production, we'd verify the depositId in the Escrow contract via ethers.js

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
    const { depositId } = req.params;
    const streamManager = activeStreams.get(depositId);

    if (!streamManager) {
        return res.status(404).json({ error: "Stream not found or expired" });
    }

    // Attach the actual response object to the stream manager to begin pushing SSE events
    streamManager.attachResponse(res);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
