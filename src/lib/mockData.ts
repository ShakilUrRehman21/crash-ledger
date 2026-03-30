// Shared in-memory store — single source of truth for all mock data
// This ensures Dashboard, Incidents List, Incident Detail, Action Items, and Analytics all stay in sync.

export type Severity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "open" | "investigating" | "resolved" | "archived";
export type ActionStatus = "todo" | "in_progress" | "done";
export type EventType = "detected" | "acknowledged" | "mitigated" | "resolved" | "note";
export type Priority = "critical" | "high" | "medium" | "low";

export interface TimelineEvent {
    id: string;
    eventType: EventType;
    description: string;
    createdAt: string;
    user: string;
}

export interface ActionItem {
    id: string;
    incidentId: string;
    title: string;
    status: ActionStatus;
    priority: Priority;
    assignedTo: string | null;
    dueDate: string | null;
}

export interface RCA {
    rootCauseCategory: string;
    detailedAnalysis: string;
    preventionSteps: string;
    reviewedBy: string;
    reviewedAt: string;
}

export interface Incident {
    id: string;
    title: string;
    description: string;
    severity: Severity;
    status: IncidentStatus;
    component: string;
    environment: string;
    detectedAt: string;
    resolvedAt: string | null;
    downtimeMinutes: number;
    impactCost: number | null;
    createdBy: string;
    timeline: TimelineEvent[];
    rca: RCA | null;
}

// ─── Base Incidents ─────────────────────────────────────────────────────────
export const baseIncidents: Incident[] = [
    {
        id: "1",
        title: "Database connection pool exhausted",
        description: "The PostgreSQL connection pool reached its maximum limit of 100 connections causing all new requests to fail with a connection timeout error. Impacted all user-facing APIs that required database access.",
        severity: "critical",
        status: "open",
        component: "Database",
        environment: "production",
        detectedAt: "2024-02-23T22:00:00Z",
        resolvedAt: null,
        downtimeMinutes: 45,
        impactCost: 4800,
        createdBy: "Alex Chen",
        timeline: [
            { id: "t1", eventType: "detected", description: "Alert fired: pg_connection_pool > 95%", createdAt: "2024-02-23T22:00:00Z", user: "System" },
            { id: "t2", eventType: "acknowledged", description: "On-call engineer acknowledged the alert", createdAt: "2024-02-23T22:08:00Z", user: "Alex Chen" },
            { id: "t3", eventType: "note", description: "All API endpoints returning 503. Engineers are scaling connections.", createdAt: "2024-02-23T22:15:00Z", user: "Maria S." },
        ],
        rca: null,
    },
    {
        id: "2",
        title: "API latency spike on /users endpoint",
        description: "P99 latency on the /users endpoint jumped from 120ms to 4.5s causing significant degradation for all user-facing features. Root cause traced to a missing database index on the users.email column.",
        severity: "high",
        status: "investigating",
        component: "API Gateway",
        environment: "production",
        detectedAt: "2024-02-23T19:00:00Z",
        resolvedAt: null,
        downtimeMinutes: 15,
        impactCost: 1200,
        createdBy: "Maria Santos",
        timeline: [
            { id: "t1", eventType: "detected", description: "Datadog alert: P99 latency > 2s on /users", createdAt: "2024-02-23T19:00:00Z", user: "System" },
            { id: "t2", eventType: "acknowledged", description: "Investigating slow query logs", createdAt: "2024-02-23T19:14:00Z", user: "Maria Santos" },
        ],
        rca: null,
    },
    {
        id: "3",
        title: "Worker queue processing delayed",
        description: "Background job workers fell behind by 3+ hours due to a memory leak in the image processor service. Queue depth grew to 85,000 pending jobs.",
        severity: "medium",
        status: "resolved",
        component: "Worker Queue",
        environment: "production",
        detectedAt: "2024-02-22T10:00:00Z",
        resolvedAt: "2024-02-22T16:45:00Z",
        downtimeMinutes: 120,
        impactCost: 0,
        createdBy: "Sam Lee",
        timeline: [
            { id: "t1", eventType: "detected", description: "Queue depth alert: > 50,000 pending jobs", createdAt: "2024-02-22T10:00:00Z", user: "System" },
            { id: "t2", eventType: "acknowledged", description: "Started investigation", createdAt: "2024-02-22T10:22:00Z", user: "Sam Lee" },
            { id: "t3", eventType: "mitigated", description: "Restarted workers, cleared stuck jobs", createdAt: "2024-02-22T13:30:00Z", user: "Sam Lee" },
            { id: "t4", eventType: "resolved", description: "Queue depth back to normal. Memory leak patched.", createdAt: "2024-02-22T16:45:00Z", user: "Sam Lee" },
        ],
        rca: {
            rootCauseCategory: "code_bug",
            detailedAnalysis: "A memory leak in the image-resize library caused worker processes to consume up to 4GB RAM before crashing. The OS then restarted them, causing queue processing gaps.",
            preventionSteps: "1. Add memory limits per worker process.\n2. Implement queue depth alerting at 10,000 jobs.\n3. Add integration test for image processing job completion.",
            reviewedBy: "Alex Chen",
            reviewedAt: "2024-02-23T09:00:00Z",
        },
    },
];

