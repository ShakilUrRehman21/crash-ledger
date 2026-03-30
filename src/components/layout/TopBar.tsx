"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Plus } from "lucide-react";
import Link from "next/link";

interface TopBarProps {
  title: string;
  subtitle?: string;
  workspaceId?: string;
  showCreateIncident?: boolean;
}

export function TopBar({ title, subtitle, workspaceId, showCreateIncident }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>
      <div className="topbar-right">
        {showCreateIncident && workspaceId && (
          <Link href={`/dashboard/incidents/new?workspaceId=${workspaceId}`} className="create-btn" style={{ whiteSpace: "nowrap", display: "flex", flexDirection: "row", alignItems: "center" }}>
            <Plus size={15} style={{ flexShrink: 0 }} />
            <span>New Incident</span>
          </Link>
        )}
        <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: { width: 34, height: 34 } } }} />
      </div>

      <style jsx>{`
        .topbar {
          height: 64px;
          background: rgba(6, 11, 25, 0.85); /* Dark tech theme */
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--cl-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          position: sticky;
          top: 0;
          z-index: 30;
        }
        .topbar-left { display: flex; flex-direction: column; gap: 1px; }
        .topbar-title { font-size: 16px; font-weight: 700; color: var(--cl-foreground); letter-spacing: -0.01em; }
        .topbar-subtitle { font-size: 12px; color: var(--cl-muted-foreground); }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .create-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 0 10px rgba(37,99,235,0.2);
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          line-height: 1;
          white-space: nowrap;
        }
        .create-btn:hover { background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%); box-shadow: 0 0 15px rgba(59,130,246,0.4); transform: translateY(-1px); }
        .create-btn:active { transform: translateY(1px); }
        .icon-btn {
          position: relative;
          background: none;
          border: 1px solid var(--cl-border);
          border-radius: 8px;
          padding: 7px;
          cursor: pointer;
          color: var(--cl-muted-foreground);
          display: flex;
          align-items: center;
          transition: all 0.15s;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.05); color: var(--cl-foreground); box-shadow: 0 0 8px rgba(255,255,255,0.05); }
        .notif-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 7px;
          height: 7px;
          background: #EF4444;
          border-radius: 50%;
          border: 1.5px solid #060B19;
        }
      `}</style>
    </header>
  );
}
