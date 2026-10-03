"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useState } from "react";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  BarChart2,
  Users,
  ChevronDown,
  Sparkles,
  Zap,
  TrendingDown,
  Check,
  Star,
  ExternalLink
} from "lucide-react";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111827] font-sans selection:bg-[#FF6B35]/20 selection:text-[#FF6B35]">
      
      {/* Container wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        
        {/* HERO SECTION (Habitus Warm Orange Hero Banner) */}
        <section className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-gradient-to-br from-[#FA5A2A] via-[#FF6A3D] to-[#FF8256] text-white px-6 sm:px-12 pt-8 pb-16 shadow-2xl shadow-[#FA5A2A]/20">
          
          {/* Subtle Ambient Background Circles */}
          <div className="absolute top-12 left-16 w-16 h-16 rounded-full bg-white/10 blur-sm pointer-events-none" />
          <div className="absolute top-36 right-24 w-28 h-28 rounded-full bg-white/15 blur-md pointer-events-none" />
          <div className="absolute bottom-20 left-1/3 w-36 h-36 rounded-full bg-[#121826]/10 blur-lg pointer-events-none" />

          {/* Embedded Hero Navbar */}
          <nav className="relative z-10 flex items-center justify-between pb-12 sm:pb-16 border-b border-white/15">
            <Logo variant="light" size={40} />

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/90">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
              <a href="#metrics" className="hover:text-white transition-colors">Analytics</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="px-5 py-2.5 rounded-full text-sm font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-sm transition-all"
              >
                Log In
              </Link>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-white text-[#FA5A2A] hover:bg-neutral-100 shadow-md transition-all transform hover:-translate-y-0.5"
              >
                Live Demo
              </Link>
            </div>
          </nav>

          {/* Hero Main Content */}
          <div className="relative z-10 max-w-3xl mx-auto text-center pt-8 pb-10">
            
            {/* Top Tagline */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold uppercase tracking-wider text-white mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              Operational Failure Intelligence Platform
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-heading leading-[1.08] mb-6">
              Build Better Habits.
              <br />
              <span className="text-amber-100 drop-shadow-sm">One Outage At A Time.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/90 font-medium max-w-2xl mx-auto mb-9 leading-relaxed">
              Track your daily production routines, enforce structured Root Cause Analysis, and turn recurring incidents into unbreakable engineering resilience — all in one modern ledger.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-base font-bold bg-white text-[#111827] hover:bg-neutral-50 shadow-xl shadow-black/10 transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 text-[#FA5A2A]" />
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full text-base font-semibold bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md transition-all inline-flex items-center justify-center gap-2.5"
              >
                <div className="w-6 h-6 rounded-full bg-white text-[#FA5A2A] flex items-center justify-center shadow-sm">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                Explore Dashboard
              </Link>
            </div>

            {/* Social Trust Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111827]/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-white shadow-lg">
              <div className="flex text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span>Trusted by 700+ engineering teams worldwide</span>
            </div>
          </div>

          {/* Hero Device / Dashboard Preview Cards Mockup */}
          <div className="relative z-10 max-w-5xl mx-auto mt-6 -mb-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            
            {/* Left Mockup Card (Incident Tracker Mobile Frame) */}
            <div className="sm:col-span-4 bg-white text-[#111827] rounded-3xl p-5 shadow-2xl border border-white/80 transform hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FA5A2A]" />
                  <span className="text-xs font-bold text-neutral-800">Incident Tracker</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  Live
                </span>
              </div>

              {/* Circular Gauge */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="38" stroke="#F3F4F6" strokeWidth="8" fill="none" />
                    <circle
                      cx="48"
                      cy="48"
                      r="38"
                      stroke="#FA5A2A"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="238"
                      strokeDashoffset="38"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xl font-extrabold text-[#111827]">84%</span>
                    <span className="block text-[9px] text-neutral-400 font-semibold uppercase">Resolved</span>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 mt-3 pt-3 border-t border-neutral-100">
                <div className="flex items-center justify-between text-xs font-medium text-neutral-700">
                  <span>Enforce RCA on Close</span>
                  <div className="w-8 h-4 bg-[#FA5A2A] rounded-full p-0.5 flex justify-end">
                    <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-neutral-700">
                  <span>Recurring Failure Alerts</span>
                  <div className="w-8 h-4 bg-[#FA5A2A] rounded-full p-0.5 flex justify-end">
                    <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Center Main Dashboard Mockup Card */}
            <div className="sm:col-span-8 bg-[#111827] text-white rounded-3xl p-6 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-bold tracking-tight">Active Incident Ledger</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80 border border-white/10">
                    Production US-East
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#FA5A2A] text-white font-bold">
                    MTTR: 38m
                  </span>
                </div>
              </div>

              {/* Incident Rows */}
              <div className="space-y-2.5">
                {[
                  { id: "INC-1042", title: "API Gateway latency spike on checkout", sev: "critical", status: "investigating", time: "12m ago" },
                  { id: "INC-1041", title: "Auth token cache replication desync", sev: "high", status: "resolved", time: "2h ago" },
                  { id: "INC-1040", title: "Primary DB read replica failover completed", sev: "medium", status: "resolved", time: "5h ago" },
                ].map((inc) => (
                  <div key={inc.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-neutral-400 font-medium">{inc.id}</span>
                      <span className="font-semibold text-white truncate max-w-[280px]">{inc.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                        inc.sev === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        inc.sev === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {inc.sev}
                      </span>
                      <span className="text-neutral-400 text-[11px]">{inc.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* WHY YOU'LL LOVE IT - BENTO GRID (Habitus inspired) */}
        <section id="features" className="mt-24 sm:mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111827] tracking-tight font-heading">
                Why you&apos;ll love it
              </h2>
            </div>
            <p className="text-base text-neutral-500 font-medium mt-2 md:mt-0 max-w-md">
              Designed to help engineering teams eliminate repeat failures and stay on track, effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-8 border border-[#EFE9E1] shadow-sm hover:shadow-xl hover:border-[#FA5A2A]/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF2EC] text-[#FA5A2A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2 font-heading">
                Smart Incident Engine
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Full status tracking: Open → Investigating → Resolved → Archived with enforced valid state transitions and audit logging.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 border border-[#EFE9E1] shadow-sm hover:shadow-xl hover:border-[#FA5A2A]/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2 font-heading">
                Progress & MTTR Analytics
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                See your reliability growth with weekly MTTR and MTBF reports, outage trends, and live Operational Risk indexing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 border border-[#EFE9E1] shadow-sm hover:shadow-xl hover:border-[#FA5A2A]/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-[#F5F3FF] text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2 font-heading">
                Recurring Failure Detection
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Automatically identifies fragile services with repeated incidents and calculates component risk before the next major outage.
              </p>
            </div>

          </div>

          {/* Large Bento Card (Preview + CTA Bar) */}
          <div className="mt-6 bg-[#EBF5FB] rounded-3xl p-8 sm:p-12 border border-[#D4E6F1] flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-sky-700 text-xs font-bold mb-4 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
                Structured Postmortems
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-heading mb-4 leading-tight">
                Mandatory Root Cause Analysis with actionable prevention tasks
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6">
                Never close an incident with a lazy note again. CrashLedger requires structured 5-Whys, root cause categorization, and assigns follow-up action items with assignees and due dates.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-[#FA5A2A] text-white hover:bg-[#E85022] shadow-lg shadow-[#FA5A2A]/25 transition-all"
              >
                Start Tracking — It&apos;s Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mini preview card */}
            <div className="w-full lg:w-96 bg-white rounded-2xl p-6 shadow-md border border-neutral-100">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">RCA Prevention Checklist</p>
              <div className="space-y-3">
                {[
                  { title: "Implement rate limiter on /v1/checkout", done: true },
                  { title: "Add circuit breaker for payment gateway", done: true },
                  { title: "Automate Redis cache invalidation test", done: false },
                  { title: "Update runbook for primary failover", done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${item.done ? 'bg-emerald-500 text-white' : 'border border-neutral-300'}`}>
                      {item.done && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className={item.done ? 'line-through text-neutral-400 font-medium' : 'text-neutral-700 font-semibold'}>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Proof Brand Logos */}
          <div className="mt-12 py-6 px-4 bg-white/60 rounded-2xl border border-[#EFE9E1] flex flex-wrap items-center justify-between gap-6 text-neutral-400 text-sm font-bold uppercase tracking-wider">
            <span className="text-xs font-semibold text-neutral-500">Trusted by teams at</span>
            <span className="hover:text-neutral-700 transition-colors">Google Cloud</span>
            <span className="hover:text-neutral-700 transition-colors">Spotify</span>
            <span className="hover:text-neutral-700 transition-colors">Datadog</span>
            <span className="hover:text-neutral-700 transition-colors">Stripe</span>
            <span className="hover:text-neutral-700 transition-colors">Vercel</span>
            <span className="hover:text-neutral-700 transition-colors">PagerDuty</span>
          </div>
        </section>

        {/* TAKE A LOOK INSIDE SECTION */}
        <section id="how-it-works" className="mt-28 sm:mt-36 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111827] tracking-tight font-heading mb-4">
              Take a Look Inside
            </h2>
            <p className="text-base text-neutral-500 font-medium">
              A simple, beautiful interface built for everyday engineering operations.
            </p>
          </div>

          {/* 3 Mobile / Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-6 border border-[#EFE9E1] shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#FA5A2A]/10 text-[#FA5A2A] font-bold flex items-center justify-center mb-4">
                  01
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-2 font-heading">
                  Log & Detect Fast
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                  Capture incidents in under 10 seconds. Tag severity (P1-P4), impacted services, and trigger immediate stakeholder alerts.
                </p>
              </div>
              <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EFE9E1]">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700 mb-2">
                  <span>Incident State</span>
                  <span className="text-[#FA5A2A]">Investigating</span>
                </div>
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#FA5A2A] h-2 rounded-full w-2/3" />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-6 border border-[#EFE9E1] shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] font-bold flex items-center justify-center mb-4">
                  02
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-2 font-heading">
                  Visual Event Timeline
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                  Record chronological actions from initial alert through diagnosis, mitigation, and resolution with zero context lost.
                </p>
              </div>
              <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EFE9E1] space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>14:02 — Alert triggered in Slack</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>14:15 — Traffic rerouted to EU backup</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-6 border border-[#EFE9E1] shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] font-bold flex items-center justify-center mb-4">
                  03
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-2 font-heading">
                  Enforce Root Cause Fixes
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                  Complete structured 5-Whys and create follow-up action items so the exact same outage never happens twice.
                </p>
              </div>
              <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EFE9E1]">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>RCA Completed</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">2 prevention tasks assigned</p>
              </div>
            </div>

          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="mt-28 sm:mt-36">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111827] tracking-tight font-heading mb-3">
              What engineers say
            </h2>
            <p className="text-base text-neutral-500">
              Transforming postmortems into habits that elevate engineering culture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-8 border border-[#EFE9E1] shadow-sm flex flex-col justify-between">
              <p className="text-base text-neutral-700 leading-relaxed font-medium mb-6">
                &ldquo;CrashLedger completely changed how our on-call engineers conduct postmortems. Having mandatory RCA enforcement helped us drop repeat database incidents to zero within two quarters.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FA5A2A] text-white flex items-center justify-center font-bold text-sm">
                  JK
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111827]">James K.</p>
                  <p className="text-xs text-neutral-500">Staff Infrastructure Engineer</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-[#EFE9E1] shadow-sm flex flex-col justify-between">
              <p className="text-base text-neutral-700 leading-relaxed font-medium mb-6">
                &ldquo;The MTTR analytics and recurring failure alerts gave our leadership team instant visibility into fragile microservices. It&apos;s the first incident tool our developers genuinely enjoy using.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  PK
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111827]">Priya R.</p>
                  <p className="text-xs text-neutral-500">VP of Engineering</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRANSPARENT PRICING SECTION (Habitus High Contrast Pricing Cards) */}
        <section id="pricing" className="mt-28 sm:mt-36">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111827] tracking-tight font-heading mb-3">
              Transparent pricing
            </h2>
            <p className="text-base text-neutral-500">
              Start free today. Scale as your engineering team grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            
            {/* Free Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#EFE9E1] shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-base font-bold text-neutral-800 mb-1">Free Tier</p>
                <p className="text-xs text-neutral-500 mb-6">Essential failure tracking for startups</p>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-black text-[#111827] font-heading">$0</span>
                  <span className="text-sm font-semibold text-neutral-400">/ month</span>
                </div>

                <div className="w-full h-px bg-neutral-100 mb-6" />

                <ul className="space-y-3.5 mb-8 text-sm text-neutral-600">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Up to 10 incidents per month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Basic MTTR and MTBF metrics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Up to 5 team workspace members</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Visual event timelines & notes</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/sign-up"
                className="w-full py-3.5 rounded-full text-center text-sm font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Card (Dark Navy Habitus Accent Card) */}
            <div className="bg-[#121826] text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 rounded-full bg-[#FA5A2A] text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                  Popular
                </span>
              </div>

              <div>
                <p className="text-base font-bold text-white mb-1">Pro Enterprise</p>
                <p className="text-xs text-neutral-400 mb-6">Everything you need for zero repeat downtime</p>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-black text-white font-heading">$49</span>
                  <span className="text-sm font-semibold text-neutral-400">/ month</span>
                </div>

                <div className="w-full h-px bg-white/10 mb-6" />

                <ul className="space-y-3.5 mb-8 text-sm text-neutral-200">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FA5A2A] shrink-0" />
                    <span><strong>Unlimited</strong> incidents & timelines</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FA5A2A] shrink-0" />
                    <span><strong>Recurring Failure Detection</strong> algorithm</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FA5A2A] shrink-0" />
                    <span>Mandatory RCA enforcement engine</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FA5A2A] shrink-0" />
                    <span>Unlimited team workspace seats</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FA5A2A] shrink-0" />
                    <span>Export postmortems to PDF & CSV</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/sign-up"
                className="w-full py-3.5 rounded-full text-center text-sm font-bold text-[#111827] bg-white hover:bg-neutral-100 shadow-lg shadow-black/20 transition-all"
              >
                Upgrade Now — 14-Day Trial
              </Link>
            </div>

          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS (Habitus Pastel Accordion) */}
        <section id="faq" className="mt-28 sm:mt-36 max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111827] tracking-tight font-heading mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-neutral-500">
              Everything you need to know before getting started with CrashLedger.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What do I get with CrashLedger Pro?",
                a: "CrashLedger Pro gives you unlimited incident logging, recurring component failure detection, mandatory RCA gating, priority support, and team-wide role-based access control.",
                bg: "bg-[#FFECE5]",
                border: "border-[#FFD5C7]",
                text: "text-[#C0390B]"
              },
              {
                q: "How does the Mandatory Root Cause Analysis work?",
                a: "When an engineer marks an incident as resolved, CrashLedger requires completion of a structured 5-Whys analysis and at least one follow-up prevention action item before the incident can be closed.",
                bg: "bg-[#F3E8FF]",
                border: "border-[#E9D5FF]",
                text: "text-[#7E22CE]"
              },
              {
                q: "Can I try CrashLedger without a credit card?",
                a: "Yes! You can start on the Free Plan with up to 10 incidents per month and 5 workspace members completely free without entering any billing details.",
                bg: "bg-[#E0F2FE]",
                border: "border-[#BAE6FD]",
                text: "text-[#0369A1]"
              },
              {
                q: "How does recurring failure detection calculate risk scores?",
                a: "Our algorithm monitors failure frequency and downtime minutes per system component over a 30-day rolling window, alerting teams when risk metrics cross critical thresholds.",
                bg: "bg-[#FEF3C7]",
                border: "border-[#FDE68A]",
                text: "text-[#B45309]"
              }
            ].map((faq, i) => (
              <div
                key={i}
                className={`rounded-2xl border transition-all cursor-pointer overflow-hidden ${faq.bg} ${faq.border}`}
                onClick={() => toggleFaq(i)}
              >
                <div className="flex items-center justify-between p-5">
                  <span className={`text-base font-bold ${faq.text}`}>
                    {faq.q}
                  </span>
                  <div className={`w-7 h-7 rounded-full bg-white/70 flex items-center justify-center transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                    <ChevronDown className={`w-4 h-4 ${faq.text}`} />
                  </div>
                </div>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-1 text-sm text-neutral-700 leading-relaxed font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* FOOTER (Habitus Modern Charcoal/Navy Footer) */}
      <footer className="mt-20 bg-[#111827] text-white border-t border-white/10 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            
            {/* Col 1 */}
            <div className="md:col-span-4">
              <div className="mb-4">
                <Logo variant="light" tone="brand" size={36} />
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed mb-6 max-w-sm">
                Operational failure intelligence platform. Giving modern engineering teams the tools to stop repeating the same outages.
              </p>
              <p className="text-xs text-neutral-500">
                &copy; {new Date().getFullYear()} CrashLedger Inc. All rights reserved.
              </p>
            </div>

            {/* Col 2 */}
            <div className="md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">Product</p>
              <ul className="space-y-2.5 text-sm text-neutral-300">
                <li><a href="#features" className="hover:text-white transition-colors">Incident Engine</a></li>
                <li><a href="#metrics" className="hover:text-white transition-colors">MTTR Analytics</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Live Demo</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">Company</p>
              <ul className="space-y-2.5 text-sm text-neutral-300">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Engineering Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Col 4 Newsletter */}
            <div className="md:col-span-4">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">Newsletter</p>
              <p className="text-sm text-neutral-300 mb-4">
                Get monthly engineering reliability case studies & postmortem breakdowns in your inbox.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-sm placeholder-neutral-400 focus:outline-none focus:border-[#FA5A2A] flex-1"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#FA5A2A] hover:bg-[#E85022] text-white text-sm font-bold shadow-md transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}
