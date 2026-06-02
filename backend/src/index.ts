import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware configuration
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "OK", service: "AegisHBAR Backend" });
});

// Primary audit routing
app.post("/api/audit", (req: Request, res: Response) => {
    res.status(501).json({ error: "Not Implemented" });
});

// Certificate retrieval routing
app.get("/api/certificate/:auditId", (req: Request, res: Response) => {
    res.status(501).json({ error: "Not Implemented" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
