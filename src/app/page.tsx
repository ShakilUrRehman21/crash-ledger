import Link from "next/link";
import { Archivo_Black, JetBrains_Mono } from "next/font/google";
import "./landing.css";

const display = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--cl-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--cl-mono" });

const ticker = [
  ["INC-0412", "SEV1", "payment-api timeout", "RCA pending"],
  ["INC-0411", "SEV2", "cache stampede", "resolved"],
  ["INC-0409", "SEV3", "cron drift", "recurring x3"],
  ["INC-0405", "SEV2", "queue backlog", "action items open"],
  ["INC-0398", "SEV3", "dns misconfig", "RCA complete"],
];

const steps = [
  ["01", "Log it", "Capture every incident with severity, impact, timeline and owner in one structured record."],
  ["02", "Find the root cause", "Root-cause analysis is required, not optional. Nothing closes until the why is written down."],
  ["03", "Measure the risk", "See which services fail most, which failures repeat, and where your operational risk is growing."],
];

const features = [
  ["Incident ledger", "A single, searchable history of every failure across your workspace."],
  ["Enforced RCA", "Structured root-cause templates and action items that keep teams accountable."],
  ["Recurrence detection", "Spot the failures you keep fixing twice before they become the norm."],
  ["Risk dashboards", "Charts for severity trends, MTTR and service health your team can actually act on."],
];

export default function LandingPage() {
  return (
    <div className={`cl ${display.variable} ${mono.variable}`}>
      <div className="cl-tick" aria-hidden>
        <div className="cl-tick-track">
          {[...ticker, ...ticker].map(([id, sev, what, st], i) => (
            <span key={i}>
              {id} <b>{sev}</b> {what} &middot; {st} <em>&#9650;</em>
            </span>
          ))}
        </div>
      </div>

      <header className="cl-wrap cl-nav">
        <Link href="/" className="cl-brand"><i />CRASHLEDGER</Link>
        <nav>
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <Link href="/sign-in">Sign in</Link>
          <Link href="/sign-up" className="cl-btn cl-btn-sm">Get started</Link>
        </nav>
      </header>

      <main>
        <section className="cl-wrap cl-hero">
          <h1 className="cl-rise">
            Stop<br />repeating<br /><span>the same</span> failures.
          </h1>
          <div className="cl-hero-row">
            <div className="cl-rise cl-d2">
              <p className="cl-lead">
                CrashLedger gives engineering teams a systematic way to track incidents, enforce root-cause
                analysis and measure operational risk, before the next outage hits.
              </p>
              <div className="cl-ctas">
                <Link href="/sign-up" className="cl-btn">File your first incident &#8599;</Link>
                <Link href="/dashboard" className="cl-link">Open dashboard &rarr;</Link>
              </div>
            </div>
            <div className="cl-table cl-rise cl-d3" aria-label="Example incident ledger">
              <div className="cl-tr cl-th"><span>ID</span><span>FAILURE</span><span>STATUS</span></div>
              <div className="cl-tr"><span>INC-0412</span><span>payment-api timeout</span><span className="cl-hot">OPEN</span></div>
              <div className="cl-tr"><span>INC-0409</span><span>cron drift (3rd time)</span><span className="cl-hot">PATTERN</span></div>
              <div className="cl-tr"><span>INC-0398</span><span>dns misconfig</span><span>RCA DONE</span></div>
              <div className="cl-tr"><span>INC-0391</span><span>disk pressure on worker-2</span><span>RCA DONE</span></div>
            </div>
          </div>
        </section>

        <section id="how" className="cl-dark">
          <div className="cl-wrap">
            <p className="cl-kicker">// HOW IT WORKS</p>
            <div className="cl-steps">
              {steps.map(([n, t, d]) => (
                <div key={n} className="cl-step">
                  <span className="cl-num">{n}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="cl-wrap cl-features">
          <h2>Everything a post-mortem<br />should have been.</h2>
          <div className="cl-grid">
            {features.map(([t, d], i) => (
              <div key={t} className="cl-card">
                <span className="cl-num">0{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cl-cta">
          <div className="cl-wrap">
            <h2>The next outage is already scheduled.<br />Be ready for it.</h2>
            <Link href="/sign-up" className="cl-btn cl-btn-inv">Start your ledger &#8599;</Link>
          </div>
        </section>
      </main>

      <footer className="cl-wrap cl-foot">
        <span className="cl-brand"><i />CRASHLEDGER</span>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/sign-in">Sign in</Link>
          <Link href="/sign-up">Sign up</Link>
        </nav>
        <span>&copy; {new Date().getFullYear()} CrashLedger</span>
      </footer>
    </div>
  );
}
