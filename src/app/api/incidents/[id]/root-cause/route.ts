import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rootCauseAnalysis, incidents } from "@/db/schema";
import { createRCASchema } from "@/lib/validators";
import { requireWorkspaceAccess } from "@/lib/auth";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const workspaceId = body.workspaceId;
        if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

        const parsed = createRCASchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

        const { user } = await requireWorkspaceAccess(workspaceId, "engineer");

        const incident = await db.query.incidents.findFirst({
            where: and(eq(incidents.id, id), eq(incidents.workspaceId, workspaceId), isNull(incidents.deletedAt)),
        });
        if (!incident) return NextResponse.json({ error: "Incident not found" }, { status: 404 });
        if (incident.status !== "resolved" && incident.status !== "archived") {
            return NextResponse.json({ error: "RCA can only be submitted for resolved or archived incidents" }, { status: 422 });
        }

        // Upsert RCA (one per incident)
        const existing = await db.query.rootCauseAnalysis.findFirst({
            where: eq(rootCauseAnalysis.incidentId, id),
        });

        let rca;
        if (existing) {
            const [updated] = await db
                .update(rootCauseAnalysis)
                .set({ ...parsed.data, reviewedBy: user.id, reviewedAt: new Date(), updatedAt: new Date() })
                .where(eq(rootCauseAnalysis.id, existing.id))
                .returning();
            rca = updated;
        } else {
            const [created] = await db
                .insert(rootCauseAnalysis)
                .values({ incidentId: id, ...parsed.data, reviewedBy: user.id, reviewedAt: new Date() })
                .returning();
            rca = created;
        }

        return NextResponse.json({ rca }, { status: 201 });
    } catch (error: any) {
        if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (error.message?.startsWith("Forbidden")) return NextResponse.json({ error: error.message }, { status: 403 });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get("workspaceId");
        if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

        await requireWorkspaceAccess(workspaceId, "viewer");

        const rca = await db.query.rootCauseAnalysis.findFirst({
            where: eq(rootCauseAnalysis.incidentId, id),
        });

        return NextResponse.json({ rca: rca ?? null });
    } catch (error: any) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
