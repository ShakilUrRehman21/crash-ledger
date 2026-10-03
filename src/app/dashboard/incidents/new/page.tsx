"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Plus, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

const COMPONENTS = [
  "Database",
  "API Gateway",
  "Auth Service",
  "Worker Queue",
  "CDN / Edge",
  "Image Processor",
  "Payment Service",
  "Other",
];

const SEVERITIES = [
  { value: "critical", label: "Critical (P0)", desc: "System down or primary user flow blocked" },
  { value: "high", label: "High (P1)", desc: "Major feature broken, no workaround" },
  { value: "medium", label: "Medium (P2)", desc: "Degraded performance or partial issue" },
  { value: "low", label: "Low (P3)", desc: "Minor glitch or cosmetic issue" },
];

export default function NewIncidentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    severity: "high",
    environment: "production",
    systemComponent: "API Gateway",
    description: "",
    downtimeMinutes: 0,
    impactCost: 0,
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
    if (!workspaceId) return setError("Workspace not found. Please select a workspace.");
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
          impactCost: Number(form.impactCost) || 0,
        }),
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
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      <TopBar title="New Incident" subtitle="Log and triage a system outage" showCreateIncident={false} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        <Link
          href="/dashboard/incidents"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-[#FA5A2A] mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to incidents</span>
        </Link>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EFE9E1] shadow-sm">
          
          {/* Card Header */}
          <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-neutral-100">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF2EC] text-[#FA5A2A] flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111827] font-heading">
                Log New Incident
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Creates an active incident record with timeline and RCA enforcement
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Incident Title *
              </label>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g., Primary database connection pool exhaustion on checkout"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-[#FAF8F5] text-sm text-[#111827] placeholder-neutral-400 focus:outline-none focus:border-[#FA5A2A] focus:bg-white transition-all"
              />
            </div>

            {/* Severity Pill Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Severity Level *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SEVERITIES.map(({ value, label, desc }) => {
                  const isSelected = form.severity === value;
                  return (
                    <div
                      key={value}
                      onClick={() => handleChange("severity", value)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#FA5A2A] bg-[#FFF2EC]/70 shadow-sm"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isSelected ? "text-[#FA5A2A]" : "text-neutral-800"}`}>
                          {label}
                        </span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#FA5A2A]" />}
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-tight">{desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Environment + System Component */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Environment *
                </label>
                <select
                  value={form.environment}
                  onChange={(e) => handleChange("environment", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-[#FAF8F5] text-sm text-[#111827] focus:outline-none focus:border-[#FA5A2A] cursor-pointer"
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="dev">Development</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  System Component *
                </label>
                <select
                  value={form.systemComponent}
                  onChange={(e) => handleChange("systemComponent", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-[#FAF8F5] text-sm text-[#111827] focus:outline-none focus:border-[#FA5A2A] cursor-pointer"
                >
                  {COMPONENTS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Incident Description *
              </label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe what occurred, customer impact, error messages, and immediate mitigation attempts..."
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-[#FAF8F5] text-sm text-[#111827] placeholder-neutral-400 focus:outline-none focus:border-[#FA5A2A] focus:bg-white transition-all resize-y"
              />
            </div>

            {/* Downtime + Impact Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Downtime (minutes)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.downtimeMinutes || ""}
                  onChange={(e) => handleChange("downtimeMinutes", e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-[#FAF8F5] text-sm text-[#111827] placeholder-neutral-400 focus:outline-none focus:border-[#FA5A2A] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Estimated Impact Cost (USD)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.impactCost || ""}
                  onChange={(e) => handleChange("impactCost", e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-[#FAF8F5] text-sm text-[#111827] placeholder-neutral-400 focus:outline-none focus:border-[#FA5A2A] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => router.push("/dashboard/incidents")}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#FA5A2A] to-[#FF7A00] hover:opacity-95 shadow-md shadow-[#FA5A2A]/25 disabled:opacity-50 transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{loading ? "Logging Incident..." : "Create Incident"}</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
