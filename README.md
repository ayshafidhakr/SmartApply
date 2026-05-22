# SmartApply 🎯

> **AI-powered job application assistant that helps you land more interviews.**

SmartApply analyzes any job description against your resume and gives you an instant AI-powered match score, rewrites your resume bullets, generates a tailored cover letter, and identifies skill gaps — all in under 60 seconds.

**Live Demo → [smart-apply-nine.vercel.app](https://smart-apply-nine.vercel.app)**
---

## Features

- **Match Score** — Instantly see how well your resume fits a job description (0–100)
- **AI Resume Rewriter** — Rewrites your bullet points using keywords from the job description
- **Cover Letter Generator** — Creates a tailored, professional cover letter in seconds
- **Skill Gap Analysis** — Shows which skills to highlight and which to learn next
- **Application History** — Saves every analysis so you can track your progress
- **Premium Onboarding** — Animated stepper onboarding for first-time users
- **Auth System** — Secure login/signup with Supabase Auth
- **Real-time Progress** — Step-by-step progress indicator during analysis

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| State Management | Zustand |
| Backend | Next.js API Routes (Edge-compatible) |
| AI | Groq API (Llama 3.1 8B Instant) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth |
| PDF Parsing | pdf2json |
| Animations | Motion (Framer Motion) |
| Deployment | Vercel |

---

## Project Structure

```
smartapply/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/        # AI analysis endpoint (Groq)
│   │   │   └── extract-pdf/    # PDF text extraction endpoint
│   │   ├── dashboard/
│   │   │   ├── analyze/        # Resume upload + JD input page
│   │   │   ├── history/        # Past analyses page
│   │   │   ├── results/        # Analysis results page
│   │   │   └── layout.tsx      # Shared dashboard layout + navbar
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   └── page.tsx            # Onboarding stepper (landing)
│   ├── components/
│   │   └── Stepper.tsx         # Animated stepper component
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts       # Browser Supabase client
│   │       └── server.ts       # Server Supabase client
│   ├── store/
│   │   └── useAnalysisStore.ts # Zustand global state
│   └── middleware.ts           # Route protection
├── .env.local                  # Environment variables (not committed)
└── next.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Groq](https://console.groq.com) API key (free)

### 1. Clone the repository

```bash
git clone https://github.com/ayshafidhakr/SmartApply.git
cd SmartApply
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:

```sql
create table applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  job_description text not null,
  resume_text text not null,
  match_score integer,
  rewritten_bullets text,
  cover_letter text,
  skill_suggestions text,
  job_title text,
  company_name text,
  created_at timestamp with time zone default now()
);

alter table applications enable row level security;

create policy "Users can manage their own applications"
on applications for all
using (auth.uid() = user_id);
```

### 4. Configure environment variables

Create `.env.local` in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

```
1. User uploads resume (PDF) + pastes job description
        ↓
2. pdf2json extracts text from the PDF
        ↓
3. Groq API (Llama 3.1) runs 4 prompts in parallel:
   - Match Score    → "How well does this resume fit? (0-100)"
   - Rewrite Bullets → "Rewrite bullets using JD keywords"
   - Cover Letter   → "Write a tailored 3-paragraph letter"
   - Skill Gaps     → "What to highlight vs what to learn"
        ↓
4. Results saved to Supabase (per user, row-level security)
        ↓
5. Results displayed on the results page via Zustand store
```

---

## API Endpoints

### `POST /api/extract-pdf`
Extracts text from an uploaded PDF resume.

**Request:** `multipart/form-data` with `file` field (PDF)

**Response:**
```json
{ "text": "extracted resume text..." }
```

---

### `POST /api/analyze`
Runs AI analysis on resume text + job description.

**Request:**
```json
{
  "resumeText": "your resume text...",
  "jobDescription": "job description text..."
}
```

**Response:**
```json
{
  "score": 85,
  "rewrittenBullets": "• Developed...\n• Built...",
  "coverLetter": "Dear Hiring Manager...",
  "skills": {
    "highlight": ["React", "TypeScript"],
    "learn": ["GraphQL", "Docker"]
  }
}
```

---

## Deployment

This project is deployed on **Vercel** with the following environment variables configured:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GROQ_API_KEY`

To deploy your own instance:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ayshafidhakr/SmartApply)

---

## Key Implementation Details

### State Management with Zustand
Global state is managed via a single Zustand store (`useAnalysisStore`) that handles analysis results, loading state, progress steps, and error messages — eliminating prop drilling across the dashboard.

### PDF Parsing
Uses `pdf2json` for reliable server-side PDF text extraction. The extracted text is truncated to 2000 characters before being sent to the AI to stay within token limits and ensure fast responses.

### Row Level Security
All database queries are protected by Supabase RLS policies — users can only read and write their own data, even if someone tries to access another user's records directly.

### Route Protection
A Next.js middleware file protects all `/dashboard/*` routes, redirecting unauthenticated users to `/login` automatically.

---

## What I Learned Building This

- Full-stack Next.js 15 App Router architecture
- Supabase Auth + PostgreSQL + Row Level Security
- AI API integration with prompt engineering (Groq/Llama)
- Global state management with Zustand
- PDF parsing on the server side
- Protecting API routes and pages with middleware
- Deploying a full-stack app to Vercel with environment variables

---

## Author

**Aysha Fidha K R** — Full Stack Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://linkedin.com/in/ayshafidha)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black)](https://github.com/ayshafidhakr)

---

## License

MIT License — feel free to use this project as inspiration for your own portfolio.
