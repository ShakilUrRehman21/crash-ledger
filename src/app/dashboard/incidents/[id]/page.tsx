"use client";

import { useState, use, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
    ArrowLeft, Clock, CheckCircle2, AlertTriangle, FileText, CheckSquare,
    Plus, User, Send, ChevronDown
} from "lucide-react";
import Link from "next/link";

const EVENT_ICONS: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    detected: { icon: AlertTriangle, color: "#EF4444", bg: "#FEF2F2", label: "Detected" },
    acknowledged: { icon: User, color: "#F59E0B", bg: "#FFFBEB", label: "Acknowledged" },
    mitigated: { icon: Clock, color: "#7C3AED", bg: "#F5F3FF", label: "Mitigated" },
    resolved: { icon: CheckCircle2, color: "#22C55E", bg: "#F0FDF4", label: "Resolved" },
    note: { icon: FileText, color: "#2563EB", bg: "#EFF6FF", label: "Note" },
};

const SEVERITY_COLORS: Record<string, string> = { critical: "#DC2626", high: "#EA580C", medium: "#D97706", low: "#64748B" };
const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
    open: { text: "#2563EB", bg: "#EFF6FF" },
    investigating: { text: "#D97706", bg: "#FFFBEB" },
    resolved: { text: "#16A34A", bg: "#F0FDF4" },
    archived: { text: "#64748B", bg: "#F8FAFC" },
};
const ACTION_STATUS: Record<string, { bg: string; text: string }> = {
    todo: { bg: "#F1F5F9", text: "#64748B" },
    in_progress: { bg: "#FFFBEB", text: "#D97706" },
    done: { bg: "#F0FDF4", text: "#16A34A" },
};
const PRIORITY_COLORS: Record<string, string> = { critical: "#DC2626", high: "#EA580C", medium: "#D97706", low: "#64748B" };

// Status transition rules
const VALID_TRANSITIONS: Record<string, string[]> = {
    open: ["investigating", "resolved"],
    investigating: ["resolved"],
    resolved: ["archived"],
    archived: [],
};

