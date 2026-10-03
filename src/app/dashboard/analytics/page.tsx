"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, AreaChart, Area
} from "recharts";
import { BarChart2 } from "lucide-react";

const card = "bg-white rounded-2xl border border-[#EFE9E1] shadow-sm p-6";
const axisTick = { fontSize: 11, fill: "#9CA3AF" };
const tooltipStyle = { borderRadius: 12, border: "1px solid #EFE9E1", fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" };

function RiskBar({ value }: { value: number }) {
    const color = value >= 70 ? "#EF4444" : value >= 40 ? "#F59E0B" : "#10B981";
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
            </div>
            <span className="text-xs font-bold w-8 text-right" style={{ color }}>{value}</span>
        </div>
    );
}

function ChartHeader({ title, unit, desc }: { title: string; unit?: string; desc: string }) {
    return (
        <div className="mb-4">
            <h3 className="text-base font-bold text-[#111827] font-heading">
                {title} {unit && <span className="text-xs font-medium text-neutral-400">({unit})</span>}
            </h3>
            <p className="text-xs text-neutral-400">{desc}</p>
        </div>
    );
}

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [incidents, setIncidents] = useState<any[]>([]);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);

    useEffect(() => {
        const wid = localStorage.getItem("cl_workspace_id");
        if (wid) setWorkspaceId(wid);
        else setLoading(false);
    }, []);

    useEffect(() => {
        if (!workspaceId) return;
        fetch(`/api/incidents?workspaceId=${workspaceId}`)
            .then(res => res.json())
            .then(data => {
                if (data.incidents) setIncidents(data.incidents);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [workspaceId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF8F5]">
                <TopBar title="Analytics" subtitle="Loading analytics..." />
                <div className="p-8 max-w-7xl mx-auto grid gap-4 animate-pulse">
                    <div className="h-64 bg-neutral-200/60 rounded-2xl" />
                    <div className="h-64 bg-neutral-200/60 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!workspaceId || incidents.length === 0) {
        return (
            <div className="min-h-screen bg-[#FAF8F5]">
                <TopBar title="Analytics" subtitle="Historical trends and recurring failure analysis" />
                <div className="max-w-xl mx-auto mt-16 bg-white rounded-3xl border border-[#EFE9E1] shadow-sm p-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFF2EC] text-[#FA5A2A] flex items-center justify-center mx-auto mb-4">
                        <BarChart2 className="w-7 h-7" />
                    </div>
                    <h2 className="text-lg font-bold text-[#111827] font-heading mb-2">No data available yet</h2>
                    <p className="text-sm text-neutral-500">
                        {workspaceId ? "Analytics will populate once you start logging incidents for this workspace." : "Please select a workspace first."}
                    </p>
                </div>
            </div>
        );
    }

    const compMap = new Map<string, any>();
    incidents.forEach(inc => {
        const comp = inc.systemComponent || "General";
        if (!compMap.has(comp)) compMap.set(comp, { component: comp, critical: 0, high: 0, medium: 0, low: 0, count: 0, last: 0 });
        const e = compMap.get(comp);
        e.count++;
        if (e[inc.severity] !== undefined) e[inc.severity]++;
        e.last = Math.max(e.last, new Date(inc.detectedAt).getTime());
    });

    const frequencyData = Array.from(compMap.values());
    const recurringPatterns = frequencyData.map(f => ({
        component: f.component,
        occurrences: f.count,
        riskScore: Math.min(100, f.count * 15 + (f.high + f.critical) * 20),
        lastOccurrence: new Date(f.last).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    })).sort((a, b) => b.riskScore - a.riskScore);

    const trendMap = new Map<string, { ts: number; items: any[] }>();
    incidents.forEach(inc => {
        const d = new Date(inc.detectedAt);
        const key = d.toDateString();
        if (!trendMap.has(key)) trendMap.set(key, { ts: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(), items: [] });
        trendMap.get(key)!.items.push(inc);
    });

    // Sort by real timestamp (fixes month/year rollover ordering)
    const sortedDays = Array.from(trendMap.values()).sort((a, b) => a.ts - b.ts);

    let cumulative: any[] = [];
    const trendData = sortedDays.map(({ ts, items }) => {
        cumulative = cumulative.concat(items);
        const label = new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });

        const resolved = cumulative.filter((i: any) => i.resolvedAt);
        const mttr = resolved.length > 0
            ? Math.max(1, Math.round(resolved.reduce((acc, i) => acc + (new Date(i.resolvedAt).getTime() - new Date(i.detectedAt).getTime()) / 60000, 0) / resolved.length))
            : 0;

        let mtbf = 0;
        if (cumulative.length >= 2) {
            const sorted = [...cumulative].sort((a, b) => new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime());
            let gaps = 0;
            for (let i = 1; i < sorted.length; i++) {
                gaps += (new Date(sorted[i].detectedAt).getTime() - new Date(sorted[i - 1].detectedAt).getTime()) / 3600000;
            }
            mtbf = Math.max(0.1, Math.round((gaps / (sorted.length - 1)) * 10) / 10);
        }

        const sevScore = cumulative.reduce((acc, i) => acc + (i.severity === "critical" ? 3 : i.severity === "high" ? 2 : i.severity === "medium" ? 1 : 0.5), 0);
        const downtime = Math.min(cumulative.reduce((acc, i) => acc + (i.downtimeMinutes || 0), 0) / 1440, 10);
        const risk = Math.min(100, Math.round(((sevScore + downtime * 2) / (cumulative.length * 3 + 20)) * 100));

        return { week: label, mttr, mtbf, risk };
    });

    return (
        <div className="min-h-screen bg-[#FAF8F5] pb-16">
            <TopBar title="Analytics" subtitle="Historical trends and recurring failure analysis" />
            <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={card}>
                        <ChartHeader title="MTTR Trend" unit="minutes" desc="Mean time to recover — lower is better" />
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={trendData} margin={{ left: -20, right: 8 }}>
                                <defs>
                                    <linearGradient id="mttrGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FA5A2A" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#FA5A2A" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                <XAxis dataKey="week" tick={axisTick} axisLine={false} tickLine={false} />
                                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} min`, "MTTR"]} />
                                <Area type="monotone" dataKey="mttr" stroke="#FA5A2A" strokeWidth={3} fill="url(#mttrGrad)" dot={{ r: 4, fill: "#fff", stroke: "#FA5A2A", strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={card}>
                        <ChartHeader title="MTBF Trend" unit="hours" desc="Mean time between failures — higher is better" />
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={trendData} margin={{ left: -20, right: 8 }}>
                                <defs>
                                    <linearGradient id="mtbfGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                <XAxis dataKey="week" tick={axisTick} axisLine={false} tickLine={false} />
                                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}h`, "MTBF"]} />
                                <Area type="monotone" dataKey="mtbf" stroke="#10B981" strokeWidth={3} fill="url(#mtbfGrad)" dot={{ r: 4, fill: "#fff", stroke: "#10B981", strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={card}>
                    <ChartHeader title="Operational Risk Index Trend" desc="Lower risk score indicates better operational health" />
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={trendData} margin={{ left: -20, right: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis dataKey="week" tick={axisTick} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}/100`, "Risk Index"]} />
                            <Line type="monotone" dataKey="risk" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: "#fff", stroke: "#8B5CF6", strokeWidth: 2 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className={card}>
                    <ChartHeader title="Incident Frequency by Component" desc="Stacked by severity" />
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={frequencyData} margin={{ left: -20, right: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis dataKey="component" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                            <YAxis tick={axisTick} allowDecimals={false} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(250,90,42,0.05)" }} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="critical" name="Critical" stackId="a" fill="#EF4444" />
                            <Bar dataKey="high" name="High" stackId="a" fill="#FA5A2A" />
                            <Bar dataKey="medium" name="Medium" stackId="a" fill="#F59E0B" />
                            <Bar dataKey="low" name="Low" stackId="a" fill="#CBD5E1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className={card}>
                    <ChartHeader title="Recurring Failure Patterns" desc="Components with repeated incident history — high risk scores need attention" />
                    <div className="flex flex-col gap-4">
                        {recurringPatterns.map((p) => (
                            <div key={p.component} className="grid grid-cols-2 sm:grid-cols-[160px_90px_1fr_90px] items-center gap-3 sm:gap-4">
                                <span className="text-sm font-bold text-[#111827] truncate">{p.component}</span>
                                <span className="text-xs text-neutral-500">{p.occurrences} incident{p.occurrences === 1 ? "" : "s"}</span>
                                <div className="col-span-2 sm:col-span-1 order-last sm:order-none"><RiskBar value={p.riskScore} /></div>
                                <span className="text-[11px] text-neutral-400 text-right">last: {p.lastOccurrence}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
