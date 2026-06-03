import { Response } from "express";

type StreamPhase =
    | "parsing"
    | "analyzing"
    | "reentrancy"
    | "access-control"
    | "overflow"
    | "gas-optimization"
    | "logic"
    | "generating-fixes"
    | "logging-hcs"
    | "complete"
    | "error";

interface StreamEvent {
    phase: StreamPhase;
    message: string;
    data?: any;
}

/**
 * Manages a Server-Sent Events connection to stream real-time
 * audit progress updates to the client. Each phase of the analysis
 * pipeline emits an event so the frontend can render a live progress feed.
 */
export class SSEStreamManager {
    private res: Response;
    private closed: boolean;

    constructor(res: Response) {
        this.res = res;
        this.closed = false;

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        res.on("close", () => {
            this.closed = true;
        });
    }

    send(event: StreamEvent): void {
        if (this.closed) return;

        this.res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    complete(report: any): void {
        if (this.closed) return;

        this.send({ phase: "complete", message: "Audit complete.", data: report });
        this.res.end();
        this.closed = true;
    }

    error(message: string): void {
        if (this.closed) return;

        this.send({ phase: "error", message });
        this.res.end();
        this.closed = true;
    }

    isActive(): boolean {
        return !this.closed;
    }
}
