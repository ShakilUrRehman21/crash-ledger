"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { AlertTriangle, Filter, Search, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

const SEVERITIES = ["all", "critical", "high", "medium", "low"];
const STATUSES = ["all", "open", "investigating", "resolved", "archived"];

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    critical: { bg: "rgba(220, 38, 38, 0.1)", text: "#FCA5A5", border: "rgba(220, 38, 38, 0.2)" },
    high: { bg: "rgba(234, 88, 12, 0.1)", text: "#FDBA74", border: "rgba(234, 88, 12, 0.2)" },
    medium: { bg: "rgba(217, 119, 6, 0.1)", text: "#FCD34D", border: "rgba(217, 119, 6, 0.2)" },
    low: { bg: "rgba(148, 163, 184, 0.1)", text: "#CBD5E1", border: "rgba(148, 163, 184, 0.2)" },
};
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    open: { bg: "rgba(37, 99, 235, 0.1)", text: "#93C5FD", border: "rgba(37, 99, 235, 0.2)" },
    investigating: { bg: "rgba(217, 119, 6, 0.1)", text: "#FCD34D", border: "rgba(217, 119, 6, 0.2)" },
    resolved: { bg: "rgba(22, 163, 74, 0.1)", text: "#86EFAC", border: "rgba(22, 163, 74, 0.2)" },
    archived: { bg: "rgba(100, 116, 139, 0.1)", text: "#CBD5E1", border: "rgba(100, 116, 139, 0.2)" },
};

function Badge({ label, colors }: { label: string; colors: { bg: string; text: string; border: string } }) {
    return (
        <span style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "capitalize" as const, display: "inline-block", whiteSpace: "nowrap" }}>
            {label}
        </span>
    );
}

export default function IncidentsPage() {
    const [severity, setSeverity] = useState("all");
    const [status, setStatus] = useState("all");
    const [search, setSearch] = useState("");
    const [allIncidents, setAllIncidents] = useState<any[]>([]);

    const [workspaceId, setWorkspaceId] = useState<string | null>(null);

    useEffect(() => {
        const id = localStorage.getItem("cl_workspace_id");
        if (id) setWorkspaceId(id);
    }, []);

    useEffect(() => {
        if (!workspaceId) return;

        const params = new URLSearchParams({ workspaceId });
        if (severity !== "all") params.append("severity", severity);
        if (status !== "all") params.append("status", status);

        fetch(`/api/incidents?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                if (data.incidents) setAllIncidents(data.incidents);
            })
            .catch(console.error);
    }, [workspaceId, severity, status]);

    const filtered = allIncidents.filter((i) => {
        if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !(i.systemComponent || "").toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    if (!workspaceId) {
        return <div style={{ padding: 40, color: "var(--cl-foreground)" }}>Please select a workspace.</div>;
    }

    return (
        <div>
            <TopBar title="Incidents" subtitle={`${filtered.length} incidents`} showCreateIncident workspaceId={workspaceId} />
            <div style={{ padding: 24 }}>

                {/* Summary Statistics */}
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    {[
                        { label: "Total", val: allIncidents.length, color: "var(--cl-foreground)" },
                        { label: "Open", val: allIncidents.filter(i => i.status === "open").length, color: "#60A5FA" },
                        { label: "Investigating", val: allIncidents.filter(i => i.status === "investigating").length, color: "#FBBF24" },
                        { label: "Critical", val: allIncidents.filter(i => i.severity === "critical").length, color: "#F87171" },
                    ].map(({ label, val, color }) => (
                        <div key={label} style={{ background: "var(--cl-muted)", border: "1px solid var(--cl-border)", borderRadius: 10, padding: "10px 16px", display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 20, fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif" }}>{val}</span>
                            <span style={{ fontSize: 12, color: "var(--cl-muted-foreground)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <Search size={14} color="#94A3B8" />
                        <input type="text" placeholder="Search incidents..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Filter size={14} color="#94A3B8" />
                        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="filter-select">
                            {SEVERITIES.map((s) => <option key={s} value={s}>{s === "all" ? "All Severities" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="filter-select">
                            {STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="table-card">
                    <table className="main-table">
                        <thead>
                            <tr>
                                <th>Incident</th>
                                <th>Severity</th>
                                <th>Status</th>
                                <th>Component</th>
                                <th>Env</th>
                                <th>Downtime</th>
                                <th>Detected</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--cl-muted-foreground)", fontSize: 14 }}>
                                        No incidents match your filters
                                    </td>
                                </tr>
                            ) : filtered.map((inc) => (
                                <tr key={inc.id} className="table-row">
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: SEVERITY_COLORS[inc.severity].text, flexShrink: 0, boxShadow: `0 0 8px ${SEVERITY_COLORS[inc.severity].text}` }} />
                                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--cl-foreground)" }}>{inc.title}</p>
                                        </div>
                                    </td>
                                    <td><Badge label={inc.severity} colors={SEVERITY_COLORS[inc.severity]} /></td>
                                    <td><Badge label={inc.status} colors={STATUS_COLORS[inc.status]} /></td>
                                    <td style={{ fontSize: 13, color: "var(--cl-muted-foreground)" }}>{inc.systemComponent}</td>
                                    <td>
                                        <span style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", color: "var(--cl-muted-foreground)", border: "1px solid rgba(255,255,255,0.1)", padding: "2px 7px", borderRadius: 4, fontWeight: 500 }}>
                                            {inc.environment}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 13, color: "var(--cl-muted-foreground)" }}>
                                        {inc.downtimeMinutes > 0
                                            ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} color="#FBBF24" />{inc.downtimeMinutes}m</span>
                                            : "—"}
                                    </td>
                                    <td style={{ fontSize: 12, color: "var(--cl-muted-foreground)" }}>
                                        {new Date(inc.detectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </td>
                                    <td>
                                        <Link href={`/dashboard/incidents/${inc.id}`} style={{ color: "#60A5FA", display: "flex", alignItems: "center" }}>
                                            <ChevronRight size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
        .filters-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; }
        .search-box { display: flex; align-items: center; gap: 8px; background: var(--cl-muted); border: 1px solid var(--cl-border); border-radius: 8px; padding: 8px 14px; flex: 1; max-width: 340px; }
        .search-input { border: none; outline: none; font-size: 13px; color: var(--cl-foreground); width: 100%; background: transparent; }
        .search-input::placeholder { color: var(--cl-muted-foreground); }
        .filter-select { border: 1px solid var(--cl-border); border-radius: 8px; padding: 7px 12px; font-size: 13px; color: var(--cl-foreground); background: var(--cl-muted); outline: none; cursor: pointer; }
        .table-card { background: var(--cl-muted); border: 1px solid var(--cl-border); border-radius: 14px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .main-table { width: 100%; border-collapse: collapse; }
        .main-table th { font-size: 11px; font-weight: 600; color: var(--cl-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 16px; text-align: left; background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--cl-border); }
        .main-table td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.02); vertical-align: middle; }
        .table-row { transition: all 0.2s; }
        .table-row:last-child td { border-bottom: none; }
        .table-row:hover td { background: rgba(255,255,255,0.02); cursor: pointer; }
      `}</style>
        </div>
    );
}
