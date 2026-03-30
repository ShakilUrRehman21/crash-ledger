"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Users, Trash2, Plus, Mail, UserCheck, Crown, Shield, Eye, Check } from "lucide-react";

const TABS = ["Members", "Workspace", "Billing", "Danger Zone"] as const;
type Tab = typeof TABS[number];

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const ROLE_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
    owner: { icon: Crown, color: "#D97706", bg: "rgba(217, 119, 6, 0.15)" },
    admin: { icon: Shield, color: "#7C3AED", bg: "rgba(124, 58, 237, 0.15)" },
    engineer: { icon: UserCheck, color: "#2563EB", bg: "rgba(37, 99, 235, 0.15)" },
    viewer: { icon: Eye, color: "#64748B", bg: "rgba(100, 116, 139, 0.15)" },
};

function RoleBadge({ role }: { role: string }) {
    const cfg = ROLE_ICONS[role] ?? ROLE_ICONS.viewer;
    const Icon = cfg.icon;
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "capitalize" as const }}>
            <Icon size={10} /> {role}
        </span>
    );
}

function Avatar({ name, color }: { name: string; color: string }) {
    const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase();
    return (
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: color + "20", border: `2px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color }}>
            {initials}
        </div>
    );
}

export default function SettingsPage() {
    const { user } = useUser();
    const [tab, setTab] = useState<Tab>("Members");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("engineer");

    const [members, setMembers] = useState<any[]>([]);
    const [inviteStatus, setInviteStatus] = useState<"idle" | "loading" | "done">("idle");
    const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "done">("idle");
    const [wsName, setWsName] = useState("Acme Engineering");
    const [wsSlug, setWsSlug] = useState("acme-engineering");
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        try {
            const savedMem = localStorage.getItem("cl_members");
            let loadedMembers = null;
            if (savedMem) {
                loadedMembers = JSON.parse(savedMem);
                // Cache buster for old UI mock data
                if (loadedMembers.some((m: any) => m.email === "alex@acme.com" || m.email === "maria@acme.com")) {
                    loadedMembers = null;
                    localStorage.removeItem("cl_members");
                }
            }

            if (loadedMembers) {
                setMembers(loadedMembers);
            } else if (user) {
                const owner = {
                    id: user.id,
                    name: user.fullName || "User",
                    email: user.primaryEmailAddress?.emailAddress || "",
                    role: "owner",
                    joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    avatarColor: "#2563EB"
                };
                setMembers([owner]);
                localStorage.setItem("cl_members", JSON.stringify([owner]));
            }

            const savedWs = localStorage.getItem("cl_workspace");
            if (savedWs) {
                const { name, slug } = JSON.parse(savedWs);
                setWsName(name);
                setWsSlug(slug);
            }

            const savedWsId = localStorage.getItem("cl_workspace_id");
            if (savedWsId) {
                setWorkspaceId(savedWsId);
            }
        } catch { /* ignore */ }
    }, [user]);

    function handleInvite() {
        if (!inviteEmail) return;
        setInviteStatus("loading");
        setTimeout(() => {
            const newMem = {
                id: `u_${Date.now()}`,
                name: inviteEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' '),
                email: inviteEmail,
                role: inviteRole,
                joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                avatarColor: ["#2563EB", "#7C3AED", "#22C55E", "#F59E0B", "#EF4444"][Math.floor(Math.random() * 5)]
            };
            const updated = [...members, newMem];
            setMembers(updated);
            localStorage.setItem("cl_members", JSON.stringify(updated));
            setInviteStatus("done");
            setInviteEmail("");
            setTimeout(() => setInviteStatus("idle"), 2000);
        }, 600);
    }

    function handleRemove(id: string) {
        if (confirm("Are you sure you want to remove this member?")) {
            const updated = members.filter(m => m.id !== id);
            setMembers(updated);
            localStorage.setItem("cl_members", JSON.stringify(updated));
        }
    }

    function handleSave() {
        setSaveStatus("loading");
        setTimeout(() => {
            localStorage.setItem("cl_workspace", JSON.stringify({ name: wsName, slug: wsSlug }));
            setSaveStatus("done");
            setTimeout(() => setSaveStatus("idle"), 2000);
        }, 500);
    }

    return (
        <div>
            <TopBar title="Settings" subtitle="Manage your workspace" />
            <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
                {/* Tab Navigation */}
                <div style={{ display: "flex", gap: 2, marginBottom: 24, background: "var(--cl-muted)", border: "1px solid var(--cl-border)", borderRadius: 10, padding: 4 }}>
                    {TABS.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            style={{
                                flex: 1, padding: "8px 12px", borderRadius: 7,
                                border: "none", background: tab === t ? "rgba(255,255,255,0.05)" : "transparent",
                                color: tab === t ? (t === "Danger Zone" ? "#FCA5A5" : "var(--cl-foreground)") : "var(--cl-muted-foreground)",
                                fontSize: 13, fontWeight: tab === t ? 700 : 500,
                                cursor: "pointer", transition: "all 0.15s",
                                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Members Tab */}
                {tab === "Members" && (
                    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {/* Invite */}
                        <div style={{ background: "var(--cl-muted)", border: "1px solid var(--cl-border)", borderRadius: 12, padding: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--cl-foreground)", marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>Invite Team Member</h3>
                            <p style={{ fontSize: 13, color: "var(--cl-muted-foreground)", marginBottom: 16 }}>Invite engineers to collaborate on incident response</p>
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.2)", border: "1px solid var(--cl-border)", borderRadius: 8, padding: "10px 14px", transition: "border 0.2s" }}>
                                    <Mail size={16} color="var(--cl-muted-foreground)" />
                                    <input
                                        type="email"
                                        placeholder="colleague@company.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--cl-foreground)", width: "100%" }}
                                    />
                                </div>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#0F172A", background: "#fff", outline: "none", cursor: "pointer" }}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="engineer">Engineer</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                                <button
                                    onClick={handleInvite}
                                    disabled={!inviteEmail || inviteStatus !== "idle"}
                                    style={{ background: inviteStatus === "done" ? "#16A34A" : "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "0 24px", fontSize: 14, fontWeight: 600, cursor: inviteEmail ? "pointer" : "not-allowed", opacity: inviteEmail ? 1 : 0.6, display: "flex", alignItems: "center", gap: 8, transition: "background 0.2s" }}
                                >
                                    {inviteStatus === "loading" ? "Sending..." : inviteStatus === "done" ? <><Check size={16} /> Sent</> : <><Plus size={16} /> Invite</>}
                                </button>
                            </div>
                        </div>

                        {/* Members List */}
                        <div style={{ background: "var(--cl-muted)", border: "1px solid var(--cl-border)", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--cl-border)", background: "rgba(0,0,0,0.2)" }}>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--cl-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Team Members ({members.length})</h3>
                            </div>
                            {members.map((member, i) => (
                                <div key={member.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", borderBottom: i < members.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                                    <Avatar name={member.name} color={member.avatarColor} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--cl-foreground)" }}>{member.name}</p>
                                        <p style={{ fontSize: 13, color: "var(--cl-muted-foreground)" }}>{member.email} <span style={{ opacity: 0.5 }}>· joined {member.joinedAt}</span></p>
                                    </div>
                                    <RoleBadge role={member.role} />
                                    {member.role !== "owner" && (
                                        <button
                                            onClick={() => handleRemove(member.id)}
                                            style={{ background: "transparent", border: "none", borderRadius: 6, padding: "6px", cursor: "pointer", color: "var(--cl-muted-foreground)", display: "flex", alignItems: "center", transition: "all 0.15s" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.color = "#FCA5A5"; e.currentTarget.style.background = "rgba(220, 38, 38, 0.15)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--cl-muted-foreground)"; e.currentTarget.style.background = "transparent"; }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Workspace Tab */}
                {tab === "Workspace" && (
                    <div className="animate-fade-in" style={{ background: "var(--cl-muted)", border: "1px solid var(--cl-border)", borderRadius: 12, padding: 32, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--cl-foreground)", marginBottom: 24, fontFamily: "'Space Grotesk', sans-serif" }}>Workspace Settings</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 400 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--cl-muted-foreground)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Workspace Name</label>
                                <input
                                    type="text"
                                    value={wsName}
                                    onChange={(e) => setWsName(e.target.value)}
                                    style={{ width: "100%", border: "1px solid var(--cl-border)", background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "var(--cl-foreground)", outline: "none", transition: "border 0.2s" }}
                                    onFocus={(e) => e.target.style.borderColor = "#3B82F6"}
                                    onBlur={(e) => e.target.style.borderColor = "var(--cl-border)"}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--cl-muted-foreground)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Workspace Slug</label>
                                <div style={{ display: "flex" }}>
                                    <span style={{ padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--cl-border)", borderRight: "none", borderRadius: "8px 0 0 8px", fontSize: 14, color: "var(--cl-muted-foreground)" }}>crashledger.com/</span>
                                    <input
                                        type="text"
                                        value={wsSlug}
                                        onChange={(e) => setWsSlug(e.target.value)}
                                        style={{ flex: 1, border: "1px solid var(--cl-border)", background: "rgba(0,0,0,0.2)", borderRadius: "0 8px 8px 0", padding: "10px 14px", fontSize: 14, color: "var(--cl-foreground)", outline: "none", transition: "border 0.2s" }}
                                        onFocus={(e) => e.target.style.borderColor = "#3B82F6"}
                                        onBlur={(e) => e.target.style.borderColor = "var(--cl-border)"}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saveStatus !== "idle"}
                                style={{ alignSelf: "flex-start", marginTop: 8, background: saveStatus === "done" ? "#16A34A" : "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8 }}
                            >
                                {saveStatus === "loading" ? "Saving..." : saveStatus === "done" ? <><Check size={16} /> Saved Successfully</> : "Save Changes"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Billing Tab */}
                {tab === "Billing" && (
                    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ background: "linear-gradient(135deg, rgba(88, 28, 135, 0.1), rgba(139, 92, 246, 0.05))", border: "1px solid rgba(139, 92, 246, 0.2)", borderRadius: 12, padding: 32, boxShadow: "0 4px 12px rgba(139, 92, 246, 0.1)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 800, color: "#C4B5FD", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Current Plan</p>
                                    <p style={{ fontSize: 28, fontWeight: 800, color: "var(--cl-foreground)", fontFamily: "'Space Grotesk', sans-serif" }}>Free Plan</p>
                                </div>
                                <div style={{ background: "rgba(139, 92, 246, 0.15)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: 8, padding: "4px 12px" }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#C4B5FD" }}>Active</span>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                                {[
                                    { label: "Incidents", val: "7 / 10 used" },
                                    { label: "Members", val: "4 / unlimited" },
                                    { label: "Analytics", val: "Basic trends" },
                                    { label: "Support", val: "Community" },
                                ].map(({ label, val }) => (
                                    <div key={label} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "12px 16px", border: "1px solid var(--cl-border)" }}>
                                        <p style={{ fontSize: 11, color: "var(--cl-muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</p>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--cl-foreground)" }}>{val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ background: "var(--cl-muted)", border: "1px solid var(--cl-border-glow)", borderRadius: 12, padding: 32, boxShadow: "0 4px 12px rgba(59, 130, 246, 0.1), 0 0 12px var(--cl-border-glow)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: "#60A5FA", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Upgrade to Pro</p>
                                    <p style={{ fontSize: 36, fontWeight: 800, color: "var(--cl-foreground)", fontFamily: "'Space Grotesk', sans-serif" }}>$49 <span style={{ fontSize: 16, fontWeight: 500, color: "var(--cl-muted-foreground)" }}>/month</span></p>
                                    <ul style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                                        {["Unlimited incidents logged per month", "Advanced analytics with MTBF & MTTR targets", "Recurring failure detection engine", "Priority email & chat support", "Export RCA documents to PDF"].map((f) => (
                                            <li key={f} style={{ fontSize: 14, color: "var(--cl-foreground)", display: "flex", alignItems: "center", gap: 10, fontWeight: 500 }}>
                                                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(74, 222, 128, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} color="#4ADE80" strokeWidth={3} /></div> {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    onClick={() => alert("Redirecting to Stripe checkout...")}
                                    style={{ background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "14px 28px", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 0 15px rgba(59, 130, 246, 0.4)", transition: "all 0.2s" }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
                                >
                                    Upgrade Now →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Danger Zone */}
                {tab === "Danger Zone" && (
                    <div className="animate-fade-in" style={{ background: "var(--cl-muted)", border: "1px solid rgba(220, 38, 38, 0.4)", borderRadius: 12, padding: 32, boxShadow: "0 4px 12px rgba(220, 38, 38, 0.1), 0 0 15px rgba(220, 38, 38, 0.1) inset" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#FCA5A5", marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>⚠ Danger Zone</h3>
                        <p style={{ fontSize: 14, color: "var(--cl-muted-foreground)", marginBottom: 24, fontWeight: 500 }}>These actions are irreversible. Please proceed with extreme caution.</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {[
                                { title: "Archive All Incidents", desc: "Move all open incidents to archived state. This cannot be undone.", btnLabel: "Archive All", btnColor: "#FBBF24", bg: "rgba(251, 191, 36, 0.05)", border: "rgba(251, 191, 36, 0.2)" },
                                { title: "Delete Workspace", desc: "Permanently delete this workspace and all its data including incidents, members, and analytics.", btnLabel: "Delete Workspace", btnColor: "#EF4444", bg: "rgba(220, 38, 38, 0.05)", border: "rgba(220, 38, 38, 0.2)" },
                            ].map(({ title, desc, btnLabel, btnColor, bg, border }) => (
                                <div key={title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, padding: "20px", background: bg, borderRadius: 12, border: `1px solid ${border}` }}>
                                    <div>
                                        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--cl-foreground)" }}>{title}</p>
                                        <p style={{ fontSize: 13, color: "var(--cl-muted-foreground)", marginTop: 6, lineHeight: 1.4, fontWeight: 500 }}>{desc}</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (title === "Delete Workspace") {
                                                if (!workspaceId) return alert("No workspace selected");
                                                if (confirm("Are you absolutely sure you want to delete this workspace? This cannot be undone.")) {
                                                    setIsDeleting(true);
                                                    try {
                                                        const res = await fetch(`/api/workspace/${workspaceId}`, { method: "DELETE" });
                                                        if (res.ok) {
                                                            localStorage.removeItem("cl_workspace_id");
                                                            localStorage.removeItem("cl_workspace");
                                                            router.push("/workspace-select");
                                                        } else {
                                                            const data = await res.json();
                                                            alert(data.error || "Failed to delete workspace");
                                                        }
                                                    } catch (e) {
                                                        alert("An error occurred");
                                                    } finally {
                                                        setIsDeleting(false);
                                                    }
                                                }
                                            } else {
                                                if (confirm(`Are you absolutely sure you want to ${btnLabel.toLowerCase()}? This cannot be undone.`)) {
                                                    alert("Action completed.");
                                                }
                                            }
                                        }}
                                        disabled={title === "Delete Workspace" && isDeleting}
                                        style={{ flexShrink: 0, background: "transparent", border: `1px solid ${btnColor}`, color: btnColor, borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: (title === "Delete Workspace" && isDeleting) ? "not-allowed" : "pointer", opacity: (title === "Delete Workspace" && isDeleting) ? 0.5 : 1, transition: "all 0.2s" }}
                                        onMouseEnter={(e) => { if (!(title === "Delete Workspace" && isDeleting)) { e.currentTarget.style.background = btnColor; e.currentTarget.style.color = "#fff"; } }}
                                        onMouseLeave={(e) => { if (!(title === "Delete Workspace" && isDeleting)) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = btnColor; } }}
                                    >
                                        {title === "Delete Workspace" && isDeleting ? "Deleting..." : btnLabel}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <style jsx global>{`
                .animate-fade-in { animation: fadeIn 0.2s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
