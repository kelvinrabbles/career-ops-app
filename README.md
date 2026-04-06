# CareerOps

A personal job search command center. Evaluate job listings, track applications, generate tailored CVs, and scan company career pages — all from one app.

Inspired by [career-ops](https://github.com/santifer/career-ops) by Santiago Fernandez.

## Features

- **Onboarding Wizard** — Set up your profile, paste your CV, define target roles and salary range
- **Dashboard** — Stats at a glance: total applications, average score, status breakdown
- **Job Tracker** — Table view with filter tabs (Evaluated, Applied, Interview, Top scores, Skip)
- **Evaluation System** — Score jobs across 10 weighted dimensions with a guided form
- **CV Editor** — Edit your CV in markdown with live preview and PDF generation
- **Portal Scanner** — Track company career pages and scan for new postings

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Prisma + Neon Postgres
- shadcn/ui + Tailwind CSS (Catppuccin Mocha theme)
- React Query

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/career-ops-app.git
cd career-ops-app
npm install
```

### 2. Set up database

Create a free Postgres database at [neon.tech](https://neon.tech), then:

```bash
cp .env.example .env
# Edit .env with your Neon connection strings
```

### 3. Run migrations

```bash
npx prisma generate
npx prisma db push
```

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the onboarding wizard.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import your repo
3. Add a Neon Postgres integration (or set `DATABASE_URL` and `DIRECT_DATABASE_URL` environment variables)
4. Deploy — Vercel handles the rest

## Scoring System

Jobs are scored across 10 weighted dimensions:

| Dimension | Weight |
|---|---|
| North Star Alignment | 25% |
| CV Match | 15% |
| Seniority Level | 15% |
| Compensation | 10% |
| Growth Trajectory | 10% |
| Remote Quality | 5% |
| Company Reputation | 5% |
| Tech Stack / Tools | 5% |
| Speed to Offer | 5% |
| Cultural Signals | 5% |

**Thresholds:** >=4.0 = Apply, >=3.0 = Consider, <3.0 = Skip

## License

MIT
