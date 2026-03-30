"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Plus, AlertTriangle, Clock, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

const COLUMNS = [
    { key: "todo", label: "To Do", color: "#94A3B8", bg: "rgba(148, 163, 184, 0.1)" },
    { key: "in_progress", label: "In Progress", color: "#FBBF24", bg: "rgba(251, 191, 36, 0.1)" },
    { key: "done", label: "Done", color: "#4ADE80", bg: "rgba(74, 222, 128, 0.1)" },
] as const;

const PRIORITY_COLORS: Record<string, string> = {
    critical: "#DC2626", high: "#EA580C", medium: "#D97706", low: "#64748B",
};

export default function ActionItemsPage() {
    const [items, setItems] = useState<any[]>([]);
    const [filter, setFilter] = useState("all");
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);

    useEffect(() => {
        const id = localStorage.getItem("cl_workspace_id");
        if (id) setWorkspaceId(id);
    }, []);

    useEffect(() => {
        if (!workspaceId) return;
        fetch(`/api/action-items?workspaceId=${workspaceId}`)
            .then(res => res.json())
            .then(data => {
                if (data.actionItems) setItems(data.actionItems);
            })
            .catch(console.error);
    }, [workspaceId]);

    function advanceStatus(id: string) {
        const cycle = ["todo", "in_progress", "done"];
        setItems(prev => prev.map(a => {
            if (a.id !== id) return a;
            const newStatus = cycle[(cycle.indexOf(a.status) + 1) % cycle.length];

            // Fire API call asynchronously
            fetch(`/api/action-items/${a.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, workspaceId })
            }).catch(console.error);

            return { ...a, status: newStatus };
        }));
    }

    const filtered = items.filter((i) => {
        const isOverdue = i.dueDate && new Date(i.dueDate) < new Date() && i.status !== "done";
        if (filter === "overdue") return isOverdue;
        if (filter === "unassigned") return !i.assignedTo;
        return true;
    });

    if (!workspaceId) {
        return <div style={{ padding: 40, color: "var(--cl-foreground)" }}>Please select a workspace.</div>;
    }

    return (
        <div>
            <TopBar title="Action Items" subtitle="Track remediation tasks across all incidents" showCreateIncident workspaceId={workspaceId} />
            <div style={{ padding: 24 }}>
                {/* Summary row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                    {[
                        { label: "Total Tasks", val: items.length, color: "#60A5FA", icon: AlertTriangle },
                        { label: "In Progress", val: items.filter((i) => i.status === "in_progress").length, color: "#FBBF24", icon: Clock },
                        { label: "Completed", val: items.filter((i) => i.status === "done").length, color: "#4ADE80", icon: CheckCircle2 },
                        { label: "Overdue", val: items.filter((i) => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== "done").length, color: "#F87171", icon: AlertCircle },
                    ].map(({ label, val, color, icon: Icon }) => (
                        <div key={label} style={{ background: "var(--cl-muted)", border: "1px solid var(--cl-border)", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 12px ${color}40` }}>
                                <Icon size={16} color={color} />
                            </div>
                            <div>
                                <p style={{ fontSize: 20, fontWeight: 800, color: "var(--cl-foreground)", fontFamily: "'Space Grotesk', sans-serif" }}>{val}</p>
                                <p style={{ fontSize: 12, color: "var(--cl-muted-foreground)" }}>{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    {[
                        { key: "all", label: "All" },
                        { key: "overdue", label: "🔴 Overdue" },
                        { key: "unassigned", label: "Unassigned" },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            style={{
                                padding: "6px 14px",
                                borderRadius: 8,
                                border: "1px solid",
                                borderColor: filter === key ? "#3B82F6" : "var(--cl-border)",
                                background: filter === key ? "rgba(59, 130, 246, 0.15)" : "var(--cl-muted)",
                                color: filter === key ? "#60A5FA" : "var(--cl-muted-foreground)",
                                fontSize: 13, fontWeight: 500, cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Kanban Board */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                    {COLUMNS.map((col) => {
                        const colItems = filtered.filter((i) => i.status === col.key);
                        return (
                            <div key={col.key}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--cl-foreground)" }}>{col.label}</span>
                                    <span style={{ marginLeft: 4, background: col.bg, color: col.color, padding: "1px 7px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{colItems.length}</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {colItems.map((item) => {
                                        const inc = item.incident;
                                        const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== "done";

                                        return (
                                            <div
                                                key={item.id}
                                                style={{
                                                    background: "var(--cl-muted)",
                                                    border: "1px solid var(--cl-border)",
                                                    borderLeft: `3px solid ${PRIORITY_COLORS[item.priority]}`,
                                                    borderRadius: 10,
                                                    padding: "14px",
                                                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                                                    position: "relative",
                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "translateY(-2px)";
                                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                                                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.4)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "none";
                                                    e.currentTarget.style.borderColor = "var(--cl-border)";
                                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
                                                }}
                                            >
                                                {isOverdue && (
                                                    <span style={{ background: "rgba(220, 38, 38, 0.15)", color: "#FCA5A5", border: "1px solid rgba(220, 38, 38, 0.3)", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, display: "inline-block", marginBottom: 6 }}>⚠ OVERDUE</span>
                                                )}
                                                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--cl-foreground)", lineHeight: 1.4, marginBottom: 10 }}>{item.title}</p>

                                                {inc && (
                                                    <Link href={`/dashboard/incidents/${inc.id}`} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#60A5FA", marginBottom: 8, textDecoration: "none", fontWeight: 500 }}>
                                                        📁 {inc.title.length > 25 ? inc.title.substring(0, 25) + '...' : inc.title} <ChevronRight size={12} />
                                                    </Link>
                                                )}

                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                                    <span style={{ background: PRIORITY_COLORS[item.priority] + "20", color: PRIORITY_COLORS[item.priority], border: `1px solid ${PRIORITY_COLORS[item.priority]}40`, padding: "2px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, textTransform: "capitalize" }}>
                                                        {item.priority}
                                                    </span>
                                                    <span style={{ fontSize: 11, color: isOverdue ? "#FCA5A5" : "var(--cl-muted-foreground)" }}>
                                                        {item.assignedUser ? `👤 ${item.assignedUser.fullName.split(" ")[0]}` : "Unassigned"}
                                                    </span>
                                                </div>

                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 8, marginTop: 8 }}>
                                                    {item.dueDate ? (
                                                        <span style={{ fontSize: 10, color: isOverdue ? "#FCA5A5" : "var(--cl-muted-foreground)" }}>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                                                    ) : <span />}

                                                    <button
                                                        onClick={() => advanceStatus(item.id)}
                                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 600, cursor: "pointer", color: "var(--cl-foreground)", transition: "all 0.2s" }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                                    >
                                                        {item.status === "done" ? "↺ Reopen" : "Advance →"}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
