import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, workspaceMembers } from "@/db/schema";
import { requireWorkspaceAccess } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get("workspaceId");
        if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

        await requireWorkspaceAccess(workspaceId, "viewer");

        const membersList = await db
            .select({
                id: users.id,
                email: users.email,
                fullName: users.fullName,
                avatarUrl: users.avatarUrl,
                role: workspaceMembers.role,
                joinedAt: workspaceMembers.joinedAt,
            })
            .from(workspaceMembers)
            .innerJoin(users, eq(workspaceMembers.userId, users.id))
            .where(eq(workspaceMembers.workspaceId, workspaceId));

        return NextResponse.json({ members: membersList });
    } catch (error: any) {
        if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (error.message?.startsWith("Forbidden")) return NextResponse.json({ error: error.message }, { status: 403 });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
