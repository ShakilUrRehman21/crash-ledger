"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, AlertTriangle, CheckSquare, BarChart2, Settings, ShieldAlert, Zap,
  ChevronDown, Building2
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Incidents", href: "/dashboard/incidents", icon: AlertTriangle },
  { label: "Action Items", href: "/dashboard/action-items", icon: CheckSquare },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [currentWs, setCurrentWs] = useState({ id: "", name: "My Workspace" });
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [openWsMenu, setOpenWsMenu] = useState(false);

  useEffect(() => {
    try {
      const savedWs = localStorage.getItem("cl_workspace");
      const savedId = localStorage.getItem("cl_workspace_id");
      if (savedWs && savedId) {
        setCurrentWs({ id: savedId, name: JSON.parse(savedWs).name });
      }
    } catch { }

    fetch("/api/workspace")
      .then(r => r.json())
      .then(d => { if (d.workspaces) setWorkspaces(d.workspaces); })
      .catch(console.error);
  }, []);

  const handleSwitch = (ws: any) => {
    localStorage.setItem("cl_workspace_id", ws.id);
    localStorage.setItem("cl_workspace", JSON.stringify({ name: ws.name, slug: ws.slug }));
    window.location.href = "/dashboard";
  };

  return (
    <>
      <aside style={{
        width: 240, minHeight: "100vh", background: "var(--cl-muted)",
        borderRight: "1px solid var(--cl-border)", display: "flex",
        flexDirection: "column", position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 40,
      }}>
        {/* Logo & Workspace Switcher */}
        <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid var(--cl-border)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setOpenWsMenu(!openWsMenu)}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #2563EB, #7C3AED)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShieldAlert size={16} color="#fff" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: "var(--cl-foreground)", lineHeight: 1, fontFamily: "'Space Grotesk', sans-serif" }}>CrashLedger</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <p style={{ fontSize: 11, color: "var(--cl-muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentWs.name}</p>
                <ChevronDown size={12} color="var(--cl-muted-foreground)" />
              </div>
            </div>
          </div>
          {openWsMenu && (
            <div style={{ position: "absolute", top: "100%", left: 8, right: 8, background: "var(--cl-background)", border: "1px solid var(--cl-border)", borderRadius: 10, padding: 6, zIndex: 100, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => handleSwitch(ws)}
                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", background: "none", border: "none", borderRadius: 6, cursor: "pointer", color: "var(--cl-foreground)", textAlign: "left" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                >
                  <Building2 size={13} color="#60A5FA" />
                  <span style={{ fontSize: 13, fontWeight: ws.id === currentWs.id ? 700 : 500 }}>{ws.name}</span>
                </button>
              ))}
              <div style={{ height: 1, background: "var(--cl-border)", margin: "4px 0" }} />
              <Link href="/workspace-select" style={{ display: "block", width: "100%", padding: "8px 10px", fontSize: 12, color: "#60A5FA", textDecoration: "none", textAlign: "center", fontWeight: 600 }}>
                Manage Workspaces →
              </Link>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "var(--cl-muted-foreground)", textTransform: "uppercase", padding: "0 6px", marginBottom: 8 }}>
            Navigation
          </p>
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} style={{
                display: "flex", alignItems: "center", gap: 9, padding: "9px 10px",
                borderRadius: 8, fontSize: 14, fontWeight: isActive ? 600 : 500,
                color: isActive ? "#60A5FA" : "var(--cl-muted-foreground)",
                background: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
                textDecoration: "none", marginBottom: 2,
                transition: "all 0.15s ease",
              }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255, 255, 255, 0.05)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--cl-foreground)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--cl-muted-foreground)";
                  }
                }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
                <span style={{ flexShrink: 0 }}>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Upgrade banner */}
        <div style={{ padding: 12, borderTop: "1px solid var(--cl-border)" }}>
          <div style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Zap size={13} color="#F59E0B" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#FDE68A" }}>Free Plan</span>
            </div>
            <p style={{ fontSize: 11, color: "#FCD34D", marginBottom: 8, lineHeight: 1.4, opacity: 0.8 }}>10 incidents/month. Upgrade for unlimited.</p>
            <Link href="/dashboard/settings" style={{ display: "block", textAlign: "center", background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "7px 12px", borderRadius: 7, textDecoration: "none" }}>
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
