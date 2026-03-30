import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { incidentTimelineEvents, incidents } from "@/db/schema";
import { createTimelineEventSchema } from "@/lib/validators";
import { requireWorkspaceAccess } from "@/lib/auth";
import { eq, and, isNull, asc } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get("workspaceId");
        if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

        await requireWorkspaceAccess(workspaceId, "viewer");

        const events = await db.query.incidentTimelineEvents.findMany({
            where: eq(incidentTimelineEvents.incidentId, id),
            orderBy: [asc(incidentTimelineEvents.createdAt)],
            with: { createdByUser: true },
        });

        return NextResponse.json({ events });
    } catch (error: any) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const workspaceId = body.workspaceId;
        if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

        const parsed = createTimelineEventSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

        const { user } = await requireWorkspaceAccess(workspaceId, "engineer");

        const [event] = await db
            .insert(incidentTimelineEvents)
            .values({ incidentId: id, ...parsed.data, createdBy: user.id })
            .returning();

        return NextResponse.json({ event }, { status: 201 });
    } catch (error: any) {
        if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (error.message?.startsWith("Forbidden")) return NextResponse.json({ error: error.message }, { status: 403 });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
