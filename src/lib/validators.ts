import { z } from "zod";

// ─── Workspace ───────────────────────────────────────────────────────────────

export const createWorkspaceSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    slug: z
        .string()
        .min(2)
        .max(50)
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
});

export const inviteMemberSchema = z.object({
    workspaceId: z.string().min(1),
    email: z.string().email(),
    role: z.enum(["admin", "engineer", "viewer"]),
});

export const updateMemberRoleSchema = z.object({
    workspaceId: z.string().min(1),
    userId: z.string().min(1),
    role: z.enum(["admin", "engineer", "viewer"]),
});

// ─── Incidents ───────────────────────────────────────────────────────────────

export const createIncidentSchema = z.object({
    workspaceId: z.string().min(1),
    title: z.string().min(5, "Title must be at least 5 characters").max(255),
    description: z.string().optional(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    systemComponent: z.string().optional(),
    environment: z.enum(["production", "staging", "dev"]).default("production"),
    detectedAt: z.string().datetime().optional(),
    impactCost: z.number().nonnegative().optional(),
    downtimeMinutes: z.number().int().nonnegative().optional(),
});

export const updateIncidentSchema = z.object({
    title: z.string().min(5).max(255).optional(),
    description: z.string().optional(),
    severity: z.enum(["low", "medium", "high", "critical"]).optional(),
    status: z.enum(["open", "investigating", "resolved", "archived"]).optional(),
    systemComponent: z.string().optional(),
    environment: z.enum(["production", "staging", "dev"]).optional(),
    impactCost: z.number().nonnegative().optional(),
    downtimeMinutes: z.number().int().nonnegative().optional(),
});

export const resolveIncidentSchema = z.object({
    resolvedAt: z.string().datetime().optional(),
    downtimeMinutes: z.number().int().nonnegative().optional(),
});

// ─── Root Cause Analysis ─────────────────────────────────────────────────────

export const createRCASchema = z.object({
    rootCauseCategory: z.enum([
        "human_error",
        "infra",
        "code_bug",
        "process_failure",
        "unknown",
    ]),
    detailedAnalysis: z.string().min(20, "Please provide a detailed analysis (min 20 chars)"),
    preventionSteps: z.string().min(10, "Please provide prevention steps (min 10 chars)"),
});

// ─── Timeline Events ─────────────────────────────────────────────────────────

export const createTimelineEventSchema = z.object({
    eventType: z.enum(["detected", "acknowledged", "mitigated", "resolved", "note"]),
    description: z.string().optional(),
});

// ─── Action Items ────────────────────────────────────────────────────────────

export const createActionItemSchema = z.object({
    incidentId: z.string().min(1),
    workspaceId: z.string().min(1),
    title: z.string().min(3, "Title must be at least 3 characters").max(255),
    description: z.string().optional(),
    assignedTo: z.string().min(1).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    dueDate: z.string().datetime().optional(),
});

export const updateActionItemSchema = z.object({
    title: z.string().min(3).max(255).optional(),
    description: z.string().optional(),
    assignedTo: z.string().min(1).nullable().optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    dueDate: z.string().datetime().nullable().optional(),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type CreateRCAInput = z.infer<typeof createRCASchema>;
export type CreateTimelineEventInput = z.infer<typeof createTimelineEventSchema>;
export type CreateActionItemInput = z.infer<typeof createActionItemSchema>;
export type UpdateActionItemInput = z.infer<typeof updateActionItemSchema>;
