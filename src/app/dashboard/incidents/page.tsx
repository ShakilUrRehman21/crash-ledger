"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { AlertTriangle, Filter, Search, ChevronRight, Clock, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";

const SEVERITIES = ["all", "critical", "high", "medium", "low"];
const STATUSES = ["all", "open", "investigating", "resolved", "archived"];

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5" },
  high: { bg: "#FFF7ED", text: "#EA580C", border: "#FDBA74" },
  medium: { bg: "#FFFBEB", text: "#D97706", border: "#FCD34D" },
  low: { bg: "#F1F5F9", text: "#64748B", border: "#CBD5E1" },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  open: { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" },
  investigating: { bg: "#FFF7ED", text: "#EA580C", border: "#FED7AA" },
  resolved: { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" },
  archived: { bg: "#F8FAFC", text: "#94A3B8", border: "#E2E8F0" },
};

function Badge({ label, colors }: { label: string; colors: { bg: string; text: string; border: string } }) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
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
      .then((res) => res.json())
      .then((data) => {
        if (data.incidents) setAllIncidents(data.incidents);
      })
      .catch(console.error);
  }, [workspaceId, severity, status]);

  const filtered = allIncidents.filter((i) => {
    if (
      search &&
      !i.title.toLowerCase().includes(search.toLowerCase()) &&
      !(i.systemComponent || "").toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      <TopBar
        title="Incidents"
        subtitle={`${filtered.length} total incidents in ledger`}
        showCreateIncident
        workspaceId={workspaceId || undefined}
      />

      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Metric Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", val: allIncidents.length, color: "#111827", bg: "#FFFFFF", border: "#EFE9E1" },
            { label: "Open", val: allIncidents.filter((i) => i.status === "open").length, color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
            { label: "Investigating", val: allIncidents.filter((i) => i.status === "investigating").length, color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" },
            { label: "Critical P1", val: allIncidents.filter((i) => i.severity === "critical").length, color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
          ].map(({ label, val, color, bg, border }) => (
            <div
              key={label}
              className="p-4 rounded-2xl border shadow-sm flex items-center justify-between"
              style={{ backgroundColor: bg, borderColor: border }}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">{label}</p>
                <p className="text-2xl font-black font-heading tracking-tight" style={{ color }}>{val}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs" style={{ backgroundColor: `${color}15`, color }}>
                {label.charAt(0)}
              </div>
            </div>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#EFE9E1] shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-neutral-200/80 flex-1 max-w-md focus-within:border-[#FA5A2A]">
            <Search className="w-4 h-4 text-neutral-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by title, component, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-[#111827] placeholder-neutral-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold px-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>

            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-neutral-200 text-neutral-700 focus:outline-none focus:border-[#FA5A2A] cursor-pointer"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All Severities" : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-neutral-200 text-neutral-700 focus:outline-none focus:border-[#FA5A2A] cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Incidents Table */}
        <div className="bg-white rounded-2xl border border-[#EFE9E1] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-[#FAF8F5]/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3.5 pl-6">Incident</th>
                  <th className="py-3.5 px-3">Severity</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Component</th>
                  <th className="py-3.5 px-3">Env</th>
                  <th className="py-3.5 px-3">Downtime</th>
                  <th className="py-3.5 px-3">Detected</th>
                  <th className="py-3.5 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-neutral-400">
                      <ShieldCheck className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                      <p className="font-semibold text-neutral-600">No incidents match your filter criteria</p>
                      <p className="text-xs text-neutral-400 mt-1">Try clearing filters or search terms</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((inc) => {
                    const sevStyle = SEVERITY_COLORS[inc.severity] || SEVERITY_COLORS.low;
                    const statStyle = STATUS_COLORS[inc.status] || STATUS_COLORS.open;

                    return (
                      <tr key={inc.id} className="hover:bg-neutral-50/80 transition-colors group">
                        <td className="py-4 pl-6 max-w-[280px]">
                          <Link
                            href={`/dashboard/incidents/${inc.id}`}
                            className="font-bold text-[#111827] hover:text-[#FA5A2A] transition-colors truncate block"
                          >
                            {inc.title}
                          </Link>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            #{inc.id.slice(0, 8)}
                          </span>
                        </td>

                        <td className="py-4 px-3">
                          <Badge label={inc.severity} colors={sevStyle} />
                        </td>

                        <td className="py-4 px-3">
                          <Badge label={inc.status} colors={statStyle} />
                        </td>

                        <td className="py-4 px-3 font-semibold text-neutral-700">
                          {inc.systemComponent}
                        </td>

                        <td className="py-4 px-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                            {inc.environment}
                          </span>
                        </td>

                        <td className="py-4 px-3 font-medium text-neutral-600">
                          {inc.downtimeMinutes > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[#EA580C] font-semibold">
                              <Clock className="w-3 h-3" />
                              {inc.downtimeMinutes}m
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="py-4 px-3 text-neutral-400 text-[11px]">
                          {new Date(inc.detectedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        <td className="py-4 pr-6 text-right">
                          <Link
                            href={`/dashboard/incidents/${inc.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-[#FA5A2A] hover:bg-[#FFF2EC] transition-colors"
                          >
                            <span>Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
