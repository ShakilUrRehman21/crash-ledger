import { pgTable, uuid, text, timestamp, varchar, integer, numeric, boolean, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";

// ─── Enums ──────────────────────────────────────────────────────────────────

export const planTypeEnum = pgEnum("plan_type", ["free", "pro"]);
export const roleEnum = pgEnum("role", ["owner", "admin", "engineer", "viewer"]);
export const severityEnum = pgEnum("severity", ["low", "medium", "high", "critical"]);
export const statusEnum = pgEnum("status", ["open", "investigating", "resolved", "archived"]);
export const environmentEnum = pgEnum("environment", ["production", "staging", "dev"]);
export const eventTypeEnum = pgEnum("event_type", ["detected", "acknowledged", "mitigated", "resolved", "note"]);
export const rootCauseCategoryEnum = pgEnum("root_cause_category", [
    "human_error",
    "infra",
    "code_bug",
    "process_failure",
    "unknown",
]);
export const actionItemStatusEnum = pgEnum("action_item_status", ["todo", "in_progress", "done"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "critical"]);
export const notificationTypeEnum = pgEnum("notification_type", [
    "new_incident",
    "assigned_action_item",
    "overdue_task",
    "status_update",
    "member_invited",
]);

// ─── Tables ──────────────────────────────────────────────────────────────────

export const workspaces = pgTable("workspaces", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    planType: planTypeEnum("plan_type").notNull().default("free"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkId: text("clerk_id").notNull().unique(),
    email: text("email").notNull().unique(),
    fullName: text("full_name").notNull(),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workspaceMembers = pgTable(
    "workspace_members",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        workspaceId: uuid("workspace_id")
            .notNull()
            .references(() => workspaces.id, { onDelete: "cascade" }),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        role: roleEnum("role").notNull().default("viewer"),
        joinedAt: timestamp("joined_at").defaultNow().notNull(),
    },
    (t) => [uniqueIndex("workspace_user_unique").on(t.workspaceId, t.userId)]
);

export const incidents = pgTable("incidents", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
        .notNull()
        .references(() => workspaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    severity: severityEnum("severity").notNull().default("medium"),
    status: statusEnum("status").notNull().default("open"),
    systemComponent: text("system_component"),
    environment: environmentEnum("environment").notNull().default("production"),
    detectedAt: timestamp("detected_at").defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at"),
    impactCost: numeric("impact_cost", { precision: 12, scale: 2 }),
    downtimeMinutes: integer("downtime_minutes").default(0),
    createdBy: uuid("created_by").references(() => users.id),
    deletedAt: timestamp("deleted_at"), // soft delete
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const incidentTimelineEvents = pgTable("incident_timeline_events", {
    id: uuid("id").defaultRandom().primaryKey(),
    incidentId: uuid("incident_id")
        .notNull()
        .references(() => incidents.id, { onDelete: "cascade" }),
    eventType: eventTypeEnum("event_type").notNull(),
    description: text("description"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rootCauseAnalysis = pgTable("root_cause_analysis", {
    id: uuid("id").defaultRandom().primaryKey(),
    incidentId: uuid("incident_id")
        .notNull()
        .references(() => incidents.id, { onDelete: "cascade" })
        .unique(),
    rootCauseCategory: rootCauseCategoryEnum("root_cause_category").notNull(),
    detailedAnalysis: text("detailed_analysis").notNull(),
    preventionSteps: text("prevention_steps").notNull(),
    reviewedBy: uuid("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const actionItems = pgTable("action_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    incidentId: uuid("incident_id")
        .notNull()
        .references(() => incidents.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    assignedTo: uuid("assigned_to").references(() => users.id),
    priority: priorityEnum("priority").notNull().default("medium"),
    status: actionItemStatusEnum("status").notNull().default("todo"),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recurringPatterns = pgTable("recurring_patterns", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
        .notNull()
        .references(() => workspaces.id, { onDelete: "cascade" }),
    systemComponent: text("system_component").notNull(),
    occurrenceCount: integer("occurrence_count").notNull().default(0),
    lastOccurrence: timestamp("last_occurrence"),
    riskScore: numeric("risk_score", { precision: 5, scale: 2 }).default("0"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const riskMetricsSnapshot = pgTable("risk_metrics_snapshot", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
        .notNull()
        .references(() => workspaces.id, { onDelete: "cascade" }),
    operationalRiskIndex: numeric("operational_risk_index", { precision: 5, scale: 2 }),
    mttr: numeric("mttr", { precision: 10, scale: 2 }), // in minutes
    mtbf: numeric("mtbf", { precision: 10, scale: 2 }), // in hours
    incidentFrequency: integer("incident_frequency"),
    criticalIncidentRatio: numeric("critical_incident_ratio", { precision: 5, scale: 4 }),
    snapshotDate: timestamp("snapshot_date").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
        .notNull()
        .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    message: text("message").notNull(),
    readStatus: boolean("read_status").notNull().default(false),
    relatedUrl: text("related_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Type Exports ───────────────────────────────────────────────────────────

export type Workspace = typeof workspaces.$inferSelect;
export type User = typeof users.$inferSelect;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type Incident = typeof incidents.$inferSelect;
export type IncidentTimelineEvent = typeof incidentTimelineEvents.$inferSelect;
export type RootCauseAnalysis = typeof rootCauseAnalysis.$inferSelect;
export type ActionItem = typeof actionItems.$inferSelect;
export type RecurringPattern = typeof recurringPatterns.$inferSelect;
export type RiskMetricsSnapshot = typeof riskMetricsSnapshot.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
