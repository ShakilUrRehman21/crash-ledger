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
    resolved: { icon: CheckCircle2, color: "#10B981", bg: "#ECFDF5", label: "Resolved" },
    note: { icon: FileText, color: "#2563EB", bg: "#EFF6FF", label: "Note" },
};

const SEVERITY_COLORS: Record<string, string> = { critical: "#DC2626", high: "#EA580C", medium: "#D97706", low: "#64748B" };
const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
    open: { text: "#2563EB", bg: "#EFF6FF" },
    investigating: { text: "#EA580C", bg: "#FFF7ED" },
    resolved: { text: "#059669", bg: "#ECFDF5" },
    archived: { text: "#64748B", bg: "#F1F5F9" },
};
const ACTION_STATUS: Record<string, { bg: string; text: string }> = {
    todo: { bg: "#F1F5F9", text: "#64748B" },
    in_progress: { bg: "#FFF7ED", text: "#EA580C" },
    done: { bg: "#ECFDF5", text: "#059669" },
};
const PRIORITY_COLORS: Record<string, string> = { critical: "#DC2626", high: "#EA580C", medium: "#D97706", low: "#64748B" };

const VALID_TRANSITIONS: Record<string, string[]> = {
    open: ["investigating", "resolved"],
    investigating: ["resolved"],
    resolved: ["archived"],
    archived: [],
};

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-[#FAF8F5] text-sm text-[#111827] placeholder-neutral-400 focus:outline-none focus:border-[#FA5A2A] focus:bg-white transition-all";
const labelCls = "block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2";
const cardCls = "bg-white rounded-2xl border border-[#EFE9E1] shadow-sm";
const primaryBtn = "inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#FA5A2A] to-[#FF7A00] hover:opacity-95 shadow-md shadow-[#FA5A2A]/25 transition-all";

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
        else setLoading(false);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF8F5]">
                <TopBar title="Incident Detail" subtitle="Loading..." />
                <div className="max-w-4xl mx-auto p-8 space-y-4 animate-pulse">
                    <div className="h-40 bg-neutral-200/60 rounded-2xl" />
                    <div className="h-64 bg-neutral-200/60 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!incident) {
        return (
            <div className="min-h-screen bg-[#FAF8F5]">
                <TopBar title="Incident Detail" />
                <div className="p-12 text-center">
                    <p className="text-base text-neutral-500 mb-3">Incident not found.</p>
                    <Link href="/dashboard/incidents" className="text-sm font-bold text-[#FA5A2A]">← Back to incidents</Link>
                </div>
            </div>
        );
    }

    const sev = incident.severity;
    const stat = incident.status;
    const nextStatuses = VALID_TRANSITIONS[stat] ?? [];
    const localTimeline = incident.timelineEvents ?? [];
    const localActions = incident.actionItemsList ?? [];
    const sevColor = SEVERITY_COLORS[sev] ?? "#64748B";
    const statStyle = STATUS_COLORS[stat] ?? STATUS_COLORS.open;

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
                setIncident((prev: any) => ({
                    ...prev,
                    status: newStatus,
                    timelineEvents: [...(prev.timelineEvents ?? []), { id: `temp_${Date.now()}`, eventType: newStatus, createdAt: new Date().toISOString(), createdBy: 'You', description: `Status changed to ${newStatus}` }]
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
                setIncident((prev: any) => ({ ...prev, timelineEvents: [...(prev.timelineEvents ?? []), data.event] }));
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
                setIncident((prev: any) => ({ ...prev, actionItemsList: [...(prev.actionItemsList ?? []), data.actionItem] }));
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
            actionItemsList: (prev.actionItemsList ?? []).map((a: any) => a.id === actionId ? { ...a, status: next } : a)
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
                setRcaError(data.error?.detailedAnalysis?.[0] || data.error?.preventionSteps?.[0] || (typeof data.error === "string" ? data.error : "") || "Failed to submit RCA. Check inputs.");
            }
        } catch (e: any) {
            setRcaError(e.message || "An error occurred");
            console.error(e);
        }
    }

    const metaItems = [
        { label: "Component", val: incident.systemComponent || "General" },
        { label: "Detected", val: fmt(incident.detectedAt) },
        { label: "Resolved", val: fmt(incident.resolvedAt) },
        { label: "Downtime", val: incident.downtimeMinutes > 0 ? `${incident.downtimeMinutes} min` : "None", red: incident.downtimeMinutes > 0 },
        { label: "Impact Cost", val: incident.impactCost ? `$${Number(incident.impactCost).toLocaleString()}` : "—" },
        { label: "Created By", val: incident.createdByUser?.fullName ?? incident.createdBy ?? "—" },
    ];

    return (
        <div className="min-h-screen bg-[#FAF8F5] pb-16">
            <TopBar title="Incident Detail" subtitle={`#${String(id).slice(0, 8)}`} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">

                <Link href="/dashboard/incidents" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-[#FA5A2A] mb-5 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to incidents
                </Link>

                {/* Header card */}
                <div className={`${cardCls} p-6 sm:p-8 mb-6`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider" style={{ background: sevColor + "15", color: sevColor, border: `1px solid ${sevColor}40` }}>{sev}</span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider" style={{ background: statStyle.bg, color: statStyle.text }}>{stat}</span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200">{incident.environment}</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] font-heading leading-snug mb-2">{incident.title}</h1>
                            {incident.description && <p className="text-sm text-neutral-500 leading-relaxed">{incident.description}</p>}
                        </div>

                        <div className="shrink-0">
                            {nextStatuses.length > 0 ? (
                                <div className="relative">
                                    <button onClick={() => setStatusChanging((v) => !v)} className={primaryBtn}>
                                        Update Status <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                    {statusChanging && (
                                        <div className="absolute right-0 top-full mt-2 bg-white border border-[#EFE9E1] rounded-2xl p-1.5 z-50 min-w-[190px] shadow-xl">
                                            {nextStatuses.map((ns) => (
                                                <button
                                                    key={ns}
                                                    onClick={() => changeStatus(ns)}
                                                    className="block w-full text-left px-3 py-2 rounded-xl text-xs font-bold capitalize hover:bg-[#FAF8F5] transition-colors"
                                                    style={{ color: STATUS_COLORS[ns].text }}
                                                >
                                                    → Mark as {ns}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="text-xs italic text-neutral-400">No further transitions</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-5 mt-5 border-t border-neutral-100">
                        {metaItems.map(({ label, val, red }) => (
                            <div key={label} className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</span>
                                <span className={`text-sm font-semibold ${red ? "text-red-500" : "text-[#111827]"}`}>{String(val)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="inline-flex flex-wrap gap-1 p-1 mb-5 bg-white border border-[#EFE9E1] rounded-full shadow-sm">
                    {(["timeline", "rca", "actions"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${tab === t ? "bg-[#FA5A2A] text-white shadow-md shadow-[#FA5A2A]/25" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"}`}
                        >
                            {t === "timeline" && <Clock className="w-3.5 h-3.5" />}
                            {t === "rca" && <FileText className="w-3.5 h-3.5" />}
                            {t === "actions" && <CheckSquare className="w-3.5 h-3.5" />}
                            {t === "timeline" ? "Timeline" : t === "rca" ? "Root Cause Analysis" : `Action Items (${localActions.length})`}
                        </button>
                    ))}
                </div>

                {/* Timeline */}
                {tab === "timeline" && (
                    <div>
                        <div className="flex flex-col">
                            {localTimeline.map((ev: any, i: number) => {
                                const cfg = EVENT_ICONS[ev.eventType] ?? EVENT_ICONS.note;
                                const Icon = cfg.icon;
                                return (
                                    <div key={ev.id} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: cfg.bg, border: `2px solid ${cfg.color}30` }}>
                                                <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                                            </div>
                                            {i < localTimeline.length - 1 && <div className="w-0.5 flex-1 bg-[#EFE9E1] my-1 min-h-[20px]" />}
                                        </div>
                                        <div className={`${cardCls} flex-1 p-4 mb-3`}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</span>
                                                <span className="text-[11px] text-neutral-400">{fmt(ev.createdAt)}</span>
                                            </div>
                                            <p className="text-sm text-neutral-700 leading-relaxed">{ev.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={`${cardCls} p-5 mt-4`}>
                            <p className={labelCls}>Add a timeline note</p>
                            <div className="flex gap-2">
                                <textarea
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="Describe what happened or what was done..."
                                    rows={2}
                                    className={`${inputCls} flex-1 resize-none`}
                                />
                                <button onClick={addNote} disabled={!noteText.trim()} className={`${primaryBtn} disabled:opacity-40 disabled:cursor-not-allowed self-stretch`}>
                                    <Send className="w-3.5 h-3.5" /> Post
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* RCA */}
                {tab === "rca" && (
                    <div className={`${cardCls} p-6 sm:p-8`}>
                        {(incident.rca && !rcaSubmitted) ? (
                            <>
                                <div className="flex justify-between mb-6">
                                    <div>
                                        <p className={labelCls}>Root Cause Category</p>
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold capitalize bg-purple-50 text-purple-700 border border-purple-200">
                                            {String(incident.rca.rootCauseCategory).replace(/_/g, " ")}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className={labelCls}>Recorded At</p>
                                        <p className="text-xs text-neutral-500">{fmt(incident.rca.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="pt-5 border-t border-neutral-100">
                                    <p className={labelCls}>Detailed Analysis</p>
                                    <p className="text-sm text-neutral-700 leading-relaxed">{incident.rca.detailedAnalysis}</p>
                                </div>
                                <div className="pt-5 mt-5 border-t border-neutral-100">
                                    <p className={labelCls}>Prevention Steps</p>
                                    <div className="text-sm text-neutral-700 leading-relaxed">
                                        {String(incident.rca.preventionSteps).split("\n").map((step: string, i: number) => (
                                            <p key={i} className="mb-1.5">{step}</p>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : stat === "resolved" || stat === "archived" ? (
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                                    <h3 className="text-base font-bold text-[#111827] font-heading">
                                        {rcaSubmitted ? "RCA Submitted" : "Submit Root Cause Analysis"}
                                    </h3>
                                </div>
                                {rcaSubmitted ? (
                                    <p className="text-sm text-emerald-600 font-semibold">Your RCA has been recorded successfully.</p>
                                ) : (
                                    <div className="space-y-5">
                                        <div>
                                            <label className={labelCls}>Root Cause Category</label>
                                            <select value={rcaForm.category} onChange={(e) => setRcaForm((p) => ({ ...p, category: e.target.value }))} className={inputCls}>
                                                {["code_bug", "human_error", "infra", "process_failure", "unknown"].map((c) => (
                                                    <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Detailed Analysis</label>
                                            <textarea rows={4} value={rcaForm.analysis} onChange={(e) => setRcaForm((p) => ({ ...p, analysis: e.target.value }))} placeholder="What was the root cause?" className={`${inputCls} resize-y`} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Prevention Steps</label>
                                            <textarea rows={3} value={rcaForm.prevention} onChange={(e) => setRcaForm((p) => ({ ...p, prevention: e.target.value }))} placeholder="How will you prevent recurrence?" className={`${inputCls} resize-y`} />
                                        </div>
                                        <button onClick={submitRCA} className={primaryBtn}>Submit RCA</button>
                                        {rcaError && <p className="text-xs font-semibold text-red-500">{rcaError}</p>}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-10">
                                <FileText className="w-10 h-10 text-neutral-300 mx-auto" />
                                <p className="text-sm font-bold text-[#111827] mt-3">RCA locked until incident is resolved</p>
                                <p className="text-xs text-neutral-500 mt-1">Mark this incident as <strong>resolved</strong> to submit a Root Cause Analysis.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                {tab === "actions" && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setShowAddAction((v) => !v)} className={primaryBtn}>
                                <Plus className="w-3.5 h-3.5" /> Add Action Item
                            </button>
                        </div>

                        {showAddAction && (
                            <div className="bg-[#FFF2EC] border border-[#FFD5C7] rounded-2xl p-4 mb-4">
                                <p className="text-xs font-bold text-[#C0390B] mb-3">New Action Item</p>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <input value={newAction.title} onChange={(e) => setNewAction((p) => ({ ...p, title: e.target.value }))} placeholder="Task title..." className={`${inputCls} flex-1 min-w-[200px] !w-auto`} />
                                    <select value={newAction.priority} onChange={(e) => setNewAction((p) => ({ ...p, priority: e.target.value }))} className={`${inputCls} !w-auto`}>
                                        {["critical", "high", "medium", "low"].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                    </select>
                                    <select value={newAction.assignedTo} onChange={(e) => setNewAction((p) => ({ ...p, assignedTo: e.target.value }))} className={`${inputCls} !w-auto`}>
                                        <option value="">Unassigned</option>
                                        {members.map(m => <option key={m.id} value={m.id}>{m.fullName || m.email}</option>)}
                                    </select>
                                    <button onClick={addActionItem} className={primaryBtn}>Add</button>
                                    <button onClick={() => setShowAddAction(false)} className="px-4 py-2.5 rounded-full text-xs font-bold text-neutral-600 hover:bg-white transition-colors">Cancel</button>
                                </div>
                            </div>
                        )}

                        {localActions.length === 0 ? (
                            <div className={`${cardCls} text-center py-12 px-5`}>
                                <CheckSquare className="w-9 h-9 text-neutral-300 mx-auto" />
                                <p className="text-sm font-bold text-[#111827] mt-3">No action items yet</p>
                                <p className="text-xs text-neutral-500 mt-1">Click &quot;Add Action Item&quot; to create remediation tasks.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {localActions.map((item: any) => {
                                    const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== "done";
                                    const pc = PRIORITY_COLORS[item.priority] ?? "#64748B";
                                    const ac = ACTION_STATUS[item.status] ?? ACTION_STATUS.todo;
                                    return (
                                        <div key={item.id} className={`${cardCls} p-4 hover:shadow-md transition-shadow`} style={{ borderLeft: `4px solid ${pc}` }}>
                                            <div className="flex justify-between items-center gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-[#111827] mb-2">{item.title}</p>
                                                    <div className="flex flex-wrap gap-2 items-center">
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider" style={{ background: ac.bg, color: ac.text }}>{String(item.status).replace("_", " ")}</span>
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider" style={{ background: pc + "15", color: pc, border: `1px solid ${pc}40` }}>{item.priority}</span>
                                                        {isOverdue && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-600">Overdue</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <div className="text-right text-xs">
                                                        {item.assignedUser && <p className="text-neutral-600 font-semibold">{item.assignedUser.fullName}</p>}
                                                        {item.dueDate && <p className={`mt-0.5 ${isOverdue ? "text-red-500" : "text-neutral-400"}`}>Due {new Date(item.dueDate).toLocaleDateString()}</p>}
                                                    </div>
                                                    <button
                                                        onClick={() => cycleActionStatus(item.id, item.status)}
                                                        title="Click to advance status"
                                                        className="px-3 py-1.5 rounded-full text-[11px] font-bold border border-neutral-200 text-neutral-700 hover:bg-[#FFF2EC] hover:border-[#FA5A2A] hover:text-[#FA5A2A] transition-all whitespace-nowrap"
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
        </div>
    );
}
