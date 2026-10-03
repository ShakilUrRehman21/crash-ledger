"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
  AlertTriangle,
  Clock,
  TrendingDown,
  Zap,
  AlertCircle,
  Timer,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Users,
  Server
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { formatHours, formatMinutes } from "@/lib/utils";
import Link from "next/link";

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

// Stat Card (Elegent inspired colorful icon chips)
function StatCard({
  label,
  value,
  sub,
  trend,
  trendPositive,
  icon: Icon,
  iconColor,
  iconBg,
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  trendPositive?: boolean;
  icon: any;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#EFE9E1] shadow-sm hover:shadow-md hover:border-[#FA5A2A]/30 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          {label}
        </span>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-heading tracking-tight mb-1">
          {value}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px] ${
                trendPositive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {trendPositive ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
              )}
              {trend}
            </span>
          )}
          {sub && <span className="text-neutral-500 font-medium">{sub}</span>}
        </div>
      </div>
    </div>
  );
}

// Circular Risk Gauge (Image 2 Donut/Progress Style)
function RiskGauge({ value }: { value: number }) {
  const color = value >= 70 ? "#EF4444" : value >= 40 ? "#F59E0B" : "#10B981";
  const label = value >= 70 ? "High Risk" : value >= 40 ? "Moderate" : "Healthy";

  return (
    <div className="text-center py-2">
      <div className="relative w-36 h-36 mx-auto mb-3 flex items-center justify-center">
        <svg viewBox="0 0 140 140" className="w-36 h-36 transform -rotate-90">
          <circle cx="70" cy="70" r="54" fill="none" stroke="#F3F4F6" strokeWidth="12" />
          <circle
            cx="70"
            cy="70"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${(value / 100) * 339.29} 339.29`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-[#111827] font-heading" style={{ color }}>
            {value}
          </span>
          <span className="text-[10px] uppercase font-bold text-neutral-400">out of 100</span>
        </div>
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${color}15`, color }}>
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span>{label}</span>
      </div>
      <p className="text-xs text-neutral-400 font-medium mt-1">Operational Risk Index</p>
    </div>
  );
}

