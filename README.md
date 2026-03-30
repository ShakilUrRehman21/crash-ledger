# CrashLedger

> **Operational Failure Intelligence Platform** — Stop repeating the same failures.

CrashLedger gives engineering teams a systematic way to track incidents, enforce root cause analysis, and measure operational risk — before the next outage hits.

---

## Features

| Feature | Description |
|---|---|
| 🚨 **Incident Lifecycle Engine** | Full status tracking: `open → investigating → resolved → archived` with enforced valid transitions |
| 📊 **Operational Metrics** | Auto-calculated MTTR, MTBF, and Operational Risk Index |
| 🔍 **Mandatory RCA** | Every resolved incident requires a structured Root Cause Analysis with prevention steps |
| 📅 **Visual Timeline** | Chronological event history for every incident — detection to resolution |
| 🔁 **Recurring Failure Detection** | Automatically identifies components with repeated incidents and calculates risk scores |
| 👥 **Multi-Team Workspaces** | Role-based access control with `owner`, `admin`, `engineer`, and `viewer` roles |

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Auth**: [Clerk](https://clerk.com/) (`@clerk/nextjs`)
- **Database**: PostgreSQL via [`postgres`](https://github.com/porsager/postgres)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **UI**: [Radix UI](https://www.radix-ui.com/) + [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: React Hook Form + Zod
- **Utilities**: `date-fns`, `nanoid`, `lucide-react`

---

## Database Schema

```
workspaces          — Multi-team workspaces (free / pro plan)
workspace_members   — Users per workspace with roles (owner, admin, engineer, viewer)
users               — Clerk-synced user records
incidents           — Core incident records with severity, status, environment
incident_timeline_events — Per-incident event log (detected, acknowledged, mitigated, resolved, note)
root_cause_analysis — Structured RCA linked to each resolved incident
action_items        — Follow-up tasks with priority, assignee, and due date
recurring_patterns  — Component-level failure frequency and risk scores
risk_metrics_snapshot — Historical MTTR, MTBF, and Operational Risk Index snapshots
notifications       — Per-user notifications for incidents, tasks, and invites
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (e.g. [Neon](https://neon.tech/), Supabase, or local)
- [Clerk](https://clerk.com/) account for authentication

### 1. Clone & Install

```bash
git clone https://github.com/your-username/crashledger.git
cd crashledger
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the root:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/crashledger

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 3. Set Up the Database

```bash
npm run db:generate   # Generate migration files
npm run db:push       # Push schema to database
```

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:push` | Push schema to DB |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── sign-in/                  # Clerk sign-in
│   ├── sign-up/                  # Clerk sign-up
│   ├── workspace-select/         # Workspace picker after login
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard overview
│   │   ├── incidents/            # Incident list & detail
│   │   ├── analytics/            # Metrics & charts
│   │   ├── action-items/         # Follow-up task tracker
│   │   └── settings/             # Workspace settings
│   └── api/                      # API route handlers
├── components/
│   └── layout/                   # Shared layout components
├── db/
│   ├── schema.ts                 # Drizzle schema definitions
│   ├── relations.ts              # Table relations
│   └── index.ts                  # DB client export
├── lib/                          # Utilities & helpers
└── middleware.ts                 # Clerk route protection
```

---

## Pricing

| Plan | Price | Incidents | Members |
|---|---|---|---|
| Free | $0/mo | 10/month | Up to 5 |
| Pro | $49/mo | Unlimited | Unlimited |

Pro includes: MTBF/MTTR analytics, recurring failure detection, priority support, and CSV/PDF exports.

---

## License

MIT