function fmt(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [incident, setIncident] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);

    const [tab, setTab] = useState<"timeline" | "rca" | "actions">("timeline");
    const [noteText, setNoteText] = useState("");
    const [statusChanging, setStatusChanging] = useState(false);
    const [newAction, setNewAction] = useState({ title: "", priority: "medium", assignedTo: "" });
    const [showAddAction, setShowAddAction] = useState(false);
    const [rcaForm, setRcaForm] = useState({ category: "code_bug", analysis: "", prevention: "" });
    const [rcaSubmitted, setRcaSubmitted] = useState(false);
    const [rcaError, setRcaError] = useState("");
    const [members, setMembers] = useState<any[]>([]);

    useEffect(() => {
        const wid = localStorage.getItem("cl_workspace_id");
        if (wid) setWorkspaceId(wid);
    }, []);

    useEffect(() => {
        if (!workspaceId) return;
        fetch(`/api/incidents/${id}?workspaceId=${workspaceId}`)
            .then(res => res.json())
            .then(data => {
                if (data.incident) setIncident(data.incident);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        fetch(`/api/workspace/members?workspaceId=${workspaceId}`)
            .then(res => res.json())
            .then(data => {
                if (data.members) setMembers(data.members);
            })
            .catch(console.error);
    }, [workspaceId, id]);

    if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--cl-muted-foreground)" }}>Loading Incident #{id}...</div>;

    if (!incident) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <p style={{ fontSize: 16, color: "#94A3B8" }}>Incident #{id} not found.</p>
                <Link href="/dashboard/incidents" style={{ color: "#2563EB", textDecoration: "none", fontSize: 14 }}>← Back to incidents</Link>
            </div>
        );
    }

    const sev = incident.severity;
    const stat = incident.status;
    const nextStatuses = VALID_TRANSITIONS[stat] ?? [];
    const localTimeline = incident.timelineEvents ?? [];
    const localActions = incident.actionItemsList ?? [];

    async function changeStatus(newStatus: string) {
        if (!workspaceId) return;
        setStatusChanging(false);
        try {
            const res = await fetch(`/api/incidents/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, workspaceId })
            });
            if (res.ok) {
                // optimistically update
                setIncident((prev: any) => ({
                    ...prev,
                    status: newStatus,
                    timelineEvents: [...prev.timelineEvents, { id: `temp_${Date.now()}`, eventType: newStatus, createdAt: new Date().toISOString(), createdBy: 'You', description: `Status changed to ${newStatus}` }]
                }));
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function addNote() {
        if (!noteText.trim() || !workspaceId) return;
        const textToSave = noteText;
        setNoteText("");
        try {
            const res = await fetch(`/api/incidents/${id}/timeline`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventType: "note", description: textToSave, workspaceId })
            });
            if (res.ok) {
                const data = await res.json();
                setIncident((prev: any) => ({ ...prev, timelineEvents: [...prev.timelineEvents, data.event] }));
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function addActionItem() {
        if (!newAction.title.trim() || !workspaceId) return;

        try {
            const res = await fetch(`/api/action-items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    incidentId: id,
                    workspaceId,
                    title: newAction.title,
                    priority: newAction.priority,
                    assignedTo: newAction.assignedTo || undefined
                })
            });
            if (res.ok) {
                const data = await res.json();
                setIncident((prev: any) => ({ ...prev, actionItemsList: [...prev.actionItemsList, data.actionItem] }));
                setNewAction({ title: "", priority: "medium", assignedTo: "" });
                setShowAddAction(false);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function cycleActionStatus(actionId: string, currentStatus: string) {
        if (!workspaceId) return;
        const cycle = ["todo", "in_progress", "done"];
        const next = cycle[(cycle.indexOf(currentStatus) + 1) % cycle.length];

        setIncident((prev: any) => ({
            ...prev,
            actionItemsList: prev.actionItemsList.map((a: any) => a.id === actionId ? { ...a, status: next } : a)
        }));

        try {
            await fetch(`/api/action-items/${actionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: next, workspaceId })
            });
        } catch (e) {
            console.error(e);
        }
    }

    async function submitRCA() {
        if (!rcaForm.analysis || !rcaForm.prevention || !workspaceId) return;
        setRcaError("");
        try {
            const res = await fetch(`/api/incidents/${id}/root-cause`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workspaceId,
                    rootCauseCategory: rcaForm.category,
                    detailedAnalysis: rcaForm.analysis,
                    preventionSteps: rcaForm.prevention
                })
            });
            const data = await res.json();
            if (res.ok) {
                setIncident((prev: any) => ({ ...prev, rca: data.rca }));
                setRcaSubmitted(true);
            } else {
                setRcaError(data.error?.detailedAnalysis?.[0] || data.error?.preventionSteps?.[0] || data.error || "Failed to submit RCA. Checks inputs.");
            }
        } catch (e: any) {
            setRcaError(e.message || "An error occurred");
            console.error(e);
        }
    }

    return (
        <div>
            <TopBar title="Incident Detail" subtitle={`#INC-${id.padStart(3, "0")}`} />
            <div style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>

                {/* Back */}
                <Link href="/dashboard/incidents" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--cl-muted-foreground)", fontSize: 13, fontWeight: 500, textDecoration: "none", marginBottom: 20 }}>
                    <ArrowLeft size={14} /> Back to Incidents
                </Link>

                {/* Header Card */}
                <div className="header-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                                <span style={{ background: SEVERITY_COLORS[sev] + "18", color: SEVERITY_COLORS[sev], border: `1px solid ${SEVERITY_COLORS[sev]}40`, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{sev}</span>
                                <span style={{ background: STATUS_COLORS[stat].bg, color: STATUS_COLORS[stat].text, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>{stat}</span>
                                <span style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--cl-muted-foreground)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{incident.environment}</span>
                            </div>
                            <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--cl-foreground)", marginBottom: 8, lineHeight: 1.3 }}>{incident.title}</h1>
                            {incident.description && <p style={{ fontSize: 13, color: "var(--cl-muted-foreground)", lineHeight: 1.6 }}>{incident.description}</p>}
                        </div>

                        {/* Status action panel */}
                        <div style={{ flexShrink: 0 }}>
                            {nextStatuses.length > 0 ? (
                                <div style={{ position: "relative" }}>
                                    <button
                                        onClick={() => setStatusChanging((v) => !v)}
                                        style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 10px rgba(37,99,235,0.2)" }}
                                    >
                                        Update Status <ChevronDown size={14} />
                                    </button>
                                    {statusChanging && (
                                        <div style={{ position: "absolute", right: 0, top: "110%", background: "var(--cl-muted)", border: "1px solid var(--cl-border)", borderRadius: 10, padding: 6, zIndex: 50, minWidth: 160, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                                            {nextStatuses.map((ns) => (
                                                <button
                                                    key={ns}
                                                    onClick={() => changeStatus(ns)}
                                                    style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", border: "none", background: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, color: STATUS_COLORS[ns].text, cursor: "pointer", textTransform: "capitalize" }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                                                >
                                                    → Mark as {ns}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span style={{ fontSize: 12, color: "var(--cl-muted-foreground)", fontStyle: "italic" }}>No further transitions</span>
                            )}
                        </div>
                    </div>

                    {/* Meta grid */}
                    <div className="meta-grid">
                        {[
                            { label: "Component", val: incident.systemComponent || "General" },
                            { label: "Detected", val: fmt(incident.detectedAt) },
                            { label: "Resolved", val: fmt(incident.resolvedAt) },
                            { label: "Downtime", val: incident.downtimeMinutes > 0 ? `${incident.downtimeMinutes} min` : "None", red: incident.downtimeMinutes > 0 },
                            { label: "Impact Cost", val: incident.impactCost ? `$${Number(incident.impactCost).toLocaleString()}` : "—" },
                            { label: "Created By", val: incident.createdByUser?.fullName ?? incident.createdBy },
                        ].map(({ label, val, red }) => (
                            <div key={label} className="meta-item">
                                <span className="meta-label">{label}</span>
                                <span className="meta-value" style={red ? { color: "#EF4444" } : undefined}>{String(val)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    {(["timeline", "rca", "actions"] as const).map((t) => (
                        <button key={t} onClick={() => setTab(t)} className={`tab-btn${tab === t ? " tab-active" : ""}`}>
                            {t === "timeline" && <Clock size={13} />}
                            {t === "rca" && <FileText size={13} />}
                            {t === "actions" && <CheckSquare size={13} />}
                            {t === "timeline" ? "Timeline" : t === "rca" ? "Root Cause Analysis" : `Action Items (${localActions.length})`}
                        </button>
                    ))}
                </div>

                {/* ── Timeline Tab ─────────────────────────────────── */}
                {tab === "timeline" && (
                    <div className="tab-content animate-fade-in">
                        <div className="timeline">
                            {localTimeline.map((ev: any, i: number) => {
                                const cfg = EVENT_ICONS[ev.eventType] ?? EVENT_ICONS.note;
                                const Icon = cfg.icon;
                                return (
                                    <div key={ev.id} className="timeline-item">
                                        <div className="timeline-connector">
                                            <div style={{ width: 34, height: 34, borderRadius: "50%", background: cfg.bg, border: `2px solid ${cfg.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <Icon size={14} color={cfg.color} />
                                            </div>
                                            {i < localTimeline.length - 1 && <div className="timeline-line" />}
                                        </div>
                                        <div className="timeline-body">
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: cfg.color, letterSpacing: "0.05em" }}>{cfg.label}</span>
                                                <span style={{ fontSize: 11, color: "var(--cl-muted-foreground)" }}>{fmt(ev.createdAt)}</span>
                                            </div>
                                            <p style={{ fontSize: 13, color: "var(--cl-foreground)", lineHeight: 1.6 }}>{ev.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add Note */}
                        <div style={{ marginTop: 20, background: "var(--cl-muted)", border: "1px solid var(--cl-border)", borderRadius: 10, padding: 16 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--cl-muted-foreground)", marginBottom: 8 }}>Add a timeline note</p>
                            <div style={{ display: "flex", gap: 8 }}>
                                <textarea
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="Describe what happened or what was done..."
                                    rows={2}
                                    style={{ flex: 1, border: "1px solid var(--cl-border)", background: "var(--cl-background)", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", resize: "none", color: "var(--cl-foreground)" }}
                                />
                                <button
                                    onClick={addNote}
                                    disabled={!noteText.trim()}
                                    style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "0 16px", cursor: noteText.trim() ? "pointer" : "not-allowed", opacity: noteText.trim() ? 1 : 0.5, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}
                                >
                                    <Send size={13} /> Post
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── RCA Tab ───────────────────────────────────────── */}
                {tab === "rca" && (
                    <div className="tab-content animate-fade-in">
                        {(incident.rca && !rcaSubmitted) ? (
                            <div className="rca-card">
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                                    <div>
                                        <p className="rca-label">Root Cause Category</p>
                                        <span style={{ background: "rgba(124, 58, 237, 0.15)", color: "#C4B5FD", border: "1px solid rgba(124, 58, 237, 0.3)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: "capitalize", display: "inline-block", marginTop: 4 }}>
                                            {incident.rca.rootCauseCategory.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p className="rca-label">Recorded At</p>
                                        <p style={{ fontSize: 11, color: "var(--cl-muted-foreground)", marginTop: 4 }}>{fmt(incident.rca.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="rca-section">
                                    <p className="rca-label">Detailed Analysis</p>
                                    <p className="rca-text">{incident.rca.detailedAnalysis}</p>
                                </div>
                                <div className="rca-section">
                                    <p className="rca-label">Prevention Steps</p>
                                    <div className="rca-text">
                                        {incident.rca.preventionSteps.split("\n").map((step: string, i: number) => (
                                            <p key={i} style={{ marginBottom: 6 }}>{step}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rca-card">
                                {stat === "resolved" || stat === "archived" ? (
                                    <>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                                            <FileText size={18} color="#7C3AED" />
                                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--cl-foreground)" }}>
                                                {rcaSubmitted ? "✅ RCA Submitted" : "Submit Root Cause Analysis"}
                                            </h3>
                                        </div>
                                        {rcaSubmitted ? (
                                            <p style={{ fontSize: 14, color: "#22C55E", fontWeight: 600 }}>Your RCA has been recorded successfully.</p>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                                <div>
                                                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--cl-muted-foreground)", display: "block", marginBottom: 6 }}>Root Cause Category</label>
                                                    <select value={rcaForm.category} onChange={(e) => setRcaForm((p) => ({ ...p, category: e.target.value }))} style={{ width: "100%", border: "1px solid var(--cl-border)", background: "var(--cl-background)", color: "var(--cl-foreground)", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none" }}>
                                                        {["code_bug", "human_error", "infra", "process_failure", "unknown"].map((c) => (
                                                            <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--cl-muted-foreground)", display: "block", marginBottom: 6 }}>Detailed Analysis</label>
                                                    <textarea rows={4} value={rcaForm.analysis} onChange={(e) => setRcaForm((p) => ({ ...p, analysis: e.target.value }))} placeholder="What was the root cause?" style={{ width: "100%", border: "1px solid var(--cl-border)", background: "var(--cl-background)", color: "var(--cl-foreground)", borderRadius: 8, padding: "10px 12px", fontSize: 13, outline: "none", resize: "vertical" }} />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--cl-muted-foreground)", display: "block", marginBottom: 6 }}>Prevention Steps</label>
                                                    <textarea rows={3} value={rcaForm.prevention} onChange={(e) => setRcaForm((p) => ({ ...p, prevention: e.target.value }))} placeholder="How will you prevent recurrence?" style={{ width: "100%", border: "1px solid var(--cl-border)", background: "var(--cl-background)", color: "var(--cl-foreground)", borderRadius: 8, padding: "10px 12px", fontSize: 13, outline: "none", resize: "vertical" }} />
                                                </div>
                                                <button
                                                    onClick={submitRCA}
                                                    style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}
                                                >
                                                    Submit RCA
                                                </button>
                                                {rcaError && <p style={{ color: "#EF4444", fontSize: 13, fontWeight: 500 }}>{typeof rcaError === "string" ? rcaError : JSON.stringify(rcaError)}</p>}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ textAlign: "center", padding: 40 }}>
                                        <FileText size={40} color="var(--cl-border)" />
                                        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--cl-foreground)", marginTop: 12 }}>RCA locked until incident is resolved</p>
                                        <p style={{ fontSize: 13, color: "var(--cl-muted-foreground)", marginTop: 4 }}>Mark this incident as <strong>resolved</strong> to submit a Root Cause Analysis.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Action Items Tab ───────────────────────────────── */}
                {tab === "actions" && (
                    <div className="tab-content animate-fade-in">
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                            <button onClick={() => setShowAddAction((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 10px rgba(37,99,235,0.2)" }}>
                                <Plus size={14} /> Add Action Item
                            </button>
                        </div>

                        {showAddAction && (
                            <div style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "#60A5FA", marginBottom: 12 }}>New Action Item</p>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                    <input value={newAction.title} onChange={(e) => setNewAction((p) => ({ ...p, title: e.target.value }))} placeholder="Task title..." style={{ flex: 1, minWidth: 200, border: "1px solid var(--cl-border)", background: "var(--cl-background)", color: "var(--cl-foreground)", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
                                    <select value={newAction.priority} onChange={(e) => setNewAction((p) => ({ ...p, priority: e.target.value as any }))} style={{ border: "1px solid var(--cl-border)", background: "var(--cl-background)", color: "var(--cl-foreground)", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }}>
                                        {["critical", "high", "medium", "low"].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                    </select>
                                    <select value={newAction.assignedTo} onChange={(e) => setNewAction((p) => ({ ...p, assignedTo: e.target.value }))} style={{ border: "1px solid var(--cl-border)", background: "var(--cl-background)", color: "var(--cl-foreground)", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }}>
                                        <option value="">Unassigned</option>
                                        {members.map(m => <option key={m.id} value={m.id}>{m.fullName || m.email}</option>)}
                                    </select>
                                    <button onClick={addActionItem} style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Add</button>
                                    <button onClick={() => setShowAddAction(false)} style={{ background: "transparent", border: "1px solid var(--cl-border)", color: "var(--cl-foreground)", borderRadius: 8, padding: "8px 12px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
                                </div>
                            </div>
                        )}

                        {localActions.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--cl-muted)", border: "1px solid var(--cl-border)", borderRadius: 12 }}>
                                <CheckSquare size={36} color="var(--cl-border)" />
                                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--cl-foreground)", marginTop: 12 }}>No action items yet</p>
                                <p style={{ fontSize: 13, color: "var(--cl-muted-foreground)", marginTop: 4 }}>Click "Add Action Item" to create remediation tasks.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {localActions.map((item: any) => {
                                    const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== "done";
                                    return (
                                        <div key={item.id} className="action-card" style={{ borderLeft: `3px solid ${PRIORITY_COLORS[item.priority]}` }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--cl-foreground)", marginBottom: 6 }}>{item.title}</p>
                                                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                                        <span style={{ ...ACTION_STATUS[item.status], padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "capitalize" as const }}>
                                                            {item.status.replace("_", " ")}
                                                        </span>
                                                        <span style={{ background: PRIORITY_COLORS[item.priority] + "18", color: PRIORITY_COLORS[item.priority], border: `1px solid ${PRIORITY_COLORS[item.priority]}40`, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "capitalize" as const }}>
                                                            {item.priority}
                                                        </span>
                                                        {isOverdue && <span style={{ background: "#FEF2F2", color: "#DC2626", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>⚠ Overdue</span>}
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div style={{ textAlign: "right", fontSize: 12 }}>
                                                        {item.assignedUser && <p style={{ color: "var(--cl-muted-foreground)", fontWeight: 500 }}>{item.assignedUser.fullName}</p>}
                                                        {item.dueDate && <p style={{ color: isOverdue ? "#EF4444" : "var(--cl-muted-foreground)", marginTop: 2 }}>Due {new Date(item.dueDate).toLocaleDateString()}</p>}
                                                    </div>
                                                    {/* Cycle status button */}
                                                    <button
                                                        onClick={() => cycleActionStatus(item.id, item.status)}
                                                        title="Click to advance status"
                                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", color: "var(--cl-foreground)", whiteSpace: "nowrap", transition: "all 0.15s" }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                                                    >
                                                        {item.status === "done" ? "Reopen" : "Advance →"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
        .header-card { background: var(--cl-muted); border: 1px solid var(--cl-border); border-radius: 14px; padding: 24px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 18px; }
        .meta-item { display: flex; flex-direction: column; gap: 4px; }
        .meta-label { font-size: 10px; font-weight: 600; color: var(--cl-muted-foreground); text-transform: uppercase; letter-spacing: 0.07em; }
        .meta-value { font-size: 13px; font-weight: 600; color: var(--cl-foreground); }
        .tabs { display: flex; gap: 4px; margin-bottom: 16px; background: rgba(0,0,0,0.2); border: 1px solid var(--cl-border); border-radius: 10px; padding: 4px; }
        .tab-btn { display: flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 7px; font-size: 13px; font-weight: 500; color: var(--cl-muted-foreground); border: none; background: transparent; cursor: pointer; transition: all 0.15s; }
        .tab-btn:hover { background: rgba(255,255,255,0.05); color: var(--cl-foreground); }
        .tab-active { background: rgba(255,255,255,0.1) !important; color: #60A5FA !important; font-weight: 600; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); }
        .tab-content { animation: fadeIn 0.2s ease-out; }
        .timeline { display: flex; flex-direction: column; gap: 0; }
        .timeline-item { display: flex; gap: 14px; }
        .timeline-connector { display: flex; flex-direction: column; align-items: center; }
        .timeline-line { width: 2px; flex: 1; background: var(--cl-border); margin: 4px 0; min-height: 20px; }
        .timeline-body { flex: 1; background: var(--cl-muted); border: 1px solid var(--cl-border); border-radius: 10px; padding: 14px; margin-bottom: 10px; }
        .rca-card { background: var(--cl-muted); border: 1px solid var(--cl-border); border-radius: 14px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .rca-section { margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); }
        .rca-label { font-size: 10px; font-weight: 600; color: var(--cl-muted-foreground); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 8px; }
        .rca-text { font-size: 14px; color: var(--cl-foreground); line-height: 1.7; }
        .action-card { background: var(--cl-muted); border: 1px solid var(--cl-border); border-radius: 10px; padding: 16px; transition: all 0.2s; position: relative; }
        .action-card:hover { border-color: rgba(255,255,255,0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.4); transform: translateY(-1px); }
      `}</style>
        </div>
    );
}
