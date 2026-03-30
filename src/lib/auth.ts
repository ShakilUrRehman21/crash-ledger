import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, workspaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type Role = "owner" | "admin" | "engineer" | "viewer";

const ROLE_HIERARCHY: Record<Role, number> = {
    owner: 4,
    admin: 3,
    engineer: 2,
    viewer: 1,
};

export function hasRole(userRole: Role, requiredRole: Role): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export async function getCurrentUser() {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkUser.id),
    });

    return dbUser ?? null;
}

export async function getWorkspaceMembership(workspaceId: string, userId: string) {
    const membership = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId)
        ),
        with: {
            workspace: true,
        },
    });
    return membership ?? null;
}

export async function requireWorkspaceAccess(workspaceId: string, minRole: Role = "viewer") {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const membership = await getWorkspaceMembership(workspaceId, user.id);
    if (!membership) throw new Error("Forbidden: Not a workspace member");

    if (!hasRole(membership.role as Role, minRole)) {
        throw new Error(`Forbidden: Requires ${minRole} role or higher`);
    }

    return { user, membership };
}
