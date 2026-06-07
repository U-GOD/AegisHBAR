"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type StreamPhase =
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

export interface StreamEvent {
    phase: StreamPhase;
    message: string;
    data?: any;
}

interface UseAuditStreamReturn {
    events: StreamEvent[];
    currentPhase: StreamPhase | null;
    report: any | null;
    certificate: any | null;
    isStreaming: boolean;
    error: string | null;
    startStream: (url: string) => void;
    reset: () => void;
}

/**
 * React hook that subscribes to the backend SSE endpoint
 * and accumulates real-time audit progress events.
 */
export function useAuditStream(): UseAuditStreamReturn {
    const [events, setEvents] = useState<StreamEvent[]>([]);
    const [currentPhase, setCurrentPhase] = useState<StreamPhase | null>(null);
    const [report, setReport] = useState<any | null>(null);
    const [certificate, setCertificate] = useState<any | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sourceRef = useRef<EventSource | null>(null);

    const cleanup = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.close();
            sourceRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        cleanup();
        setEvents([]);
        setCurrentPhase(null);
        setReport(null);
        setCertificate(null);
        setIsStreaming(false);
        setError(null);
    }, [cleanup]);

    const startStream = useCallback((url: string) => {
        cleanup();
        setEvents([]);
        setCurrentPhase(null);
        setReport(null);
        setCertificate(null);
        setError(null);
        setIsStreaming(true);

        const source = new EventSource(url);
        sourceRef.current = source;

        source.onmessage = (event) => {
            try {
                const parsed: StreamEvent = JSON.parse(event.data);

                setEvents(prev => [...prev, parsed]);
                setCurrentPhase(parsed.phase);

                if (parsed.phase === "complete") {
                    setReport(parsed.data?.report || parsed.data);
                    setCertificate(parsed.data?.certificate || null);
                    setIsStreaming(false);
                    source.close();
                }

                if (parsed.phase === "error") {
                    setError(parsed.message);
                    setIsStreaming(false);
                    source.close();
                }
            } catch (err) {
                console.error("[useAuditStream] Failed to parse event:", err);
            }
        };

        source.onerror = () => {
            setError("Connection to audit stream lost.");
            setIsStreaming(false);
            source.close();
        };
    }, [cleanup]);

    // Cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return {
        events,
        currentPhase,
        report,
        certificate,
        isStreaming,
        error,
        startStream,
        reset,
    };
}
