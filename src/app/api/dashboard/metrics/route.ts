import { NextRequest, NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/metrics";
import { requireWorkspaceAccess } from "@/lib/auth";
import { db } from "@/db";
import { incidents } from "@/db/schema";
import { eq, and, isNull, desc, gte } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get("workspaceId");
        if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

        await requireWorkspaceAccess(workspaceId, "viewer");

        const metrics = await getDashboardMetrics(workspaceId);

        // Last 30 days incident trend (by day)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentIncidents = await db.query.incidents.findMany({
            where: and(
                eq(incidents.workspaceId, workspaceId),
                isNull(incidents.deletedAt),
                gte(incidents.detectedAt, thirtyDaysAgo)
            ),
            columns: { detectedAt: true, severity: true, status: true, downtimeMinutes: true },
            orderBy: [desc(incidents.detectedAt)],
        });

        // Group by day for trend chart
        const trendMap = new Map<string, number>();
        recentIncidents.forEach((inc) => {
            const day = inc.detectedAt.toISOString().split("T")[0];
            trendMap.set(day, (trendMap.get(day) ?? 0) + 1);
        });
        const trendData = Array.from(trendMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Severity distribution
        const severityDist = {
            low: recentIncidents.filter((i) => i.severity === "low").length,
            medium: recentIncidents.filter((i) => i.severity === "medium").length,
            high: recentIncidents.filter((i) => i.severity === "high").length,
            critical: recentIncidents.filter((i) => i.severity === "critical").length,
        };

        return NextResponse.json({ metrics, trendData, severityDist });
    } catch (error: any) {
        if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (error.message?.startsWith("Forbidden")) return NextResponse.json({ error: error.message }, { status: 403 });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
