"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Plus, ArrowRight, Building2 } from "lucide-react";

export default function WorkspaceSelectorPage() {
    const router = useRouter();
    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/workspace")
            .then(res => res.json())
            .then(data => {
                if (data.workspaces) {
                    setWorkspaces(data.workspaces);
                    if (data.workspaces.length === 0) {
                        setShowCreate(true);
                    }
                } else {
                    setShowCreate(true);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSelect = (workspaceId: string) => {
        localStorage.setItem("cl_workspace_id", workspaceId);
        const ws = workspaces.find((w) => w.id === workspaceId);
        if (ws) {
            localStorage.setItem("cl_workspace", JSON.stringify({ name: ws.name, slug: ws.slug }));
        }
        router.push("/dashboard");
    };

    const handleCreate = async () => {
        try {
            setError("");
            const res = await fetch("/api/workspace/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, slug })
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to create workspace");
                return;
            }

            localStorage.setItem("cl_workspace_id", data.workspace.id);
            localStorage.setItem("cl_workspace", JSON.stringify({ name: data.workspace.name, slug: data.workspace.slug }));
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div style={{ minHeight: "100vh", background: "var(--cl-background)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cl-foreground)" }}>Loading...</div>;
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--cl-background)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Inter, sans-serif" }}>
            <div style={{ width: "100%", maxWidth: 480 }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, #2563EB, #7C3AED)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                        <ShieldAlert size={22} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--cl-foreground)" }}>Select a Workspace</h1>
                    <p style={{ fontSize: 14, color: "var(--cl-muted-foreground)", marginTop: 4 }}>Choose a workspace to continue to your dashboard</p>
                </div>

                {/* Workspace List */}
                {workspaces.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                        {workspaces.map((ws) => (
                            <button
                                key={ws.id}
                                onClick={() => handleSelect(ws.id)}
                                style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--cl-muted)", border: "1px solid var(--cl-border)", borderRadius: 12, padding: "16px 18px", cursor: "pointer", transition: "all 0.15s", textAlign: "left", width: "100%", color: "var(--cl-foreground)" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#2563EB"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--cl-border)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
                            >
                                <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Building2 size={18} color="#60A5FA" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 15, fontWeight: 700 }}>{ws.name}</p>
                                    <p style={{ fontSize: 12, color: "var(--cl-muted-foreground)", marginTop: 2 }}>{ws.role.toUpperCase()} · {ws.planType.toUpperCase()} plan</p>
                                </div>
                                <span style={{ background: ws.planType === "pro" ? "rgba(37,99,235,0.1)" : "rgba(255,255,255,0.05)", color: ws.planType === "pro" ? "#60A5FA" : "var(--cl-muted-foreground)", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" as const }}>{ws.planType}</span>
                                <ArrowRight size={14} color="var(--cl-muted-foreground)" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Create Workspace */}
                {!showCreate ? (
                    <button
                        onClick={() => setShowCreate(true)}
                        style={{ width: "100%", border: "1.5px dashed var(--cl-border)", borderRadius: 12, padding: "14px", background: "transparent", color: "var(--cl-muted-foreground)", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#60A5FA"; (e.currentTarget as HTMLButtonElement).style.color = "#60A5FA"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(37,99,235,0.05)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--cl-border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--cl-muted-foreground)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                        <Plus size={16} /> Create New Workspace
                    </button>
                ) : (
                    <div style={{ background: "var(--cl-muted)", border: "1px solid var(--cl-border)", borderRadius: 12, padding: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--cl-foreground)", marginBottom: 14 }}>Create New Workspace</h3>
                        {error && <p style={{ color: "#EF4444", fontSize: 12, marginBottom: 10 }}>{error}</p>}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--cl-muted-foreground)", marginBottom: 5 }}>Workspace Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }}
                                    placeholder="Acme Engineering"
                                    style={{ width: "100%", border: "1px solid var(--cl-border)", borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", color: "var(--cl-foreground)", background: "var(--cl-background)" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--cl-muted-foreground)", marginBottom: 5 }}>Slug</label>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="acme-engineering"
                                    style={{ width: "100%", border: "1px solid var(--cl-border)", borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", color: "var(--cl-foreground)", background: "rgba(0,0,0,0.2)" }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "9px", border: "1px solid var(--cl-border)", borderRadius: 8, background: "transparent", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "var(--cl-muted-foreground)" }}>Cancel</button>
                                <button onClick={handleCreate} style={{ flex: 2, padding: "9px", background: "#2563EB", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#fff" }}>Create & Enter</button>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ textAlign: "center", marginTop: 20 }}>
                    <a href="/sign-in" style={{ fontSize: 13, color: "var(--cl-muted-foreground)", textDecoration: "none" }}>← Sign out</a>
                </div>
            </div>
        </div>
    );
}
