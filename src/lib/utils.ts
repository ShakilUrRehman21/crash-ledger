import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatMinutes(minutes: number | null): string {
    if (minutes === null || minutes === undefined) return "N/A";
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatHours(hours: number | null): string {
    if (hours === null || hours === undefined) return "N/A";
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    const remainHours = Math.round(hours % 24);
    return remainHours > 0 ? `${days}d ${remainHours}h` : `${days}d`;
}

export function formatDate(date: string | Date | null): string {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatRelative(date: string | Date | null): string {
    if (!date) return "—";
    const now = Date.now();
    const then = new Date(date).getTime();
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

export const SEVERITY_CONFIG = {
    low: { label: "Low", color: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400" },
    medium: { label: "Medium", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
    high: { label: "High", color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
    critical: { label: "Critical", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
} as const;

export const STATUS_CONFIG = {
    open: { label: "Open", color: "bg-blue-50 text-blue-700 border-blue-200" },
    investigating: { label: "Investigating", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    resolved: { label: "Resolved", color: "bg-green-50 text-green-700 border-green-200" },
    archived: { label: "Archived", color: "bg-slate-50 text-slate-500 border-slate-200" },
} as const;

export const ROOT_CAUSE_LABELS: Record<string, string> = {
    human_error: "Human Error",
    infra: "Infrastructure",
    code_bug: "Code Bug",
    process_failure: "Process Failure",
    unknown: "Unknown",
};
