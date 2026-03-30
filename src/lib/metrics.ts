import { db } from "@/db";
import { incidents } from "@/db/schema";
import { eq, and, isNull, isNotNull, sql } from "drizzle-orm";

export interface DashboardMetrics {
    totalIncidents: number;
    openIncidents: number;
    investigatingIncidents: number;
    resolvedIncidents: number;
    criticalIncidents: number;
    mttr: number | null;        // minutes
    mtbf: number | null;        // hours
    operationalRiskIndex: number;
    criticalIncidentRatio: number;
    totalDowntimeMinutes: number;
}

/**
 * Mean Time to Recovery (MTTR)
 * Average time from detection to resolution in minutes
 */
export async function calculateMTTR(workspaceId: string): Promise<number | null> {
    const resolved = await db
        .select({
            detectedAt: incidents.detectedAt,
            resolvedAt: incidents.resolvedAt,
        })
        .from(incidents)
        .where(
            and(
                eq(incidents.workspaceId, workspaceId),
                isNotNull(incidents.resolvedAt),
                isNull(incidents.deletedAt)
            )
        );

    if (resolved.length === 0) return null;

    const totalMinutes = resolved.reduce((acc, inc) => {
        const diffMs = inc.resolvedAt!.getTime() - inc.detectedAt.getTime();
        return acc + diffMs / (1000 * 60);
    }, 0);

    return Math.max(1, Math.round(totalMinutes / resolved.length));
}

/**
 * Mean Time Between Failures (MTBF)
 * Average time between sequential incidents in hours
 */
export async function calculateMTBF(workspaceId: string): Promise<number | null> {
    const allIncidents = await db
        .select({ detectedAt: incidents.detectedAt })
        .from(incidents)
        .where(and(eq(incidents.workspaceId, workspaceId), isNull(incidents.deletedAt)))
        .orderBy(incidents.detectedAt);

    if (allIncidents.length < 2) return null;

    let totalGapHours = 0;
    for (let i = 1; i < allIncidents.length; i++) {
        const diffMs =
            allIncidents[i].detectedAt.getTime() - allIncidents[i - 1].detectedAt.getTime();
        totalGapHours += diffMs / (1000 * 60 * 60);
    }

    return Math.max(0.1, Math.round((totalGapHours / (allIncidents.length - 1)) * 10) / 10);
}

/**
 * Operational Risk Index (0–100)
 * Weighted formula based on severity, downtime, and recurrence
 */
export async function calculateOperationalRiskIndex(workspaceId: string): Promise<number> {
    const all = await db
        .select({
            severity: incidents.severity,
            downtimeMinutes: incidents.downtimeMinutes,
        })
        .from(incidents)
        .where(and(eq(incidents.workspaceId, workspaceId), isNull(incidents.deletedAt)));

    if (all.length === 0) return 0;

    // Severity weights
    const severityScore = all.reduce((acc, inc) => {
        if (inc.severity === "critical") return acc + 3;
        if (inc.severity === "high") return acc + 2;
        if (inc.severity === "medium") return acc + 1;
        return acc + 0.5;
    }, 0);

    const totalDowntime = all.reduce((acc, inc) => acc + (inc.downtimeMinutes ?? 0), 0);
    const downtimeFactor = Math.min(totalDowntime / 1440, 10); // cap at 10 days worth

    const rawScore = severityScore + downtimeFactor * 2;
    const maxPossible = all.length * 3 + 20; // max severity weight + max downtime factor
    const normalized = Math.min(Math.round((rawScore / maxPossible) * 100), 100);

    return normalized;
}

/**
 * Critical Incident Ratio
 * critical incidents / total incidents
 */
export async function calculateCriticalIncidentRatio(workspaceId: string): Promise<number> {
    const all = await db
        .select({ severity: incidents.severity })
        .from(incidents)
        .where(and(eq(incidents.workspaceId, workspaceId), isNull(incidents.deletedAt)));

    if (all.length === 0) return 0;

    const criticalCount = all.filter((i) => i.severity === "critical").length;
    return Math.round((criticalCount / all.length) * 100) / 100;
}

/**
 * Full dashboard metrics aggregation
 */
export async function getDashboardMetrics(workspaceId: string): Promise<DashboardMetrics> {
    const all = await db
        .select({
            status: incidents.status,
            severity: incidents.severity,
            downtimeMinutes: incidents.downtimeMinutes,
        })
        .from(incidents)
        .where(and(eq(incidents.workspaceId, workspaceId), isNull(incidents.deletedAt)));

    const totalIncidents = all.length;
    const openIncidents = all.filter((i) => i.status === "open").length;
    const investigatingIncidents = all.filter((i) => i.status === "investigating").length;
    const resolvedIncidents = all.filter((i) => i.status === "resolved" || i.status === "archived").length;
    const criticalIncidents = all.filter((i) => i.severity === "critical").length;
    const totalDowntimeMinutes = all.reduce((acc, i) => acc + (i.downtimeMinutes ?? 0), 0);

    const [mttr, mtbf, operationalRiskIndex, criticalIncidentRatio] = await Promise.all([
        calculateMTTR(workspaceId),
        calculateMTBF(workspaceId),
        calculateOperationalRiskIndex(workspaceId),
        calculateCriticalIncidentRatio(workspaceId),
    ]);

    return {
        totalIncidents,
        openIncidents,
        investigatingIncidents,
        resolvedIncidents,
        criticalIncidents,
        mttr,
        mtbf,
        operationalRiskIndex,
        criticalIncidentRatio,
        totalDowntimeMinutes,
    };
}
