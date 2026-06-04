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
    private res: Response | null;
    private closed: boolean;

    constructor(res: Response | null = null) {
        this.res = res;
        this.closed = false;
        
        if (res) {
            this.initHeaders();
        }
    }

    public attachResponse(res: Response) {
        this.res = res;
        this.initHeaders();
        
        this.res.on("close", () => {
            this.closed = true;
        });
    }

    private initHeaders() {
        if (!this.res) return;
        this.res.setHeader("Content-Type", "text/event-stream");
        this.res.setHeader("Cache-Control", "no-cache");
        this.res.setHeader("Connection", "keep-alive");
        this.res.flushHeaders();
    }

    send(event: StreamEvent): void {
        if (!this.res || this.closed) return;

        this.res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    complete(report: any): void {
        if (!this.res || this.closed) return;

        this.send({ phase: "complete", message: "Audit complete.", data: report } as StreamEvent);
        this.res.end();
        this.closed = true;
    }

    error(message: string): void {
        if (!this.res || this.closed) return;

        this.send({ phase: "error", message } as StreamEvent);
        this.res.end();
        this.closed = true;
    }

    isActive(): boolean {
        return !this.closed;
    }
}
