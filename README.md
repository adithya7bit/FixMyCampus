# FixMyCampus — Closed-Loop Campus Problem-Resolution Web Application

> **Built for Campus Hackathons & University Infrastructure Operations**  
> A full-stack solution empowering students to report campus infrastructure issues (broken doors, stuck elevators, water leaks, food hygiene hazards) with real-time AI category/priority detection, automated department dispatch, SLA auto-escalation, interactive problem heatmaps, and closed-loop student resolution verification.

---

## 🌐 Live Production Deployments

- 🚀 **Live Production Frontend (3D WebGL + Motion)**: **[https://frontend-psi-ecru-71.vercel.app](https://frontend-psi-ecru-71.vercel.app)**
- ⚡ **Live Production Backend (FastAPI)**: **[https://backend-phi-lemon-83.vercel.app](https://backend-phi-lemon-83.vercel.app)**
- 📖 **Interactive API Documentation (Swagger)**: **[https://backend-phi-lemon-83.vercel.app/docs](https://backend-phi-lemon-83.vercel.app/docs)**
- 📦 **GitHub Repository**: **[https://github.com/adithya7bit/FixMyCampus](https://github.com/adithya7bit/FixMyCampus)**
- 🗄️ **Supabase Database & Auth**: **[https://odtqxytzethpsygotxyc.supabase.co](https://odtqxytzethpsygotxyc.supabase.co)**
- 🌐 **Netlify Mirror**: **[https://fixmycampus-portal.netlify.app](https://fixmycampus-portal.netlify.app)**

---

## 🏛️ Project Architecture & Tech Stack

- **Frontend**: **React** (Vite + Three.js 3D WebGL Hero + Motion v11+ Spring Physics + Lucide Icons + Canvas Confetti)
- **Backend**: **Python** (FastAPI + Pydantic + Uvicorn + Modular AI & Heuristic Routing + SLA Escalation Engine)
- **Database & Auth**: **Supabase** (PostgreSQL schema with Row-Level Security, migrations in `supabase/schema.sql`)

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

### 4. Interactive 3D WebGL Hero Section (Three.js)
- **Holographic Campus Core**: Dual-layered icosahedron with counter-rotating wireframe layers and orbital cyan energy rings.
- **6 Orbiting Satellites**: Color-coded nodes for Electrical, Plumbing, IT Network, Food Services, Hostel, and Campus Security.
- **Interactive Mouse Parallax & Raycasting**: Camera smoothly tracks cursor; hovering over 3D nodes pops up live telemetry cards.

### 5. SLA Auto-Escalation Engine
- Configurable response ceilings:
  - **Urgent**: 2 Hours
  - **High**: 12 Hours
  - **Medium**: 24 Hours
  - **Low**: 48 Hours
- Tickets sitting in `pending` or `assigned` past the SLA threshold are automatically flagged with high visual alert banners and escalated to the Campus Operations Director & Chief Engineer.

### 6. Campus Problem Density Heatmap
- Visual blueprint of the campus layout (Engineering Block A, Science Center, Central Library, Main Cafeteria, Hostel Block 4, etc.).
- Buildings color-coded by density and risk: Critical (Red), Warning (Orange), Moderate (Yellow), Normal (Green).
- Interactive drilldown: clicking any building opens its failure metrics, recurring problem category, and list of open issues.

### 7. Specialized Food Hygiene Module
- Dedicated module for dining halls and cafeterias under Food Services.
- Interactive sanitary audit checklist (Cold storage temperatures, cross-contamination prevention, pest controls, water filtration certification, PPE/hairnets, grease trap sanitation).
- Live weighted compliance score calculation (0 - 100) and sanitary grading (Grade A, B, C, F).
- Official inspection outcome logger and corrective action directives tracking.
