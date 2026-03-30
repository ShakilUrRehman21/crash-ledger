import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { incidents, incidentTimelineEvents } from "@/db/schema";
import { createIncidentSchema } from "@/lib/validators";
import { requireWorkspaceAccess } from "@/lib/auth";
import { eq, and, isNull, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get("workspaceId");
        if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

        await requireWorkspaceAccess(workspaceId, "viewer");

        const severity = searchParams.get("severity");
        const status = searchParams.get("status");
        const component = searchParams.get("component");

        const conditions = [
            eq(incidents.workspaceId, workspaceId),
            isNull(incidents.deletedAt),
        ];
        if (severity) conditions.push(eq(incidents.severity, severity as any));
        if (status) conditions.push(eq(incidents.status, status as any));
        if (component) conditions.push(eq(incidents.systemComponent, component));

        const rows = await db.query.incidents.findMany({
            where: and(...conditions),
            orderBy: [desc(incidents.createdAt)],
            with: { createdByUser: true },
        });

        return NextResponse.json({ incidents: rows });
    } catch (error: any) {
        if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (error.message?.startsWith("Forbidden")) return NextResponse.json({ error: error.message }, { status: 403 });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = createIncidentSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

        const { workspaceId, detectedAt, impactCost, ...rest } = parsed.data;
        const { user } = await requireWorkspaceAccess(workspaceId, "engineer");

        const [incident] = await db
            .insert(incidents)
            .values({
                workspaceId,
                ...rest,
                impactCost: impactCost?.toString(),
                detectedAt: detectedAt ? new Date(detectedAt) : new Date(),
                createdBy: user.id,
            })
            .returning();

        // Auto-add detected timeline event
        await db.insert(incidentTimelineEvents).values({
            incidentId: incident.id,
            eventType: "detected",
            description: "Incident detected and created",
            createdBy: user.id,
        });

        return NextResponse.json({ incident }, { status: 201 });
    } catch (error: any) {
        if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (error.message?.startsWith("Forbidden")) return NextResponse.json({ error: error.message }, { status: 403 });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
