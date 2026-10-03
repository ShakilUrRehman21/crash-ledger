"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { Plus, ArrowRight, Building2, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-[#FAF8F5] text-sm text-[#111827] placeholder-neutral-400 focus:outline-none focus:border-[#FA5A2A] focus:bg-white transition-all";

function errorMessage(err: any, fallback: string): string {
    if (!err) return fallback;
    if (typeof err === "string") return err;
    if (err.formErrors?.[0]) return err.formErrors[0];
    if (err.fieldErrors) {
        const first = Object.keys(err.fieldErrors)[0];
        if (first) return `${first}: ${err.fieldErrors[first][0]}`;
    }
    return fallback;
}

export default function WorkspaceSelectorPage() {
    const router = useRouter();
    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/workspace")
            .then(res => res.json())
            .then(data => {
                if (data.workspaces && data.workspaces.length > 0) {
                    setWorkspaces(data.workspaces);
                } else {
                    setShowCreate(true);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setShowCreate(true);
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
        if (!name.trim() || !slug.trim()) return setError("Name and slug are required.");
        try {
            setError("");
            setCreating(true);
            const res = await fetch("/api/workspace/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, slug })
            });
            const data = await res.json();

            if (!res.ok) {
                setError(errorMessage(data.error, "Failed to create workspace"));
                setCreating(false);
                return;
            }

            localStorage.setItem("cl_workspace_id", data.workspace.id);
            localStorage.setItem("cl_workspace", JSON.stringify({ name: data.workspace.name, slug: data.workspace.slug }));
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-sm text-neutral-500">Loading workspaces...</div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-lg">
                <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FA5A2A] via-[#FF6A3D] to-[#FF8256] text-white text-center px-6 py-10 mb-6 shadow-2xl shadow-[#FA5A2A]/20">
                    <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
                    <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-white/15" />
                    <div className="relative">
                        <div className="flex justify-center mb-4"><Logo variant="light" size={44} href={null} /></div>
                        <h1 className="text-2xl font-extrabold font-heading">Select a Workspace</h1>
                        <p className="text-sm text-white/90 mt-1">Choose a workspace to continue to your dashboard</p>
                    </div>
                </div>

                {workspaces.length > 0 && (
                    <div className="flex flex-col gap-3 mb-4">
                        {workspaces.map((ws) => (
                            <button
                                key={ws.id}
                                onClick={() => handleSelect(ws.id)}
                                className="group flex items-center gap-4 bg-white border border-[#EFE9E1] rounded-2xl p-4 text-left shadow-sm hover:border-[#FA5A2A] hover:shadow-md transition-all w-full"
                            >
                                <div className="w-11 h-11 rounded-xl bg-[#FFF2EC] text-[#FA5A2A] flex items-center justify-center shrink-0">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[#111827] truncate">{ws.name}</p>
                                    <p className="text-xs text-neutral-500 mt-0.5 capitalize">{ws.role} · {ws.planType} plan</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#FA5A2A] group-hover:translate-x-0.5 transition-all" />
                            </button>
                        ))}
                    </div>
                )}

                {!showCreate ? (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="w-full border-2 border-dashed border-neutral-300 rounded-2xl py-3.5 text-sm font-semibold text-neutral-500 hover:border-[#FA5A2A] hover:text-[#FA5A2A] hover:bg-[#FFF2EC]/50 flex items-center justify-center gap-2 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Create New Workspace
                    </button>
                ) : (
                    <div className="bg-white border border-[#EFE9E1] rounded-2xl p-6 shadow-sm">
                        <h3 className="text-base font-bold text-[#111827] font-heading mb-4">Create New Workspace</h3>
                        {error && <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">{error}</p>}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Workspace Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }}
                                    placeholder="Acme Engineering"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Slug</label>
                                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="acme-engineering" className={inputCls} />
                            </div>
                            <div className="flex gap-3 pt-1">
                                {workspaces.length > 0 && (
                                    <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-full text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors">Cancel</button>
                                )}
                                <button
                                    onClick={handleCreate}
                                    disabled={creating}
                                    className="flex-[2] py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#FA5A2A] to-[#FF7A00] shadow-md shadow-[#FA5A2A]/25 hover:opacity-95 disabled:opacity-50 transition-all"
                                >
                                    {creating ? "Creating..." : "Create & Enter"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-center mt-6">
                    <SignOutButton redirectUrl="/">
                        <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#FA5A2A] transition-colors">
                            <LogOut className="w-3.5 h-3.5" /> Sign out
                        </button>
                    </SignOutButton>
                </div>
            </div>
        </div>
    );
}
