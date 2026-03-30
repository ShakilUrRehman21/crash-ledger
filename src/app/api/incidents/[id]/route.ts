import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { incidents, incidentTimelineEvents, rootCauseAnalysis, actionItems, workspaceMembers, users } from "@/db/schema";
import { updateIncidentSchema, resolveIncidentSchema, createRCASchema, createTimelineEventSchema } from "@/lib/validators";
import { requireWorkspaceAccess } from "@/lib/auth";
import { eq, and, isNull } from "drizzle-orm";

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
    open: ["investigating", "resolved"],
    investigating: ["resolved"],
    resolved: ["archived"],
    archived: [],
};

// GET /api/incidents/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get("workspaceId");
        if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

        await requireWorkspaceAccess(workspaceId, "viewer");

        const incident = await db.query.incidents.findFirst({
            where: and(eq(incidents.id, id), eq(incidents.workspaceId, workspaceId), isNull(incidents.deletedAt)),
            with: {
                timelineEvents: { orderBy: (t: any, { asc }: any) => [asc(t.createdAt)] },
                rca: true,
                actionItemsList: {
                    with: { assignedUser: true },
                },
                createdByUser: true,
            },
        });

        if (!incident) return NextResponse.json({ error: "Incident not found" }, { status: 404 });

        return NextResponse.json({ incident });
    } catch (error: any) {
        if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (error.message?.startsWith("Forbidden")) return NextResponse.json({ error: error.message }, { status: 403 });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/incidents/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const workspaceId = body.workspaceId;
        if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

        const parsed = updateIncidentSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

        const { user } = await requireWorkspaceAccess(workspaceId, "engineer");

        // Find existing incident
        const existing = await db.query.incidents.findFirst({
            where: and(eq(incidents.id, id), eq(incidents.workspaceId, workspaceId), isNull(incidents.deletedAt)),
        });
        if (!existing) return NextResponse.json({ error: "Incident not found" }, { status: 404 });

        // Validate status transition
        if (parsed.data.status && parsed.data.status !== existing.status) {
            const allowed = VALID_TRANSITIONS[existing.status] ?? [];
            if (!allowed.includes(parsed.data.status)) {
                return NextResponse.json(
                    { error: `Invalid transition: ${existing.status} → ${parsed.data.status}` },
                    { status: 422 }
                );
            }
        }

        const { impactCost, ...updateFields } = parsed.data;

        const isResolving = parsed.data.status === "resolved" && existing.status !== "resolved";

        const [updated] = await db
            .update(incidents)
            .set({
                ...updateFields,
                ...(impactCost !== undefined ? { impactCost: impactCost.toString() } : {}),
                ...(isResolving ? { resolvedAt: new Date() } : {}),
                updatedAt: new Date()
            })
            .where(eq(incidents.id, id))
            .returning();

        // Add timeline event for status change
        if (parsed.data.status && parsed.data.status !== existing.status) {
            await db.insert(incidentTimelineEvents).values({
                incidentId: id,
                eventType: parsed.data.status as any,
                description: `Status changed to ${parsed.data.status}`,
                createdBy: user.id,
            });
        }

        return NextResponse.json({ incident: updated });
    } catch (error: any) {
        if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (error.message?.startsWith("Forbidden")) return NextResponse.json({ error: error.message }, { status: 403 });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/incidents/[id] (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get("workspaceId");
        if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

        await requireWorkspaceAccess(workspaceId, "admin");

        await db.update(incidents).set({ deletedAt: new Date() }).where(
            and(eq(incidents.id, id), eq(incidents.workspaceId, workspaceId))
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (error.message?.startsWith("Forbidden")) return NextResponse.json({ error: error.message }, { status: 403 });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
