"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { AlertTriangle, Clock, CheckCircle2, AlertCircle, ChevronRight, FolderOpen } from "lucide-react";
import Link from "next/link";
import { safeJson } from "@/lib/safe-json";

const COLUMNS = [
    { key: "todo", label: "To Do", color: "#0D0D0D", bg: "#E9E4DA" },
    { key: "in_progress", label: "In Progress", color: "#FF4D1A", bg: "#FFE6DC" },
    { key: "done", label: "Done", color: "#0D0D0D", bg: "#FFFFFF" },
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
            .then((res) => safeJson(res))
            .then(data => {
                if (data.actionItems) setItems(data.actionItems);
            })
            .catch(console.error);
    }, [workspaceId]);

    function advanceStatus(id: string) {
        const target = items.find((a) => a.id === id);
        if (!target) return;
        const cycle = ["todo", "in_progress", "done"];
        const newStatus = cycle[(cycle.indexOf(target.status) + 1) % cycle.length];
        const oldStatus = target.status;

        setItems(prev => prev.map(a => (a.id === id ? { ...a, status: newStatus } : a)));

        fetch(`/api/action-items/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus, workspaceId })
        })
            .then((res) => {
                if (!res.ok) throw new Error("Update failed");
            })
            .catch((e) => {
                console.error(e);
                setItems(prev => prev.map(a => (a.id === id ? { ...a, status: oldStatus } : a)));
            });
    }

    const isOverdueFn = (i: any) => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== "done";

    const filtered = items.filter((i) => {
        if (filter === "overdue") return isOverdueFn(i);
        if (filter === "unassigned") return !i.assignedTo;
        return true;
    });

    if (!workspaceId) {
        return (
            <div className="min-h-screen bg-[#F2EFE8]">
                <TopBar title="Action Items" />
                <div className="p-12 text-center text-sm text-neutral-500">Please select a workspace.</div>
            </div>
        );
    }

    const summary = [
        { label: "Total Tasks", val: items.length, color: "#0D0D0D", bg: "#FF4D1A", icon: AlertTriangle },
        { label: "In Progress", val: items.filter((i) => i.status === "in_progress").length, color: "#0D0D0D", bg: "#FF4D1A", icon: Clock },
        { label: "Completed", val: items.filter((i) => i.status === "done").length, color: "#0D0D0D", bg: "#FF4D1A", icon: CheckCircle2 },
        { label: "Overdue", val: items.filter(isOverdueFn).length, color: "#0D0D0D", bg: "#FF4D1A", icon: AlertCircle },
    ];

    return (
        <div className="min-h-screen bg-[#F2EFE8] pb-16">
            <TopBar title="Action Items" subtitle="Track remediation tasks across all incidents" showCreateIncident workspaceId={workspaceId} />
            <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {summary.map(({ label, val, color, bg, icon: Icon }) => (
                        <div key={label} className="bg-white rounded-2xl border border-[#D9D3C7] shadow-sm p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-[#0D0D0D] font-heading leading-none">{val}</p>
                                <p className="text-xs text-neutral-500 mt-1 font-medium">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    {[
                        { key: "all", label: "All" },
                        { key: "overdue", label: "Overdue" },
                        { key: "unassigned", label: "Unassigned" },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${filter === key ? "bg-[#FF4D1A] text-white border-[#FF4D1A] shadow-md shadow-[#FF4D1A]/20" : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {COLUMNS.map((col) => {
                        const colItems = filtered.filter((i) => i.status === col.key);
                        return (
                            <div key={col.key} className="bg-[#E9E4DA]/60 rounded-2xl p-3">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                                    <span className="text-sm font-bold text-[#0D0D0D] font-heading">{col.label}</span>
                                    <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: col.bg, color: col.color }}>{colItems.length}</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {colItems.length === 0 && (
                                        <p className="text-xs text-neutral-400 text-center py-6">Nothing here</p>
                                    )}
                                    {colItems.map((item) => {
                                        const inc = item.incident;
                                        const overdue = isOverdueFn(item);
                                        const pc = PRIORITY_COLORS[item.priority] ?? "#64748B";
                                        return (
                                            <div
                                                key={item.id}
                                                className="bg-white rounded-xl border border-[#D9D3C7] p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                                                style={{ borderLeft: `4px solid ${pc}` }}
                                            >
                                                {overdue && (
                                                    <span className="inline-block mb-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-600 border border-red-200">OVERDUE</span>
                                                )}
                                                <p className="text-sm font-bold text-[#0D0D0D] leading-snug mb-2">{item.title}</p>

                                                {inc && (
                                                    <Link href={`/dashboard/incidents/${inc.id}`} className="flex items-center gap-1 text-[11px] font-semibold text-[#FF4D1A] mb-3 hover:underline">
                                                        <FolderOpen className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">{inc.title}</span>
                                                        <ChevronRight className="w-3 h-3 shrink-0" />
                                                    </Link>
                                                )}

                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider" style={{ background: pc + "15", color: pc, border: `1px solid ${pc}40` }}>
                                                        {item.priority}
                                                    </span>
                                                    <span className="text-[11px] text-neutral-500 font-medium">
                                                        {item.assignedUser ? (item.assignedUser.fullName || "Assigned").split(" ")[0] : "Unassigned"}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                                                    {item.dueDate ? (
                                                        <span className={`text-[11px] font-medium ${overdue ? "text-red-500" : "text-neutral-400"}`}>Due {new Date(item.dueDate).toLocaleDateString()}</span>
                                                    ) : <span />}
                                                    <button
                                                        onClick={() => advanceStatus(item.id)}
                                                        className="px-3 py-1 rounded-full text-[11px] font-bold border border-neutral-200 text-neutral-700 hover:bg-[#FFE6DC] hover:border-[#FF4D1A] hover:text-[#FF4D1A] transition-all"
                                                    >
                                                        {item.status === "done" ? "Reopen" : "Advance →"}
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
