"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  CheckSquare,
  BarChart2,
  Settings,
  Zap,
  ChevronDown,
  Building2,
  LogOut,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { SignOutButton, useUser } from "@clerk/nextjs";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Incidents", href: "/dashboard/incidents", icon: AlertTriangle },
  { label: "Action Items", href: "/dashboard/action-items", icon: CheckSquare },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [currentWs, setCurrentWs] = useState({ id: "", name: "Production Workspace" });
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
      .then(d => {
        if (d.workspaces && d.workspaces.length > 0) {
          setWorkspaces(d.workspaces);
          // If no current selected, default to first
          const savedId = localStorage.getItem("cl_workspace_id");
          if (!savedId) {
            const first = d.workspaces[0];
            localStorage.setItem("cl_workspace_id", first.id);
            localStorage.setItem("cl_workspace", JSON.stringify({ name: first.name, slug: first.slug }));
            setCurrentWs({ id: first.id, name: first.name });
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleSwitch = (ws: any) => {
    localStorage.setItem("cl_workspace_id", ws.id);
    localStorage.setItem("cl_workspace", JSON.stringify({ name: ws.name, slug: ws.slug }));
    setCurrentWs({ id: ws.id, name: ws.name });
    setOpenWsMenu(false);
    window.location.reload();
  };

  return (
    <aside className="w-64 min-h-screen bg-[#111826] text-white flex flex-col fixed left-0 top-0 bottom-0 z-40 border-r border-white/10 selection:bg-[#FA5A2A]/30">
      
      {/* Brand & Workspace Switcher */}
      <div className="p-4 border-b border-white/10 relative">
        <div 
          onClick={() => setOpenWsMenu(!openWsMenu)}
          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <Logo variant="light" tone="brand" size={30} href={null} />
              <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${openWsMenu ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-[11px] font-medium text-neutral-400 truncate mt-1.5">
              {currentWs.name}
            </p>
          </div>
        </div>

        {/* Workspace Dropdown */}
        {openWsMenu && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-[#1A2234] border border-white/15 rounded-2xl p-2 z-50 shadow-2xl backdrop-blur-xl">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Switch Workspace
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 my-1">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => handleSwitch(ws)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                    ws.id === currentWs.id ? 'bg-[#FA5A2A] text-white font-bold' : 'text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{ws.name}</span>
                  </div>
                  {ws.id === currentWs.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
              ))}
            </div>
            <div className="h-px bg-white/10 my-1" />
            <Link
              href="/workspace-select"
              className="flex items-center justify-between p-2 text-xs font-semibold text-[#FA5A2A] hover:bg-[#FA5A2A]/10 rounded-xl transition-colors"
            >
              <span>Manage all workspaces</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Nav List (Elegent Sidebar Style) */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          Main Menu
        </div>

        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-[#FA5A2A] text-white shadow-lg shadow-[#FA5A2A]/30 translate-x-0.5"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <span>{label}</span>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Banner (Pro) */}
      <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-[#1E2738] to-[#171E2D] border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-amber-300">Free Tier</span>
        </div>
        <p className="text-[11px] text-neutral-400 mb-3 leading-tight">
          Unlock unlimited postmortems, MTBF trends & team roles.
        </p>
        <Link
          href="/dashboard/settings"
          className="block w-full py-2 rounded-xl text-center text-xs font-bold text-white bg-gradient-to-r from-[#FA5A2A] to-[#FF7A00] hover:opacity-95 shadow-md shadow-[#FA5A2A]/20 transition-opacity"
        >
          Upgrade to Pro
        </Link>
      </div>

      {/* User / Logout Rail (Image 2 Elegent style) */}
      <div className="p-3 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#FA5A2A]/20 text-[#FA5A2A] border border-[#FA5A2A]/40 flex items-center justify-center font-bold text-xs shrink-0">
            {user?.firstName ? user.firstName.charAt(0) : "CL"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {user?.fullName || "Engineering Lead"}
            </p>
            <p className="text-[10px] text-neutral-400 truncate">
              {user?.primaryEmailAddress?.emailAddress || "Responder"}
            </p>
          </div>
        </div>

        <SignOutButton>
          <button
            title="Sign Out"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </SignOutButton>
      </div>

    </aside>
  );
}
