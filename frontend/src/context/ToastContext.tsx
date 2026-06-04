"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: number;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (type: ToastType, title: string, message?: string) => void;
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType>({
    toasts: [],
    addToast: () => {},
    removeToast: () => {},
});

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, type, title, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const iconMap: Record<ToastType, string> = {
        success: "check_circle",
        error: "error",
        info: "info",
        warning: "warning",
    };

    const colorMap: Record<ToastType, string> = {
        success: "text-primary border-primary/30 bg-primary/10",
        error: "text-error border-error/30 bg-error/10",
        info: "text-secondary border-secondary/30 bg-secondary/10",
        warning: "text-tertiary border-tertiary/30 bg-tertiary/10",
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-xl border backdrop-blur-md shadow-lg max-w-sm animate-slide-in-right ${colorMap[toast.type]}`}
                    >
                        <span className="material-symbols-outlined text-[22px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {iconMap[toast.type]}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-label-md font-bold text-on-surface">{toast.title}</p>
                            {toast.message && (
                                <p className="text-body-sm text-on-surface-variant mt-0.5">{toast.message}</p>
                            )}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
