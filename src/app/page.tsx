"use client";
import Link from "next/link";
import { ShieldAlert, ArrowRight, Zap, BarChart2, Users, AlertTriangle, CheckCircle2, Clock, Activity } from "lucide-react";

const features = [
  { icon: AlertTriangle, title: "Incident Lifecycle Engine", desc: "Full status tracking from open → investigating → resolved → archived with enforced valid transitions.", color: "#EF4444" },
  { icon: BarChart2, title: "Operational Metrics", desc: "Auto-calculated MTTR, MTBF, and Operational Risk Index. Know your reliability in real time.", color: "#2563EB" },
  { icon: CheckCircle2, title: "Mandatory Root Cause Analysis", desc: "Every resolved incident requires a structured RCA with prevention steps. No more repeat failures.", color: "#22C55E" },
  { icon: Clock, title: "Visual Timeline", desc: "Chronological event history for every incident — detection to resolution visualized.", color: "#7C3AED" },
  { icon: Activity, title: "Recurring Failure Detection", desc: "Automatically identify components with repeated incidents and calculate risk scores.", color: "#F59E0B" },
  { icon: Users, title: "Multi-Team Workspaces", desc: "Role-based access control with owner, admin, engineer, and viewer roles per workspace.", color: "#06B6D4" },
];

