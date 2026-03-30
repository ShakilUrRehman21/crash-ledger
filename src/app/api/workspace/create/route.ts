import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, workspaces, workspaceMembers } from "@/db/schema";
import { createWorkspaceSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = createWorkspaceSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
        }
        const { name, slug } = parsed.data;

        // Check slug uniqueness
        const existing = await db.query.workspaces.findFirst({
            where: eq(workspaces.slug, slug),
        });
        if (existing) {
            return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
        }

        // Upsert user
        let dbUser = await db.query.users.findFirst({
            where: eq(users.clerkId, userId),
        });

        if (!dbUser) {
            const client = await clerkClient();
            const clerkUser = await client.users.getUser(userId);
            const email = clerkUser.emailAddresses?.[0]?.emailAddress || `${clerkUser.id}@placeholder.com`;
            const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() || "Unknown User";

            const [newUser] = await db
                .insert(users)
                .values({
                    clerkId: clerkUser.id,
                    email,
                    fullName,
                    avatarUrl: clerkUser.hasImage ? clerkUser.imageUrl : null,
                })
                .returning();
            dbUser = newUser;
        }

        // Create workspace
        const [workspace] = await db.insert(workspaces).values({ name, slug }).returning();

        // Add creator as owner
        await db.insert(workspaceMembers).values({
            workspaceId: workspace.id,
            userId: dbUser.id,
            role: "owner",
        });

        return NextResponse.json({ workspace }, { status: 201 });
    } catch (error: any) {
        console.error("[POST /api/workspace/create] FAIL DETAILS:");
        console.error(error?.message);
        console.error(error?.stack);
        if (error?.cause) console.error("CAUSE:", error.cause);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
