import { relations } from "drizzle-orm";
import {
    workspaces, users, workspaceMembers, incidents, incidentTimelineEvents,
    rootCauseAnalysis, actionItems, recurringPatterns, riskMetricsSnapshot, notifications
} from "./schema";

export const workspacesRelations = relations(workspaces, ({ many }) => ({
    members: many(workspaceMembers),
    incidents: many(incidents),
    recurringPatterns: many(recurringPatterns),
    riskSnapshots: many(riskMetricsSnapshot),
    notifications: many(notifications),
}));

export const usersRelations = relations(users, ({ many }) => ({
    workspaceMemberships: many(workspaceMembers),
    createdIncidents: many(incidents, { relationName: "createdIncidents" }),
    timelineEvents: many(incidentTimelineEvents),
    reviewedRCAs: many(rootCauseAnalysis),
    assignedActionItems: many(actionItems),
    notifications: many(notifications),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
    workspace: one(workspaces, { fields: [workspaceMembers.workspaceId], references: [workspaces.id] }),
    user: one(users, { fields: [workspaceMembers.userId], references: [users.id] }),
}));

export const incidentsRelations = relations(incidents, ({ one, many }) => ({
    workspace: one(workspaces, { fields: [incidents.workspaceId], references: [workspaces.id] }),
    createdByUser: one(users, { fields: [incidents.createdBy], references: [users.id], relationName: "createdIncidents" }),
    timelineEvents: many(incidentTimelineEvents),
    rca: one(rootCauseAnalysis),
    actionItemsList: many(actionItems),
}));

export const incidentTimelineEventsRelations = relations(incidentTimelineEvents, ({ one }) => ({
    incident: one(incidents, { fields: [incidentTimelineEvents.incidentId], references: [incidents.id] }),
    createdByUser: one(users, { fields: [incidentTimelineEvents.createdBy], references: [users.id] }),
}));

export const rootCauseAnalysisRelations = relations(rootCauseAnalysis, ({ one }) => ({
    incident: one(incidents, { fields: [rootCauseAnalysis.incidentId], references: [incidents.id] }),
    reviewer: one(users, { fields: [rootCauseAnalysis.reviewedBy], references: [users.id] }),
}));

export const actionItemsRelations = relations(actionItems, ({ one }) => ({
    incident: one(incidents, { fields: [actionItems.incidentId], references: [incidents.id] }),
    assignedUser: one(users, { fields: [actionItems.assignedTo], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    workspace: one(workspaces, { fields: [notifications.workspaceId], references: [workspaces.id] }),
    user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
