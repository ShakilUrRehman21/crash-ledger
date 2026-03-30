"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { ShieldAlert, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

const COMPONENTS = ["Database", "API Gateway", "Auth Service", "Worker Queue", "CDN / Edge", "Image Processor", "Other"];
const SEVERITIES = [
    { value: "critical", label: "Critical (P0) — System down" },
    { value: "high", label: "High (P1) — Major feature broken" },
    { value: "medium", label: "Medium (P2) — Degraded" },
    { value: "low", label: "Low (P3) — Minor / warning" },
];

export default function NewIncidentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: "", severity: "high", environment: "production",
        systemComponent: "API Gateway", description: "", downtimeMinutes: 0, impactCost: 0,
    });
    const [error, setError] = useState("");
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);

    useEffect(() => {
        const id = localStorage.getItem("cl_workspace_id");
        if (id) setWorkspaceId(id);
    }, []);

    function handleChange(field: string, value: any) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setError("");
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!workspaceId) return setError("Workspace not found.");
        if (!form.title.trim()) return setError("Title is required.");
        if (!form.description.trim()) return setError("Description is required.");

        setLoading(true);
        try {
            const res = await fetch("/api/incidents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    workspaceId,
                    downtimeMinutes: Number(form.downtimeMinutes) || 0,
                    impactCost: Number(form.impactCost) || 0
                })
            });

            const data = await res.json();
            if (!res.ok) {
                let errMsg = "Failed to create incident";
                if (data.error) {
                    if (typeof data.error === "string") errMsg = data.error;
                    else if (data.error.formErrors?.[0]) errMsg = data.error.formErrors[0];
                    else if (data.error.fieldErrors && Object.keys(data.error.fieldErrors).length > 0) {
                        const firstField = Object.keys(data.error.fieldErrors)[0];
                        errMsg = `${firstField}: ${data.error.fieldErrors[firstField][0]}`;
                    }
                }
                setError(errMsg);
                setLoading(false);
                return;
            }

            router.push(`/dashboard/incidents/${data.incident.id}`);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    }

    return (
        <div style={{ background: "var(--cl-background)", minHeight: "100vh" }}>
            <TopBar title="New Incident" subtitle="Report a system failure or outage" showCreateIncident={false} />
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
                <Link href="/dashboard/incidents" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--cl-muted-foreground)", textDecoration: "none", marginBottom: 24 }}>
                    <ArrowLeft size={14} /> Back to incidents
                </Link>

                <div style={{ background: "var(--cl-muted)", border: "1px solid var(--cl-border)", borderRadius: 16, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(220, 38, 38, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(220, 38, 38, 0.3)" }}>
                            <ShieldAlert size={20} color="#EF4444" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--cl-foreground)" }}>Report New Incident</h2>
                            <p style={{ fontSize: 13, color: "var(--cl-muted-foreground)", marginTop: 2 }}>Fills immediately into your incidents list</p>
                        </div>
                    </div>

                    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Title */}
                        <div>
                            <label style={labelStyle}>Incident Title *</label>
                            <input
                                required value={form.title} onChange={(e) => handleChange("title", e.target.value)}
                                placeholder="e.g. Database connection timeouts in production"
                                style={inputStyle}
                                onFocus={(e) => (e.target.style.borderColor = "#60A5FA")}
                                onBlur={(e) => (e.target.style.borderColor = "var(--cl-border)")}
                            />
                        </div>

                        {/* Severity + Environment */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <label style={labelStyle}>Severity *</label>
                                <select value={form.severity} onChange={(e) => handleChange("severity", e.target.value)} style={inputStyle}>
                                    {SEVERITIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Environment *</label>
                                <select value={form.environment} onChange={(e) => handleChange("environment", e.target.value)} style={inputStyle}>
                                    {["production", "staging", "dev"].map((v) => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Component */}
                        <div>
                            <label style={labelStyle}>Affected System Component *</label>
                            <select value={form.systemComponent} onChange={(e) => handleChange("systemComponent", e.target.value)} style={inputStyle}>
                                {COMPONENTS.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label style={labelStyle}>Description *</label>
                            <textarea
                                required rows={4} value={form.description} onChange={(e) => handleChange("description", e.target.value)}
                                placeholder="Describe the symptoms, impact, and what you know so far..."
                                style={{ ...inputStyle, resize: "vertical" }}
                                onFocus={(e) => (e.target.style.borderColor = "#60A5FA")}
                                onBlur={(e) => (e.target.style.borderColor = "var(--cl-border)")}
                            />
                        </div>

                        {/* Downtime + Cost */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <label style={labelStyle}>Estimated Downtime (minutes)</label>
                                <input type="number" min={0} value={form.downtimeMinutes || ""} onChange={(e) => handleChange("downtimeMinutes", e.target.value)} placeholder="0" style={inputStyle}
                                    onFocus={(e) => (e.target.style.borderColor = "#60A5FA")} onBlur={(e) => (e.target.style.borderColor = "var(--cl-border)")} />
                            </div>
                            <div>
                                <label style={labelStyle}>Estimated Impact Cost (USD)</label>
                                <input type="number" min={0} value={form.impactCost || ""} onChange={(e) => handleChange("impactCost", e.target.value)} placeholder="0" style={inputStyle}
                                    onFocus={(e) => (e.target.style.borderColor = "#60A5FA")} onBlur={(e) => (e.target.style.borderColor = "var(--cl-border)")} />
                            </div>
                        </div>

                        {/* Severity preview */}
                        <div style={{ background: form.severity === "critical" ? "rgba(239, 68, 68, 0.15)" : form.severity === "high" ? "rgba(249, 115, 22, 0.15)" : form.severity === "medium" ? "rgba(245, 158, 11, 0.15)" : "var(--cl-muted)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "var(--cl-foreground)" }}>
                            ⚡ This will be created as an <strong>{form.severity.toUpperCase()}</strong> severity incident in <strong>{form.environment}</strong>.
                        </div>

                        {error && <p style={{ fontSize: 13, color: "#EF4444", fontWeight: 500 }}>⚠ {error}</p>}

                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                            <button type="button" onClick={() => router.push("/dashboard/incidents")} style={{ padding: "10px 20px", border: "1px solid var(--cl-border)", background: "var(--cl-muted)", color: "var(--cl-foreground)", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} style={{ padding: "10px 28px", border: "none", background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: loading ? 0.7 : 1 }}>
                                <Plus size={16} /> {loading ? "Creating…" : "Create Incident"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--cl-muted-foreground)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" };
const inputStyle: React.CSSProperties = { width: "100%", border: "1px solid var(--cl-border)", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", background: "var(--cl-background)", color: "var(--cl-foreground)", transition: "border 0.15s" };
