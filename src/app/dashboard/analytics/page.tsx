"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, AreaChart, Area
} from "recharts";
import { AlertTriangle } from "lucide-react";

function RiskBar({ value }: { value: number }) {
    const color = value >= 70 ? "#EF4444" : value >= 40 ? "#F59E0B" : "#22C55E";
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color, width: 28, textAlign: "right" }}>{value}</span>
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

    if (!workspaceId) return <div style={{ padding: 40, color: "var(--cl-foreground)" }}>Loading...</div>;
    if (loading) return <div style={{ padding: 40, color: "var(--cl-foreground)" }}>Loading analytics...</div>;

    if (incidents.length === 0) {
        return (
            <div>
                <TopBar title="Analytics" subtitle="Historical trends and recurring failure analysis" />
                <div style={{ padding: "60px 20px", textAlign: "center", background: "var(--cl-muted)", border: "1px dashed var(--cl-border)", borderRadius: 16, margin: 24 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                        <AlertTriangle size={32} color="#60A5FA" />
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--cl-foreground)", marginBottom: 8 }}>No data available yet</h2>
                    <p style={{ fontSize: 14, color: "var(--cl-muted-foreground)", maxWidth: 400, margin: "0 auto 24px", lineHeight: 1.6 }}>Analytics will populate once you start logging incidents for this workspace.</p>
                </div>
            </div>
        );
    }

    const compMap = new Map<string, any>();
    incidents.forEach(inc => {
        const comp = inc.systemComponent || "General";
        if (!compMap.has(comp)) compMap.set(comp, { component: comp, p: 0, s: 0, h: 0, c: 0, count: 0 });
        const entry = compMap.get(comp);
        entry.count++;
        if (inc.environment === "production") entry.p++;
        else if (inc.environment === "staging") entry.s++;
        else entry.c++;
        if (inc.severity === "high" || inc.severity === "critical") entry.h++;
    });

    const frequencyData = Array.from(compMap.values());
    const recurringPatterns = frequencyData.map(f => ({
        component: f.component,
        occurrences: f.count,
        riskScore: Math.min(100, f.count * 15 + f.h * 20),
        lastOccurrence: "Recent"
    })).sort((a, b) => b.occurrences - a.occurrences);

    // Generate actual cumulative trend data
    const trendMap = new Map<string, any[]>();
    incidents.forEach(inc => {
        const d = new Date(inc.detectedAt);
        const dayStr = `${d.getMonth() + 1}/${d.getDate()}`;
        if (!trendMap.has(dayStr)) trendMap.set(dayStr, []);
        trendMap.get(dayStr)!.push(inc);
    });

    const sortedDays = Array.from(trendMap.keys()).sort((a, b) => {
        const [am, ad] = a.split('/').map(Number);
        const [bm, bd] = b.split('/').map(Number);
        return am === bm ? ad - bd : am - bm;
    });

    let cumulative: any[] = [];
    const realTrendData = sortedDays.map(day => {
        cumulative = cumulative.concat(trendMap.get(day));

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

        const sevScore = cumulative.reduce((acc, i) => acc + (i.severity === 'critical' ? 3 : i.severity === 'high' ? 2 : i.severity === 'medium' ? 1 : 0.5), 0);
        const downtime = Math.min(cumulative.reduce((acc, i) => acc + (i.downtimeMinutes || 0), 0) / 1440, 10);
        const risk = Math.min(100, Math.round(((sevScore + downtime * 2) / (cumulative.length * 3 + 20)) * 100));

        return { week: day, mttr, mtbf, risk };
    });

    const mttrTrend = realTrendData.length > 0 ? realTrendData : [{ week: "Current", mttr: 0 }];
    const mtbfTrend = realTrendData.length > 0 ? realTrendData : [{ week: "Current", mtbf: 0 }];
    const riskTrend = realTrendData.length > 0 ? realTrendData : [{ week: "Current", risk: 0 }];
    return (
        <div>
            <TopBar title="Analytics" subtitle="Historical trends and recurring failure analysis" />
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

                {/* MTTR & MTBF Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div className="chart-card">
                        <h3 className="chart-title">MTTR Trend <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 400 }}>(minutes)</span></h3>
                        <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>Mean time to recover — lower is better</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={mttrTrend}>
                                <defs>
                                    <linearGradient id="mttrGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} formatter={(v) => [`${v} min`, "MTTR"]} />
                                <Area type="monotone" dataKey="mttr" stroke="#2563EB" strokeWidth={2.5} fill="url(#mttrGrad)" dot={{ r: 3, fill: "#2563EB" }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">MTBF Trend <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 400 }}>(hours)</span></h3>
                        <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>Mean time between failures — higher is better</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={mtbfTrend}>
                                <defs>
                                    <linearGradient id="mtbfGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} formatter={(v) => [`${v}h`, "MTBF"]} />
                                <Area type="monotone" dataKey="mtbf" stroke="#22C55E" strokeWidth={2.5} fill="url(#mtbfGrad)" dot={{ r: 3, fill: "#22C55E" }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Risk Index Trend */}
                <div className="chart-card">
                    <h3 className="chart-title">Operational Risk Index Trend</h3>
                    <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>Lower risk score indicates better operational health</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={riskTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} formatter={(v) => [`${v}/100`, "Risk Index"]} />
                            <Line type="monotone" dataKey="risk" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 3, fill: "#7C3AED" }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Incident Frequency by Component */}
                <div className="chart-card">
                    <h3 className="chart-title">Incident Frequency by Component</h3>
                    <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>Stacked by environment type</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={frequencyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="component" tick={{ fontSize: 12, fill: "#475569" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="p" name="Production" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="h" name="High Sev" stackId="a" fill="#F97316" />
                            <Bar dataKey="s" name="Staging" stackId="a" fill="#F59E0B" />
                            <Bar dataKey="c" name="Dev" stackId="a" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Recurring Patterns */}
                <div className="chart-card">
                    <h3 className="chart-title">🔁 Recurring Failure Patterns</h3>
                    <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 16 }}>Components with repeated incident history — high risk scores require immediate attention</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {recurringPatterns.map((p) => (
                            <div key={p.component} style={{ display: "grid", gridTemplateColumns: "160px 80px 1fr 100px", alignItems: "center", gap: 16 }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{p.component}</span>
                                <span style={{ fontSize: 12, color: "#64748B" }}>{p.occurrences} incidents</span>
                                <RiskBar value={p.riskScore} />
                                <span style={{ fontSize: 11, color: "#94A3B8", textAlign: "right" }}>last: {p.lastOccurrence}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .chart-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; }
        .chart-title { font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 4px; }
      `}</style>
        </div>
    );
}
