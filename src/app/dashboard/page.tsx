"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
    AlertTriangle, Clock, TrendingDown, Zap, AlertCircle, Timer
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { formatHours, formatMinutes } from "@/lib/utils";
import Link from "next/link";

const SEVERITY_COLORS: Record<string, string> = { critical: "#EF4444", high: "#F97316", medium: "#F59E0B", low: "#94A3B8" };
const STATUS_COLORS: Record<string, string> = { open: "#2563EB", investigating: "#F59E0B", resolved: "#22C55E", archived: "#94A3B8" };

function StatCard({ label, value, sub, icon: Icon, iconBg }: { label: string; value: string | number; sub?: string; icon: any; iconBg: string; }) {
    return (
        <div className="stat-card">
            <div className="stat-header">
                <p className="stat-label">{label}</p>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 12px ${iconBg}60` }}>
                    <Icon size={18} color="#fff" />
                </div>
            </div>
            <p className="stat-value">{value}</p>
            {sub && <p className="stat-sub">{sub}</p>}
            <style jsx>{`
        .stat-card { background: var(--cl-muted); border: 1px solid var(--cl-border); border-radius: 16px; padding: 24px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); position: relative; overflow: hidden; }
        .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); }
        .stat-card:hover { border-color: var(--cl-border-glow); box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 16px var(--cl-border-glow); transform: translateY(-2px); }
        .stat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .stat-label { font-size: 13px; font-weight: 500; color: var(--cl-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-value { font-size: 28px; font-weight: 800; color: var(--cl-foreground); line-height: 1; margin-bottom: 4px; font-family: 'Space Grotesk', sans-serif; }
        .stat-sub { font-size: 12px; color: var(--cl-muted-foreground); opacity: 0.8; }
      `}</style>
        </div>
    );
}

function RiskGauge({ value }: { value: number }) {
    const color = value >= 70 ? "#EF4444" : value >= 40 ? "#F59E0B" : "#22C55E";
    const label = value >= 70 ? "High Risk" : value >= 40 ? "Moderate" : "Low Risk";
    return (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 12px", filter: `drop-shadow(0 0 10px ${color}40)` }}>
                <svg viewBox="0 0 140 140" width="140" height="140">
                    <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    <circle
                        cx="70" cy="70" r="58" fill="none" stroke={color} strokeWidth="12"
                        strokeDasharray={`${(value / 100) * 364.4} 364.4`}
                        strokeLinecap="round"
                        transform="rotate(-90 70 70)"
                        style={{ transition: "stroke-dasharray 0.8s ease" }}
                    />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</span>
                    <span style={{ fontSize: 11, color: "var(--cl-muted-foreground)" }}>/ 100</span>
                </div>
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color }}>{label}</p>
            <p style={{ fontSize: 12, color: "var(--cl-muted-foreground)", marginTop: 2 }}>Op. Risk Index</p>
        </div>
    );
}

export default function DashboardPage() {
    const [allIncidents, setAllIncidents] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [severityDist, setSeverityDist] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [workspaceId, setWorkspaceId] = useState<string | null>(null);

    useEffect(() => {
        const id = localStorage.getItem("cl_workspace_id");
        if (id) setWorkspaceId(id);
    }, []);

    useEffect(() => {
        if (!workspaceId) return;

        Promise.all([
            fetch(`/api/dashboard/metrics?workspaceId=${workspaceId}`).then(res => res.json()),
            fetch(`/api/incidents?workspaceId=${workspaceId}`).then(res => res.json())
        ]).then(([metricsData, incidentsData]) => {
            if (metricsData.metrics) {
                setMetrics(metricsData.metrics);
                setTrendData(metricsData.trendData || []);
                setSeverityDist(metricsData.severityDist || null);
            }
            if (incidentsData.incidents) {
                setAllIncidents(incidentsData.incidents);
            }
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [workspaceId]);

    if (!workspaceId) {
        return <div style={{ padding: 40, color: "var(--cl-foreground)", textAlign: "center" }}>No workspace selected. Please select a workspace.</div>;
    }

    if (loading || !metrics) {
        return <div style={{ padding: 40, color: "var(--cl-foreground)", textAlign: "center" }}>Loading dashboard metrics...</div>;
    }

    // Extrapolate downtime from incidents
    const downtimeMap = allIncidents.reduce((acc, i) => {
        if (i.downtimeMinutes > 0) {
            acc[i.systemComponent] = (acc[i.systemComponent] || 0) + i.downtimeMinutes;
        }
        return acc;
    }, {} as Record<string, number>);
    const downtimeData = Object.entries(downtimeMap)
        .map(([component, minutes]) => ({ component, minutes: minutes as number }))
        .sort((a, b) => b.minutes - a.minutes);

    const riskTrendMap = new Map<string, any[]>();
    allIncidents.forEach(inc => {
        const d = new Date(inc.detectedAt);
        const dayStr = `${d.getMonth() + 1}/${d.getDate()}`;
        if (!riskTrendMap.has(dayStr)) riskTrendMap.set(dayStr, []);
        riskTrendMap.get(dayStr)!.push(inc);
    });

    const sortedRiskDays = Array.from(riskTrendMap.keys()).sort((a, b) => {
        const [am, ad] = a.split('/').map(Number);
        const [bm, bd] = b.split('/').map(Number);
        return am === bm ? ad - bd : am - bm;
    });

    let cumRisk: any[] = [];
    const localRiskTrend = sortedRiskDays.map(day => {
        cumRisk = cumRisk.concat(riskTrendMap.get(day));
        const sevScore = cumRisk.reduce((acc, i) => acc + (i.severity === 'critical' ? 3 : i.severity === 'high' ? 2 : i.severity === 'medium' ? 1 : 0.5), 0);
        const downtime = Math.min(cumRisk.reduce((acc, i) => acc + (i.downtimeMinutes || 0), 0) / 1440, 10);
        const risk = Math.min(100, Math.round(((sevScore + downtime * 2) / (cumRisk.length * 3 + 20)) * 100));
        return { date: day, risk };
    });

    const severityData = [
        { name: "Critical", value: severityDist?.critical || 0, color: "#EF4444" },
        { name: "High", value: severityDist?.high || 0, color: "#F97316" },
        { name: "Medium", value: severityDist?.medium || 0, color: "#F59E0B" },
        { name: "Low", value: severityDist?.low || 0, color: "#94A3B8" },
    ].filter(d => d.value > 0);

    return (
        <div>
            <TopBar title="Dashboard" subtitle="Operational health overview" showCreateIncident workspaceId={workspaceId} />
            <div className="page-body">
                {/* Stat Grid */}
                <div className="stat-grid">
                    <StatCard label="Total Incidents" value={metrics.totalIncidents} sub="All time logs" icon={AlertTriangle} iconBg="#2563EB" />
                    <StatCard label="Open Incidents" value={metrics.openIncidents} sub={metrics.investigatingIncidents > 0 ? `+ ${metrics.investigatingIncidents} investigating` : "Needs attention"} icon={AlertCircle} iconBg="#EF4444" />
                    <StatCard label="Critical" value={metrics.criticalIncidents} sub={`${metrics.totalIncidents > 0 ? (metrics.criticalIncidentRatio * 100).toFixed(1) : "0.0"}% of total`} icon={Zap} iconBg="#7C3AED" />
                    <StatCard label="MTTR" value={metrics.mttr !== null ? formatMinutes(metrics.mttr) : "—"} sub={metrics.mttr === null ? "Need 1 resolved incident" : "Mean time to recover"} icon={Timer} iconBg="#F59E0B" />
                    <StatCard label="MTBF" value={metrics.mtbf !== null ? formatHours(metrics.mtbf) : "—"} sub={metrics.mtbf === null ? "Need 2 total incidents" : "Mean hours between failures"} icon={Clock} iconBg="#22C55E" />
                    <StatCard label="Total Downtime" value={formatMinutes(metrics.totalDowntimeMinutes || 0)} sub="Cumulative outage minutes" icon={TrendingDown} iconBg="#94A3B8" />
                </div>

                {allIncidents.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--cl-muted)", border: "1px dashed var(--cl-border)", borderRadius: 16, marginTop: 24 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            <AlertTriangle size={32} color="#60A5FA" />
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--cl-foreground)", marginBottom: 8 }}>No incidents reported yet</h2>
                        <p style={{ fontSize: 14, color: "var(--cl-muted-foreground)", maxWidth: 400, margin: "0 auto 24px", lineHeight: 1.6 }}>Your dashboard analytics will automatically populate once you start logging incidents for this workspace.</p>
                        <Link href="/dashboard/incidents/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#2563EB", color: "#fff", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "all 0.2s" }}>
                            Create your first incident
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Charts Row */}
                        <div className="charts-row">
                            {/* Risk Trend */}
                            <div className="chart-card large">
                                <h3 className="chart-title">Operational Risk Trend (Cumulative)</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={localRiskTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--cl-muted-foreground)" }} axisLine={false} tickLine={false} />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--cl-muted-foreground)" }} allowDecimals={false} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: 8, background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13 }} formatter={(v: any) => [`${v}/100`, "Risk Score"]} />
                                        <Line type="monotone" dataKey="risk" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4, fill: "#060B19", stroke: "#7C3AED", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#C4B5FD" }} name="Risk Score" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Risk Gauge + Severity Pie */}
                            <div className="chart-card small">
                                <h3 className="chart-title">Risk Index</h3>
                                <RiskGauge value={metrics.operationalRiskIndex || 0} />
                            </div>

                            <div className="chart-card small">
                                <h3 className="chart-title">Severity Split</h3>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={severityData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                                            {severityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: 8, background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 12 }} />
                                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "var(--cl-muted-foreground)" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Downtime Chart */}
                        {downtimeData.length > 0 && (
                            <div className="chart-card full">
                                <h3 className="chart-title">Downtime by Component (minutes)</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={downtimeData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 12, fill: "var(--cl-muted-foreground)" }} axisLine={false} tickLine={false} />
                                        <YAxis type="category" dataKey="component" tick={{ fontSize: 12, fill: "var(--cl-muted-foreground)" }} width={110} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ borderRadius: 8, background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13 }} />
                                        <Bar dataKey="minutes" fill="#8B5CF6" radius={[0, 4, 4, 0]} name="Downtime (min)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Recent Incidents */}
                        <div className="chart-card full">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                <h3 className="chart-title" style={{ marginBottom: 0 }}>Recent Incidents</h3>
                                <Link href="/dashboard/incidents" style={{ fontSize: 13, color: "#60A5FA", fontWeight: 500, textDecoration: "none" }}>View all →</Link>
                            </div>
                            <table className="incidents-table">
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: 12 }}>Title</th><th>Severity</th><th>Status</th><th>Component</th><th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allIncidents.slice(0, 5).map((inc) => (
                                        <tr key={inc.id}>
                                            <td style={{ paddingLeft: 12 }}>
                                                <Link href={`/dashboard/incidents/${inc.id}`} style={{ color: "var(--cl-foreground)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                                                    {inc.title}
                                                </Link>
                                            </td>
                                            <td>
                                                <span className="badge" style={{ background: SEVERITY_COLORS[inc.severity] + "20", color: SEVERITY_COLORS[inc.severity], border: `1px solid ${SEVERITY_COLORS[inc.severity]}40` }}>
                                                    {inc.severity}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge" style={{ background: STATUS_COLORS[inc.status] + "20", color: STATUS_COLORS[inc.status], border: `1px solid ${STATUS_COLORS[inc.status]}40` }}>
                                                    {inc.status}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: 13, color: "var(--cl-muted-foreground)" }}>{inc.systemComponent}</td>
                                            <td style={{ fontSize: 12, color: "var(--cl-muted-foreground)" }}>
                                                {new Date(inc.detectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
        .page-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr) 1fr 1fr 1fr; gap: 16px; }
        .charts-row { display: grid; grid-template-columns: 1fr 220px 220px; gap: 16px; }
        .chart-card { background: var(--cl-muted); border: 1px solid var(--cl-border); border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: all 0.3s ease; position: relative; overflow: hidden; }
        .chart-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent); }
        .chart-card:hover { transform: translateY(-2px); border-color: var(--cl-border-glow); box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 16px var(--cl-border-glow); }
        .chart-card.full { width: 100%; }
        .chart-title { font-size: 15px; font-weight: 700; color: var(--cl-foreground); margin-bottom: 20px; letter-spacing: -0.01em; font-family: 'Space Grotesk', sans-serif; }
        .incidents-table { width: 100%; border-collapse: collapse; margin-left: -12px; width: calc(100% + 24px); }
        .incidents-table th { font-size: 11px; font-weight: 600; color: var(--cl-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; padding: 0 12px 10px 0; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .incidents-table td { padding: 12px 12px 12px 0; border-bottom: 1px solid rgba(255,255,255,0.02); vertical-align: middle; }
        .incidents-table tr:hover td { background: rgba(255,255,255,0.02); cursor: pointer; }
        .incidents-table tr:last-child td { border-bottom: none; }
        .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
      `}</style>
        </div >
    );
}
