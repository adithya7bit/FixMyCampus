# FixMyCampus — Closed-Loop Campus Problem-Resolution Web Application

> **Built for Campus Hackathons & University Infrastructure Operations**  
> A full-stack solution empowering students to report campus infrastructure issues (broken doors, stuck elevators, water leaks, food hygiene hazards) with real-time AI category/priority detection, automated department dispatch, SLA auto-escalation, interactive problem heatmaps, and closed-loop student resolution verification.

---

## 🏛️ Project Architecture & Tech Stack

- **Frontend**: **React** (Vite + Modern Vanilla CSS / Design System + Lucide Icons + Canvas Confetti)  
  *Deployment Target*: **Netlify** (`netlify.toml` + `public/_redirects`)
- **Backend**: **Python** (FastAPI + Pydantic + Uvicorn + Modular AI & Heuristic Routing + SLA Escalation Engine)  
  *Deployment Target*: **Vercel Serverless** (`vercel.json` + `api/index.py`)
- **Database & Auth**: **Supabase** (PostgreSQL schema with Row-Level Security, migrations in `supabase/schema.sql`)  
  *Built-in Zero-Config Demo Mode*: Includes an intelligent local seed store so the app runs out-of-the-box even before remote cloud keys are configured!

---

## 🚀 Live Local Demo

Both servers are pre-configured and running locally:

