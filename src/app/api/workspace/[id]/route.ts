import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireWorkspaceAccess } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await requireWorkspaceAccess(id, "owner");

        await db
            .delete(workspaces)
            .where(eq(workspaces.id, id));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (error.message?.startsWith("Forbidden")) return NextResponse.json({ error: error.message }, { status: 403 });

        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
