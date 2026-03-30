import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, workspaceMembers, workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dbUser = await db.query.users.findFirst({
            where: eq(users.clerkId, userId),
        });

        if (!dbUser) {
            return NextResponse.json({ workspaces: [] });
        }

        const userWorkspaces = await db
            .select({
                id: workspaces.id,
                name: workspaces.name,
                slug: workspaces.slug,
                planType: workspaces.planType,
                role: workspaceMembers.role,
            })
            .from(workspaceMembers)
            .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
            .where(eq(workspaceMembers.userId, dbUser.id));

        return NextResponse.json({ workspaces: userWorkspaces });
    } catch (error: any) {
        console.error("[GET /api/workspace]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