- **Frontend Web Portal**: [`http://localhost:5173/`](http://localhost:5173/)
- **Backend FastAPI API**: [`http://127.0.0.1:8000/`](http://127.0.0.1:8000/)
- **Interactive Swagger Docs**: [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs)

---

## 🔑 Key Features Walkthrough for Hackathon Judges

### 1. Two Authenticated Experiences
- **Student Dashboard**: Report physical campus issues, track live lifecycle (`pending` → `assigned` → `in_progress` → `resolved` → `closed`), and verify fixes.
- **Admin Command Center**: Multi-department queue (Electrical, Civil/Plumbing, Housekeeping, IT, Food Services, Hostel, Security), staff assignment, resolution proofs, and analytics.
- **1-Click Persona Switcher**: In the top-right navbar, switch between:
  - **Alex Rivera** *(Student CS2023-049)*
  - **Marcus Vance** *(Electrical Admin)*
  - **Elena Rostova** *(Civil & Plumbing Admin)*
  - **Dr. Sarah Lin** *(Food Services Health Officer)*
  - **Priya Sharma** *(IT & Digital Admin)*

### 2. Intelligent Complaint Reporting
- **In-App Location Picker**: Structured campus selector (Building → Floor → Room / Area). No QR codes needed.
- **Real-Time AI Category & Priority Detection**: As the student types the title and description, the AI classifies the department (e.g. "elevator stuck" → Electrical & Power), determines priority (`urgent`, `high`, `medium`, `low`), calculates target SLA hours, and displays explainable reasoning.
- **Proactive Duplicate Detection**: Semantic token overlap and location matching flags existing open tickets before submission, allowing students to **upvote an existing ticket** rather than creating duplicates.
- **Fast-Track Emergency Flag**: Life-safety issues (fire, live wires, trapped elevators) bypass standard queues, trigger pulsing red radar visual flags, and immediately alert campus management.

### 3. Closed-Loop Resolution Verification (Core Innovation)
- Campus maintenance is incomplete until the student confirms the fix.
- When an admin marks a ticket as `resolved` (with an attached repair note and resolution photo):
  - The reporting student receives an immediate verification banner: **Action Required: Verify Resolution**.
  - **Option A - Confirm Fixed**: Marks status as `closed` and triggers celebratory confetti!
  - **Option B - Reopen (Still Broken)**: Marks status as `reopened`, logs the student's reason into the audit timeline, and alerts the department head.

### 4. SLA Auto-Escalation Engine
- Configurable response ceilings:
  - **Urgent**: 2 Hours
  - **High**: 12 Hours
  - **Medium**: 24 Hours
  - **Low**: 48 Hours
- Tickets sitting in `pending` or `assigned` past the SLA threshold are automatically flagged with high visual alert banners and escalated to the Campus Operations Director & Chief Engineer.

### 5. Campus Problem Density Heatmap
- Visual blueprint of the campus layout (Engineering Block A, Science Center, Central Library, Main Cafeteria, Hostel Block 4, etc.).
- Buildings color-coded by density and risk: Critical (Red), Warning (Orange), Moderate (Yellow), Normal (Green).
- Interactive drilldown: clicking any building opens its failure metrics, recurring problem category, and list of open issues.

### 6. Specialized Food Hygiene Module
- Dedicated module for dining halls and cafeterias under Food Services.
- Interactive sanitary audit checklist (Cold storage temperatures, cross-contamination prevention, pest controls, water filtration certification, PPE/hairnets, grease trap sanitation).
- Live weighted compliance score calculation (0 - 100) and sanitary grading (Grade A, B, C, F).
- Official inspection outcome logger and corrective action directives tracking.

---

## 🛠️ Project Structure

```
AntiGravity/
├── frontend/                     # React + Vite application (Deploys to Netlify)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Role switcher & demo persona toggles
│   │   │   ├── StudentDashboard.jsx     # Student report list & verification alerts
│   │   │   ├── AdminDashboard.jsx       # Admin queue & operations tabs
│   │   │   ├── ReportComplaintModal.jsx # Location picker & AI duplicate detection
│   │   │   ├── ComplaintDetailModal.jsx # Closed-loop verification & audit timeline
│   │   │   ├── StatusUpdateModal.jsx    # Technician assignment & resolution proof
│   │   │   ├── CampusHeatmap.jsx        # Interactive campus problem density map
│   │   │   ├── FoodHygieneModule.jsx    # Food safety checklists & scoring
│   │   │   ├── AnalyticsDashboard.jsx   # Resolution rates & SLA benchmarks
│   │   │   └── NotificationDrawer.jsx   # In-app notifications
│   │   ├── services/
│   │   │   ├── api.js                   # Backend API client
│   │   │   └── supabase.js              # Supabase client setup
│   │   ├── App.jsx                      # Main React application
│   │   ├── App.css                      # Component styling
│   │   └── index.css                    # Design tokens & dark campus theme
│   ├── netlify.toml                     # Netlify build & redirect config
│   └── vite.config.js                   # Vite dev server with proxy to port 8000
│
├── backend/                      # Python FastAPI application (Deploys to Vercel)
│   ├── api/
│   │   └── index.py                     # Vercel serverless entrypoint
│   ├── main.py                          # FastAPI routes & business logic
│   ├── ai_classifier.py                 # Swappable AI category & priority detector
│   ├── duplicate_detector.py            # Location & semantic duplicate detector
│   ├── escalation_engine.py             # SLA auto-escalation evaluation engine
│   ├── food_hygiene.py                  # Food safety checklist & scoring logic
│   ├── seed_data.py                     # Realistic campus dataset for demo
│   ├── vercel.json                      # Vercel Python serverless configuration
│   └── requirements.txt                 # FastAPI, Uvicorn, Supabase, Pydantic
│
├── supabase/
│   └── schema.sql                       # Complete PostgreSQL schema & RLS policies
└── README.md
```

---

## 🚢 Deployment Guide

### Deploying Frontend to Netlify
1. Connect the `frontend/` directory to your Netlify repository or run:
   ```bash
   cd frontend
   npm run build
   ```
2. Netlify uses `frontend/netlify.toml` which builds into `frontend/dist` and enables SPA routing with `public/_redirects`.
3. Set environment variable `VITE_API_BASE_URL` to your deployed Vercel backend URL.

### Deploying Backend to Vercel
1. In the `backend/` directory, deploy using the Vercel CLI or Git integration:
   ```bash
   cd backend
   vercel
   ```
2. Vercel utilizes `backend/vercel.json` and `backend/api/index.py` using `@vercel/python`.
3. Add optional environment variables in Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `GEMINI_API_KEY` (Optional for LLM-enhanced routing)

### Setting Up Supabase Database
1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase SQL Editor, run the contents of [`supabase/schema.sql`](file:///c:/Users/Lenovo/OneDrive/Desktop/AntiGravity/supabase/schema.sql).
3. Copy the Supabase URL and Anon/Service Role Key into `frontend/.env` and `backend/.env`.