// Custom Tooltip for Chart (Image 2 dark pill tooltip)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] text-white px-3.5 py-2 rounded-xl shadow-xl text-xs font-medium border border-white/10">
        <p className="text-neutral-400 text-[10px] mb-1 font-bold uppercase">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.name}:</span>
            <span className="font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [allIncidents, setAllIncidents] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [severityDist, setSeverityDist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const id = localStorage.getItem("cl_workspace_id");
    if (id) {
      setWorkspaceId(id);
    } else {
      // Fetch default workspace
      fetch("/api/workspace")
        .then(r => r.json())
        .then(d => {
          if (d.workspaces && d.workspaces.length > 0) {
            const first = d.workspaces[0];
            localStorage.setItem("cl_workspace_id", first.id);
            localStorage.setItem("cl_workspace", JSON.stringify({ name: first.name, slug: first.slug }));
            setWorkspaceId(first.id);
          } else {
            setLoading(false);
          }
        })
        .catch(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    if (!workspaceId) return;

    setLoading(true);
    Promise.all([
      fetch(`/api/dashboard/metrics?workspaceId=${workspaceId}`).then(res => res.json()),
      fetch(`/api/incidents?workspaceId=${workspaceId}`).then(res => res.json())
    ])
      .then(([metricsData, incidentsData]) => {
        if (metricsData.metrics) {
          setMetrics(metricsData.metrics);
          setTrendData(metricsData.trendData || []);
          setSeverityDist(metricsData.severityDist || null);
        }
        if (incidentsData.incidents) {
          setAllIncidents(incidentsData.incidents);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [workspaceId]);

  if (!workspaceId && !loading) {
    return (
      <div className="p-12 text-center max-w-md mx-auto mt-20 bg-white rounded-3xl border border-[#EFE9E1] shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF2EC] text-[#FA5A2A] flex items-center justify-center mx-auto mb-4">
          <Server className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#111827] mb-2 font-heading">No Workspace Selected</h2>
        <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
          Please select or create an engineering team workspace to view your reliability telemetry.
        </p>
        <Link
          href="/workspace-select"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#FA5A2A] hover:bg-[#E85022] shadow-md transition-all"
        >
          Select Workspace
        </Link>
      </div>
    );
  }

  if (loading || !metrics) {
    return (
      <div>
        <TopBar title="Dashboard" subtitle="Loading operational health metrics..." />
        <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-neutral-200/60 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-72 bg-neutral-200/60 rounded-2xl" />
            <div className="h-72 bg-neutral-200/60 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Component downtime breakdown
  const downtimeMap = allIncidents.reduce((acc, i) => {
    if (i.downtimeMinutes > 0) {
      acc[i.systemComponent] = (acc[i.systemComponent] || 0) + i.downtimeMinutes;
    }
    return acc;
  }, {} as Record<string, number>);

  const downtimeData = Object.entries(downtimeMap)
    .map(([component, minutes]) => ({ component, minutes: minutes as number }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);

  // Generate dual line chart (Image 2 style: Orange & Mint green lines)
  // Orange line: Incidents detected. Green line: Resolved.
  const dayKey = (d: Date) => d.toDateString();
  const chartDays = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - idx));
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      incidents: allIncidents.filter((i) => dayKey(new Date(i.detectedAt)) === dayKey(d)).length,
      resolved: allIncidents.filter((i) => i.resolvedAt && dayKey(new Date(i.resolvedAt)) === dayKey(d)).length,
    };
  });

  const severityData = [
    { name: "Critical", value: severityDist?.critical || 0, color: "#EF4444" },
    { name: "High", value: severityDist?.high || 0, color: "#FA5A2A" },
    { name: "Medium", value: severityDist?.medium || 0, color: "#F59E0B" },
    { name: "Low", value: severityDist?.low || 0, color: "#94A3B8" },
  ].filter(d => d.value > 0);

  // Pagination for Recent Incidents
  const totalPages = Math.ceil(allIncidents.length / pageSize) || 1;
  const paginatedIncidents = allIncidents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      
      {/* Header */}
      <TopBar
        title="Dashboard"
        subtitle="Operational telemetry & incident velocity"
        showCreateIncident
        workspaceId={workspaceId ?? undefined}
      />

      {/* Main Content Canvas */}
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* TOP STAT METRIC CARDS (Elegent inspired: 6 vibrant cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          
          {/* Card 1: Total Incidents (Sky Blue) */}
          <StatCard
            label="Total Incidents"
            value={metrics.totalIncidents}
            sub="Logged to date"
            icon={AlertTriangle}
            iconColor="#0284C7"
            iconBg="#E0F2FE"
          />

          {/* Card 2: Open Incidents (Coral Red) */}
          <StatCard
            label="Open Incidents"
            value={metrics.openIncidents}
            sub={metrics.investigatingIncidents > 0 ? `+${metrics.investigatingIncidents} in triage` : "All clear"}
            icon={AlertCircle}
            iconColor="#DC2626"
            iconBg="#FEE2E2"
          />

          {/* Card 3: Critical P1 (Warm Orange) */}
          <StatCard
            label="Critical P1"
            value={metrics.criticalIncidents}
            sub={`${metrics.totalIncidents > 0 ? (metrics.criticalIncidentRatio * 100).toFixed(1) : "0"}% of total`}
            icon={Zap}
            iconColor="#FA5A2A"
            iconBg="#FFF2EC"
          />

          {/* Card 4: MTTR (Mint Green) */}
          <StatCard
            label="MTTR"
            value={metrics.mttr !== null ? formatMinutes(metrics.mttr) : "—"}
            sub={metrics.mttr === null ? "Requires 1 resolved" : "Mean recovery time"}
            icon={Timer}
            iconColor="#059669"
            iconBg="#D1FAE5"
          />

          {/* Card 5: MTBF (Royal Purple) */}
          <StatCard
            label="MTBF"
            value={metrics.mtbf !== null ? formatHours(metrics.mtbf) : "—"}
            sub={metrics.mtbf === null ? "Requires 2 incidents" : "Between failures"}
            icon={Clock}
            iconColor="#7C3AED"
            iconBg="#EDE9FE"
          />

          {/* Card 6: Downtime (Amber Gold) */}
          <StatCard
            label="Total Outage"
            value={formatMinutes(metrics.totalDowntimeMinutes || 0)}
            sub="Cumulative minutes"
            icon={TrendingDown}
            iconColor="#D97706"
            iconBg="#FEF3C7"
          />

        </div>

        {allIncidents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#EFE9E1] shadow-sm max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF2EC] text-[#FA5A2A] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-2 font-heading">
              No Incidents Logged Yet
            </h3>
            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
              Your real-time reliability telemetry, MTTR velocity, and recurring failure analysis will appear here as incidents are logged.
            </p>
            <Link
              href={`/dashboard/incidents/new?workspaceId=${workspaceId}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#FA5A2A] to-[#FF7A00] hover:opacity-95 shadow-lg shadow-[#FA5A2A]/25 transition-all"
            >
              Log Your First Incident
            </Link>
          </div>
        ) : (
          <>
            {/* ROW 1: DUAL-LINE VELOCITY CHART + DONUT GAUGES (Image 2 style) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Main Line Chart (8 cols): Wavy curves in Orange & Mint Green */}
              <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#EFE9E1] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-neutral-100 gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[#111827] font-heading">
                      Incident Velocity & Resolution
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Comparing reported failures vs resolved remediations over time
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#FA5A2A]" />
                      <span className="text-neutral-600">Detected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                      <span className="text-neutral-600">Resolved</span>
                    </div>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartDays} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      {/* Orange Line: Detected */}
                      <Line
                        type="monotone"
                        dataKey="incidents"
                        name="Reported Failures"
                        stroke="#FA5A2A"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#FFFFFF", stroke: "#FA5A2A", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#FA5A2A", stroke: "#FFFFFF", strokeWidth: 2 }}
                      />
                      {/* Mint Green Line: Resolved */}
                      <Line
                        type="monotone"
                        dataKey="resolved"
                        name="Resolved & Mitigated"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#FFFFFF", stroke: "#10B981", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#10B981", stroke: "#FFFFFF", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right Gauge (4 cols): Risk Gauge & Donut Split */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Risk Gauge Card */}
                <div className="bg-white rounded-2xl p-6 border border-[#EFE9E1] shadow-sm flex flex-col items-center justify-center">
                  <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                    <span className="text-xs font-bold text-[#111827] uppercase tracking-wider font-heading">
                      Reliability Health
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400">Live Index</span>
                  </div>
                  <RiskGauge value={metrics.operationalRiskIndex || 0} />
                </div>

                {/* Severity Donut Card (Image 2 style) */}
                <div className="bg-white rounded-2xl p-5 border border-[#EFE9E1] shadow-sm">
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-100">
                    <span className="text-xs font-bold text-[#111827] uppercase tracking-wider font-heading">
                      Severity Distribution
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400">Total: {allIncidents.length}</span>
                  </div>
                  <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={severityData.length > 0 ? severityData : [{ name: "Healthy", value: 1, color: "#10B981" }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={42}
                          outerRadius={58}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {(severityData.length > 0 ? severityData : [{ name: "Healthy", value: 1, color: "#10B981" }]).map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-neutral-600 mt-2">
                    {severityData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span>{d.name} ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* ROW 2: RECENT INCIDENTS TABLE WITH IMAGE 2 ELEGENT STYLING */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Table (8 cols): Top Impacted & Recent Outages */}
              <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#EFE9E1] shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
                  <div>
                    <h3 className="text-base font-bold text-[#111827] font-heading">
                      Recent Incidents Ledger
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Chronological log of system failures and mitigation records
                    </p>
                  </div>
                  <Link
                    href="/dashboard/incidents"
                    className="text-xs font-bold text-[#FA5A2A] hover:text-[#E85022] flex items-center gap-1 transition-colors"
                  >
                    <span>View all incidents</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        <th className="pb-3 pl-2">Incident</th>
                        <th className="pb-3 px-2">Severity</th>
                        <th className="pb-3 px-2">Status</th>
                        <th className="pb-3 px-2">Component</th>
                        <th className="pb-3 px-2">Downtime</th>
                        <th className="pb-3 pr-2 text-right">Detected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {paginatedIncidents.map((inc) => {
                        const sevStyle = SEVERITY_COLORS[inc.severity] || SEVERITY_COLORS.low;
                        const statStyle = STATUS_COLORS[inc.status] || STATUS_COLORS.open;

                        return (
                          <tr key={inc.id} className="hover:bg-neutral-50/70 transition-colors group">
                            <td className="py-3.5 pl-2 max-w-[200px] truncate">
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

                            <td className="py-3.5 px-2">
                              <span
                                className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                                style={{
                                  backgroundColor: sevStyle.bg,
                                  color: sevStyle.text,
                                  border: `1px solid ${sevStyle.border}`,
                                }}
                              >
                                {inc.severity}
                              </span>
                            </td>

                            <td className="py-3.5 px-2">
                              <span
                                className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                                style={{
                                  backgroundColor: statStyle.bg,
                                  color: statStyle.text,
                                  border: `1px solid ${statStyle.border}`,
                                }}
                              >
                                {inc.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-2 font-medium text-neutral-600">
                              {inc.systemComponent}
                            </td>

                            <td className="py-3.5 px-2 font-semibold text-neutral-700">
                              {inc.downtimeMinutes > 0 ? formatMinutes(inc.downtimeMinutes) : "None"}
                            </td>

                            <td className="py-3.5 pr-2 text-right text-neutral-400 text-[11px] font-medium">
                              {new Date(inc.detectedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION (Image 2 style with orange active pill) */}
                <div className="flex items-center justify-between pt-5 mt-4 border-t border-neutral-100 text-xs">
                  <span className="text-neutral-400 font-medium">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, allIncidents.length)} of {allIncidents.length} incidents
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Prev
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                            isActive
                              ? "bg-[#FA5A2A] text-white shadow-sm"
                              : "text-neutral-600 hover:bg-neutral-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>

              </div>

              {/* Side Rail (4 cols): Top Impacted Components & Assigned Responders */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Downtime By Component */}
                <div className="bg-white rounded-2xl p-5 border border-[#EFE9E1] shadow-sm">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
                    <span className="text-xs font-bold text-[#111827] uppercase tracking-wider font-heading">
                      Downtime by Component
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400">Minutes</span>
                  </div>

                  {downtimeData.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-6 text-center">No service downtime reported</p>
                  ) : (
                    <div className="space-y-3">
                      {downtimeData.map((d, i) => (
                        <div key={d.component} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-neutral-700">{d.component}</span>
                            <span className="font-bold text-[#FA5A2A]">{d.minutes}m</span>
                          </div>
                          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#FA5A2A] to-[#FF7A00] h-2 rounded-full"
                              style={{ width: `${Math.min(100, (d.minutes / (downtimeData[0]?.minutes || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Breakdown */}
                <div className="bg-white rounded-2xl p-5 border border-[#EFE9E1] shadow-sm">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
                    <span className="text-xs font-bold text-[#111827] uppercase tracking-wider font-heading">
                      Status Breakdown
                    </span>
                  </div>
                  <div className="space-y-3">
                    {(["open", "investigating", "resolved", "archived"] as const).map((s) => {
                      const count = allIncidents.filter((i) => i.status === s).length;
                      const st = STATUS_COLORS[s];
                      return (
                        <div key={s} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold capitalize" style={{ color: st.text }}>{s}</span>
                            <span className="font-bold text-neutral-700">{count}</span>
                          </div>
                          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                            <div className="h-2 rounded-full" style={{ width: `${allIncidents.length ? (count / allIncidents.length) * 100 : 0}%`, backgroundColor: st.text }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}