// ─── Base Action Items ──────────────────────────────────────────────────────
export const baseActionItems: ActionItem[] = [
    { id: "a1", incidentId: "1", title: "Add pg_connection_pool alert at 80%", status: "done", priority: "high", assignedTo: "Alex Chen", dueDate: "2024-02-25T00:00:00Z" },
    { id: "a2", incidentId: "1", title: "Implement connection leak detection in CI", status: "in_progress", priority: "high", assignedTo: "Maria Santos", dueDate: "2024-02-28T00:00:00Z" },
    { id: "a3", incidentId: "1", title: "Deploy pgBouncer connection pooler", status: "todo", priority: "critical", assignedTo: null, dueDate: "2024-03-05T00:00:00Z" },
    { id: "a4", incidentId: "2", title: "Add rate limiting to /users endpoint", status: "todo", priority: "high", assignedTo: "Sam Lee", dueDate: "2024-02-20T00:00:00Z" },
    { id: "a5", incidentId: "2", title: "Write runbook for auth service failures", status: "in_progress", priority: "medium", assignedTo: "Alex Chen", dueDate: "2024-03-01T00:00:00Z" },
];

export const incidents = baseIncidents;
export const actionItems = baseActionItems;

// ─── Helpers (Client-side safe with persistence fallback) ────────────────────
export function getAllIncidents(): Incident[] {
    if (typeof window === "undefined") return [];
    try {
        const saved = localStorage.getItem("cl_incidents");
        if (saved) return JSON.parse(saved);

        // If cl_incidents doesn't exist yet but we have new incidents saved from before
        const oldNewSaved = localStorage.getItem("cl_new_incidents");
        if (oldNewSaved) {
            const merged = [...JSON.parse(oldNewSaved)];
            localStorage.setItem("cl_incidents", JSON.stringify(merged));
            return merged;
        }

        // Return empty array for new workspace initialization
        return [];
    } catch { /* ignore */ }
    return [];
}

export function saveAllIncidents(data: Incident[]) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem("cl_incidents", JSON.stringify(data));
    } catch { /* ignore */ }
}

export function getIncidentById(id: string): Incident | undefined {
    return getAllIncidents().find((i) => i.id === id);
}

export function saveIncident(updated: Incident) {
    const all = getAllIncidents();
    const idx = all.findIndex(i => i.id === updated.id);
    if (idx > -1) {
        all[idx] = updated;
    } else {
        all.unshift(updated);
    }
    saveAllIncidents(all);
}

export function getAllActionItems(): ActionItem[] {
    if (typeof window === "undefined") return [];
    try {
        const saved = localStorage.getItem("cl_actions");
        if (saved) return JSON.parse(saved);

        return [];
    } catch { /* ignore */ }
    return [];
}

export function saveAllActionItems(data: ActionItem[]) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem("cl_actions", JSON.stringify(data));
    } catch { /* ignore */ }
}

export function getActionItemsByIncident(incidentId: string): ActionItem[] {
    return getAllActionItems().filter((a) => a.incidentId === incidentId);
}

export function saveActionItem(updated: ActionItem) {
    const all = getAllActionItems();
    const idx = all.findIndex(a => a.id === updated.id);
    if (idx > -1) {
        all[idx] = updated;
    } else {
        all.unshift(updated);
    }
    saveAllActionItems(all);
}

// Stats recalculated based on potentially persisted data
export function getDashboardMetrics(dataParam?: Incident[]) {
    const data = dataParam || getAllIncidents();
    const total = data.length;
    const open = data.filter((i) => i.status === "open").length;
    const investigating = data.filter((i) => i.status === "investigating").length;
    const critical = data.filter((i) => i.severity === "critical").length;
    const resolved = data.filter((i) => i.status === "resolved");
    const mttrMinutes = resolved.length > 0
        ? resolved.reduce((sum, i) => {
            if (!i.resolvedAt) return sum;
            return sum + (new Date(i.resolvedAt).getTime() - new Date(i.detectedAt).getTime()) / 60000;
        }, 0) / resolved.length
        : 0;
    const totalDowntime = data.reduce((sum, i) => sum + i.downtimeMinutes, 0);

    // MTBF: avg time between database entries
    const sorted = [...data].sort((a, b) => new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime());
    let mtbfHours = 0;
    if (sorted.length > 1) {
        const gaps = sorted.slice(1).map((inc, i) =>
            (new Date(inc.detectedAt).getTime() - new Date(sorted[i].detectedAt).getTime()) / 3600000
        );
        mtbfHours = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    }

    // Risk Index: critical*3 + high*2 + medium*1, normalized to 100
    const highSev = data.filter((i) => i.severity === "high").length;
    const medSev = data.filter((i) => i.severity === "medium").length;
    const raw = critical * 3 + highSev * 2 + medSev * 1;
    const maxRaw = total * 3;
    const riskIndex = maxRaw > 0 ? Math.round((raw / maxRaw) * 100) : 0;

    return { total, open, investigating, critical, mttrMinutes, mtbfHours, totalDowntime, riskIndex, criticalRatio: total > 0 ? critical / total : 0 };
}