const stats = [
  { value: "48%", label: "reduction in MTTR" },
  { value: "3×", label: "faster incident resolution" },
  { value: "100%", label: "RCA completion rate" },
  { value: "0", label: "repeat critical incidents" },
];

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#F8FAFC", background: "var(--cl-background)", minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 48px", borderBottom: "1px solid var(--cl-border)", position: "sticky", top: 0, background: "rgba(6, 11, 25, 0.8)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #2563EB, #7C3AED)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldAlert size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#F8FAFC" }}>CrashLedger</span>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 14, color: "#94A3B8" }}>
          {["Features", "Pricing", "Docs"].map((item) => (
            <a key={item} href="#" style={{ textDecoration: "none", color: "#94A3B8", fontWeight: 500, transition: "color 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#F8FAFC")} onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}>{item}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/sign-in" style={{ padding: "8px 18px", border: "1px solid var(--cl-border)", borderRadius: 8, fontSize: 14, fontWeight: 500, color: "#94A3B8", textDecoration: "none", transition: "all 0.15s" }}>Sign In</Link>
          <Link href="/sign-up" style={{ padding: "8px 18px", background: "#2563EB", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "96px 48px 80px", textAlign: "center", background: "radial-gradient(circle at top, rgba(37,99,235,0.08) 0%, transparent 60%)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "#60A5FA", marginBottom: 24 }}>
          <Zap size={12} /> Operational Intelligence for Engineering Teams
        </div>
        <h1 style={{ fontSize: 60, fontWeight: 900, lineHeight: 1.1, maxWidth: 720, margin: "0 auto 24px", letterSpacing: "-0.03em" }}>
          Stop Repeating
          <br />
          <span style={{ background: "linear-gradient(135deg, #60A5FA, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            The Same Failures.
          </span>
        </h1>
        <p style={{ fontSize: 18, color: "#94A3B8", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.7 }}>
          CrashLedger gives your team a systematic way to track incidents, enforce root cause analysis, and measure operational risk — before the next outage hits.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/sign-up" style={{ background: "#2563EB", color: "#fff", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 8, transition: "background 0.15s" }}>
            Start Free — No Credit Card <ArrowRight size={16} />
          </Link>
          <Link href="/dashboard" style={{ background: "rgba(255,255,255,0.03)", color: "#F8FAFC", padding: "14px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: "none", border: "1px solid var(--cl-border)" }}>
            View Live Demo
          </Link>
        </div>

        {/* Dashboard Preview Card */}
        <div style={{ marginTop: 64, maxWidth: 900, margin: "64px auto 0", background: "var(--cl-muted)", border: "1px solid var(--cl-border)", borderRadius: 16, padding: 24, boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)", textAlign: "left" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            {[{ label: "Incidents", val: "48", color: "#60A5FA" }, { label: "Open", val: "7", color: "#F87171" }, { label: "MTTR", val: "127m", color: "#FBBF24" }, { label: "Risk Index", val: "62/100", color: "#A78BFA" }].map(({ label, val, color }) => (
              <div key={label} style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid var(--cl-border)", borderRadius: 10, padding: "14px 16px" }}>
                <p style={{ fontSize: 11, color: "#64748B", fontWeight: 500, marginBottom: 4, textTransform: "uppercase" as const }}>{label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color }}>{val}</p>
              </div>
            ))}
          </div>
          <div style={{ height: 120, background: "linear-gradient(90deg, rgba(37,99,235,0.05) 0%, rgba(139,92,246,0.05) 50%, rgba(37,99,235,0.05) 100%)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: 13, border: "1px solid rgba(255,255,255,0.02)" }}>
            📊 Interactive analytics dashboard — sign up to explore
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: "1px solid var(--cl-border)", borderBottom: "1px solid var(--cl-border)", padding: "48px 48px", background: "rgba(15,23,42,0.3)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, textAlign: "center" }}>
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p style={{ fontSize: 40, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{value}</p>
              <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "80px 48px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: "#F8FAFC", marginBottom: 12, letterSpacing: "-0.02em" }}>
              Everything your team needs to<br />own operational excellence
            </h2>
            <p style={{ fontSize: 16, color: "#94A3B8", maxWidth: 500, margin: "0 auto" }}>
              Built for startups and engineering teams that take reliability seriously.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{ background: "var(--cl-muted)", border: "1px solid var(--cl-border)", borderRadius: 14, padding: 24, transition: "box-shadow 0.2s, transform 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = color; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${color}15`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--cl-border)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}>
                <div style={{ width: 44, height: 44, background: color + "15", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Icon size={20} color={color} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "80px 48px", borderTop: "1px solid var(--cl-border)", background: "rgba(15,23,42,0.3)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: "#F8FAFC", marginBottom: 12, letterSpacing: "-0.02em" }}>Simple, transparent pricing</h2>
          <p style={{ fontSize: 15, color: "#94A3B8", marginBottom: 44 }}>Start free. Upgrade when you need more power.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              { name: "Free", price: "$0", period: "/month", color: "#334155", textColor: "#F8FAFC", btnBg: "rgba(255,255,255,0.05)", btnColor: "#E2E8F0", btnBorder: "var(--cl-border)", features: ["10 incidents/month", "Basic analytics", "Up to 5 team members", "Community support"] },
              { name: "Pro", price: "$49", period: "/month", color: "#2563EB", textColor: "#fff", btnBg: "#2563EB", btnColor: "#fff", btnBorder: "transparent", features: ["Unlimited incidents", "Advanced analytics + MTBF/MTTR", "Unlimited team members", "Recurring failure detection", "Priority support", "CSV/PDF exports"] },
            ].map(({ name, price, period, color, textColor, btnBg, btnColor, btnBorder, features }) => (
              <div key={name} style={{ background: name === "Pro" ? "rgba(37,99,235,0.1)" : "var(--cl-muted)", border: name === "Pro" ? "1px solid rgba(37,99,235,0.3)" : "1px solid var(--cl-border)", borderRadius: 16, padding: 28, textAlign: "left" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: name === "Pro" ? "#60A5FA" : "#94A3B8", marginBottom: 4 }}>{name}</p>
                <p style={{ fontSize: 38, fontWeight: 900, color: textColor, letterSpacing: "-0.02em" }}>{price}<span style={{ fontSize: 15, fontWeight: 400, color: name === "Pro" ? "#93C5FD" : "#64748B" }}>{period}</span></p>
                <div style={{ margin: "20px 0", height: 1, background: name === "Pro" ? "rgba(37,99,235,0.2)" : "var(--cl-border)" }} />
                <ul style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 24 }}>
                  {features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: name === "Pro" ? "#E0EFFE" : "#94A3B8" }}>
                      <CheckCircle2 size={14} color={name === "Pro" ? "#60A5FA" : "#475569"} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" style={{ display: "block", textAlign: "center", background: btnBg, color: btnColor, border: `1px solid ${btnBorder}`, padding: "11px 0", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { if (name !== "Pro") { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)" } else { (e.currentTarget as HTMLAnchorElement).style.background = "#3B82F6" } }}
                  onMouseLeave={(e) => { if (name !== "Pro") { (e.currentTarget as HTMLAnchorElement).style.background = btnBg } else { (e.currentTarget as HTMLAnchorElement).style.background = btnBg } }}
                >
                  {name === "Pro" ? "Start Pro Trial" : "Get Started Free"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: "1px solid var(--cl-border)", background: "radial-gradient(ellipse at bottom, rgba(37,99,235,0.15) 0%, transparent 70%)", padding: "72px 48px", textAlign: "center" }}>
        <h2 style={{ fontSize: 40, fontWeight: 900, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>
          Every minute of downtime costs money.
        </h2>
        <p style={{ fontSize: 16, color: "#94A3B8", marginBottom: 36, maxWidth: 500, margin: "0 auto 36px" }}>
          Join engineering teams that have reduced their MTTR by 48% with CrashLedger.
        </p>
        <Link href="/sign-up" style={{ background: "#2563EB", color: "#fff", padding: "14px 36px", borderRadius: 10, fontSize: 15, fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
          Start Free Today <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px 48px", borderTop: "1px solid var(--cl-border)", background: "var(--cl-background)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, background: "linear-gradient(135deg, #2563EB, #7C3AED)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldAlert size={12} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>CrashLedger</span>
        </div>
        <p style={{ fontSize: 12, color: "#64748B" }}>© 2024 CrashLedger. Operational Failure Intelligence Platform.</p>
      </footer>
    </div >
  );
}
