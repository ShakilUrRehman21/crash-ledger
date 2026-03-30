import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { actionItems } from "@/db/schema";
import { createActionItemSchema, updateActionItemSchema } from "@/lib/validators";
import { requireWorkspaceAccess } from "@/lib/auth";
import { eq, and, isNull } from "drizzle-orm";

// POST /api/action-items
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = createActionItemSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

        const { workspaceId, incidentId, dueDate, ...rest } = parsed.data;
        await requireWorkspaceAccess(workspaceId, "engineer");

        const [item] = await db
            .insert(actionItems)
            .values({
                incidentId,
                ...rest,
                dueDate: dueDate ? new Date(dueDate) : undefined,
            })
            .returning();

        return NextResponse.json({ actionItem: item }, { status: 201 });
    } catch (error: any) {
        if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (error.message?.startsWith("Forbidden")) return NextResponse.json({ error: error.message }, { status: 403 });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET /api/action-items?workspaceId=...
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get("workspaceId");
        if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

        await requireWorkspaceAccess(workspaceId, "viewer");

        const items = await db.query.actionItems.findMany({
            with: {
                incident: { columns: { id: true, title: true, workspaceId: true } },
                assignedUser: true,
            },
        });

        // Filter by workspace through the joined incident
        const filtered = items.filter((i) => i.incident?.workspaceId === workspaceId);

        return NextResponse.json({ actionItems: filtered });
    } catch (error: any) {
        if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (error.message?.startsWith("Forbidden")) return NextResponse.json({ error: error.message }, { status: 403 });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
