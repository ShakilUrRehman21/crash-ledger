"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Trash2, Mail, UserCheck, Crown, Shield, Eye, Check, Lock } from "lucide-react";

const TABS = ["Members", "Workspace", "Billing", "Danger Zone"] as const;
type Tab = typeof TABS[number];

const ROLE_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
    owner: { icon: Crown, color: "#D97706", bg: "#FFFBEB" },
    admin: { icon: Shield, color: "#7C3AED", bg: "#F5F3FF" },
    engineer: { icon: UserCheck, color: "#2563EB", bg: "#EFF6FF" },
    viewer: { icon: Eye, color: "#64748B", bg: "#F1F5F9" },
};

const AVATAR_COLORS = ["#FA5A2A", "#10B981", "#0EA5E9", "#8B5CF6", "#F59E0B"];

const card = "bg-white rounded-2xl border border-[#EFE9E1] shadow-sm";
const inputCls = "w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-[#FAF8F5] text-sm text-[#111827] focus:outline-none focus:border-[#FA5A2A] focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed";
const labelCls = "block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2";

function RoleBadge({ role }: { role: string }) {
    const cfg = ROLE_ICONS[role] ?? ROLE_ICONS.viewer;
    const Icon = cfg.icon;
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize" style={{ background: cfg.bg, color: cfg.color }}>
            <Icon className="w-3 h-3" /> {role}
        </span>
    );
}

