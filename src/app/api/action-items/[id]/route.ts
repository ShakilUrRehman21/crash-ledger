import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { actionItems } from "@/db/schema";
import { updateActionItemSchema } from "@/lib/validators";
import { requireWorkspaceAccess } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const workspaceId = body.workspaceId;
        if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

        const parsed = updateActionItemSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

        await requireWorkspaceAccess(workspaceId, "engineer");

        const { dueDate, ...rest } = parsed.data;
        const [updated] = await db
            .update(actionItems)
            .set({
                ...rest,
                ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
                updatedAt: new Date(),
            })
            .where(eq(actionItems.id, id))
            .returning();

        if (!updated) return NextResponse.json({ error: "Action item not found" }, { status: 404 });

        return NextResponse.json({ actionItem: updated });
    } catch (error: any) {
        if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (error.message?.startsWith("Forbidden")) return NextResponse.json({ error: error.message }, { status: 403 });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
