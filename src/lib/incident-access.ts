import { db } from "@/db";
import { actionItems, incidents } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

/** True when the incident exists, is not deleted, and belongs to the workspace. */
export async function incidentInWorkspace(incidentId: string, workspaceId: string): Promise<boolean> {
    const row = await db.query.incidents.findFirst({
        columns: { id: true },
        where: and(eq(incidents.id, incidentId), eq(incidents.workspaceId, workspaceId), isNull(incidents.deletedAt)),
    });
    return Boolean(row);
}

/** True when the action item's parent incident belongs to the workspace. */
export async function actionItemInWorkspace(itemId: string, workspaceId: string): Promise<boolean> {
    const item = await db.query.actionItems.findFirst({
        columns: { incidentId: true },
        where: eq(actionItems.id, itemId),
    });
    if (!item?.incidentId) return false;
    return incidentInWorkspace(item.incidentId, workspaceId);
}