function Avatar({ name, index }: { name: string; index: number }) {
    const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
    const initials = (name || "?").split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
    return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0" style={{ background: color + "20", border: `2px solid ${color}50`, color }}>
            {initials}
        </div>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("Members");
    const [members, setMembers] = useState<any[]>([]);
    const [membersLoading, setMembersLoading] = useState(true);
    const [wsName, setWsName] = useState("");
    const [wsSlug, setWsSlug] = useState("");
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        try {
            const savedWs = localStorage.getItem("cl_workspace");
            if (savedWs) {
                const { name, slug } = JSON.parse(savedWs);
                setWsName(name || "");
                setWsSlug(slug || "");
            }
        } catch { /* ignore */ }
        const id = localStorage.getItem("cl_workspace_id");
        if (id) setWorkspaceId(id);
        else setMembersLoading(false);
    }, []);

    useEffect(() => {
        if (!workspaceId) return;
        fetch(`/api/workspace/members?workspaceId=${workspaceId}`)
            .then((r) => r.json())
            .then((d) => {
                if (d.members) setMembers(d.members);
                setMembersLoading(false);
            })
            .catch(() => setMembersLoading(false));
    }, [workspaceId]);

    async function deleteWorkspace() {
        if (!workspaceId) return setDeleteError("No workspace selected");
        if (!confirm("Are you absolutely sure you want to delete this workspace? This cannot be undone.")) return;
        setIsDeleting(true);
        setDeleteError("");
        try {
            const res = await fetch(`/api/workspace/${workspaceId}`, { method: "DELETE" });
            if (res.ok) {
                localStorage.removeItem("cl_workspace_id");
                localStorage.removeItem("cl_workspace");
                router.push("/workspace-select");
            } else {
                const data = await res.json().catch(() => ({}));
                setDeleteError(typeof data.error === "string" ? data.error : "Failed to delete workspace");
            }
        } catch {
            setDeleteError("An error occurred");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#FAF8F5] pb-16">
            <TopBar title="Settings" subtitle="Manage your workspace" />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">

                <div className="flex flex-wrap gap-1 p-1 mb-6 bg-white border border-[#EFE9E1] rounded-full shadow-sm w-fit">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${tab === t
                                ? t === "Danger Zone" ? "bg-red-500 text-white shadow-md shadow-red-500/25" : "bg-[#FA5A2A] text-white shadow-md shadow-[#FA5A2A]/25"
                                : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {tab === "Members" && (
                    <div className="space-y-5">
                        <div className={`${card} p-6`}>
                            <h3 className="text-base font-bold text-[#111827] font-heading mb-1">Invite Team Member</h3>
                            <p className="text-xs text-neutral-500 mb-4">Email invitations aren&apos;t available yet. Members appear here once they join this workspace.</p>
                            <div className="flex gap-3 flex-wrap opacity-60">
                                <div className="flex-1 min-w-[200px] flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 bg-[#FAF8F5]">
                                    <Mail className="w-4 h-4 text-neutral-400" />
                                    <input disabled type="email" placeholder="colleague@company.com" className="bg-transparent outline-none text-sm w-full cursor-not-allowed" />
                                </div>
                                <button disabled className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-neutral-200 text-neutral-500 cursor-not-allowed">
                                    <Lock className="w-3.5 h-3.5" /> Coming soon
                                </button>
                            </div>
                        </div>

                        <div className={`${card} overflow-hidden`}>
                            <div className="px-6 py-4 border-b border-neutral-100 bg-[#FAF8F5]/60">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Team Members ({members.length})</h3>
                            </div>
                            {membersLoading ? (
                                <div className="p-6 text-sm text-neutral-400">Loading members...</div>
                            ) : members.length === 0 ? (
                                <div className="p-6 text-sm text-neutral-400">No members found.</div>
                            ) : (
                                members.map((m, i) => (
                                    <div key={m.id} className={`flex items-center gap-4 px-6 py-4 hover:bg-neutral-50/70 transition-colors ${i < members.length - 1 ? "border-b border-neutral-100" : ""}`}>
                                        <Avatar name={m.fullName || m.email} index={i} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-[#111827] truncate">{m.fullName || m.email}</p>
                                            <p className="text-xs text-neutral-500 truncate">
                                                {m.email}
                                                {m.joinedAt && <span className="text-neutral-400"> · joined {new Date(m.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
                                            </p>
                                        </div>
                                        <RoleBadge role={m.role} />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {tab === "Workspace" && (
                    <div className={`${card} p-6 sm:p-8`}>
                        <h3 className="text-base font-bold text-[#111827] font-heading mb-1">Workspace Details</h3>
                        <p className="text-xs text-neutral-500 mb-6">Renaming a workspace isn&apos;t supported yet.</p>
                        <div className="space-y-5 max-w-md">
                            <div>
                                <label className={labelCls}>Workspace Name</label>
                                <input type="text" value={wsName} disabled className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Workspace Slug</label>
                                <div className="flex">
                                    <span className="px-4 py-2.5 bg-neutral-100 border border-neutral-200 border-r-0 rounded-l-xl text-sm text-neutral-500">crashledger.com/</span>
                                    <input type="text" value={wsSlug} disabled className={`${inputCls} !rounded-l-none`} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "Billing" && (
                    <div className="space-y-5">
                        <div className={`${card} p-6 sm:p-8`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Current Plan</p>
                                    <p className="text-3xl font-extrabold text-[#111827] font-heading">Free Plan</p>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">Active</span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-3">10 incidents/month · up to 5 members · basic analytics</p>
                        </div>

                        <div className="bg-[#121826] text-white rounded-2xl p-6 sm:p-8 shadow-xl">
                            <div className="flex justify-between items-start flex-wrap gap-5">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#FA5A2A] mb-1">Pro</p>
                                    <p className="text-4xl font-extrabold font-heading">$49 <span className="text-base font-medium text-neutral-400">/month</span></p>
                                    <ul className="mt-4 space-y-2.5">
                                        {["Unlimited incidents", "Advanced MTBF & MTTR analytics", "Recurring failure detection", "Priority support", "Export RCA documents"].map((f) => (
                                            <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-200">
                                                <span className="w-5 h-5 rounded-full bg-[#FA5A2A]/20 flex items-center justify-center"><Check className="w-3 h-3 text-[#FA5A2A]" strokeWidth={3} /></span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button disabled className="px-6 py-3 rounded-full text-sm font-bold bg-white/10 text-neutral-400 cursor-not-allowed">
                                    Checkout coming soon
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "Danger Zone" && (
                    <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 sm:p-8">
                        <h3 className="text-base font-bold text-red-600 font-heading mb-1">Danger Zone</h3>
                        <p className="text-xs text-neutral-500 mb-6">These actions are irreversible. Proceed with caution.</p>
                        <div className="flex justify-between items-center gap-5 flex-wrap p-5 rounded-2xl bg-red-50/60 border border-red-100">
                            <div className="flex-1 min-w-[220px]">
                                <p className="text-sm font-bold text-[#111827]">Delete Workspace</p>
                                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">Permanently delete this workspace and all its incidents, members, and analytics.</p>
                            </div>
                            <button
                                onClick={deleteWorkspace}
                                disabled={isDeleting || !workspaceId}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-red-600 border border-red-300 hover:bg-red-500 hover:text-white hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> {isDeleting ? "Deleting..." : "Delete Workspace"}
                            </button>
                        </div>
                        {deleteError && <p className="text-xs font-semibold text-red-500 mt-3">{deleteError}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
