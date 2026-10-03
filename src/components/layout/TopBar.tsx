"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Plus, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  workspaceId?: string;
  showCreateIncident?: boolean;
}

export function TopBar({ title, subtitle, workspaceId, showCreateIncident }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="h-16 px-6 sm:px-8 bg-[#FAF8F5]/80 backdrop-blur-md border-b border-[#EFE9E1] sticky top-0 z-30 flex items-center justify-between">
      
      {/* Title / Breadcrumb */}
      <div className="flex flex-col">
        <h1 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight font-heading leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-neutral-500 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {/* Center Search Pill (Elegent inspired) */}
      <div className="hidden md:flex items-center w-72 lg:w-96 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E0D8] shadow-sm focus-within:border-[#FA5A2A] focus-within:ring-2 focus-within:ring-[#FA5A2A]/10 transition-all">
        <Search className="w-4 h-4 text-neutral-400 shrink-0 mr-2" />
        <input
          type="text"
          placeholder="Search incidents, services, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-[#111827] placeholder-neutral-400 focus:outline-none"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {showCreateIncident && workspaceId && (
          <Link
            href={`/dashboard/incidents/new?workspaceId=${workspaceId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#FA5A2A] to-[#FF7A00] hover:opacity-95 shadow-md shadow-[#FA5A2A]/25 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Incident</span>
          </Link>
        )}

        {/* Notifications */}
        <button
          title="Notifications"
          className="relative p-2 rounded-full bg-white border border-[#E5E0D8] text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 shadow-sm transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FA5A2A] ring-2 ring-white" />
        </button>

        {/* User Button */}
        <div className="pl-1">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: { width: 34, height: 34, borderRadius: "50%", border: "2px solid #E5E0D8" },
              },
            }}
          />
        </div>
      </div>

    </header>
  );
}
