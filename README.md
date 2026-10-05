# FixMyCampus — Next-Gen Campus Operations & Issue Resolution Platform

> **Hackathon Edition • Production Grade**  
> A full-stack, closed-loop campus problem resolution platform with real-time AI auto-routing, proactive duplicate upvoting, SLA countdown escalation, 3D WebGL holographic telemetry, and student-verified resolution sign-offs.

## 🌐 Live Deployments

- **Vercel (Primary):** [https://fixmycampus-roan.vercel.app](https://fixmycampus-roan.vercel.app)
- **Netlify (Mirror):** [https://fixmycampus-portal.netlify.app](https://fixmycampus-portal.netlify.app)
- **Database:** Supabase Realtime Cloud (`odtqxytzethpsygotxyc`)

---

## 🌟 Key Innovations

1. **Closed-Loop Student Verification:**
   - Repairs are never closed unilaterally by contractors.
   - When marked "Resolved", the student must confirm the fix with **Confirm Fixed** (triggering confetti) or tap **Reopen (Still Broken)** to alert the department head.

2. **Proactive Duplicate Prevention & Upvoting:**
   - Real-time token matching prevents identical tickets within the same campus block. Students can directly **Upvote** an existing issue, elevating community urgency without creating backlog clutter.

3. **Autonomous AI Triage & Urgency SLAs:**
   - Fast NLP engine extracts category (`Electrical`, `Civil & Plumbing`, `IT & Digital`, `Food Services`) and assigns strict SLA deadlines (`Urgent = 2h`, `High = 12h`, `Medium = 24h`).

4. **3D WebGL Campus Holographic Core (Three.js):**
   - Interactive rotating core visualizing campus telemetry and orbiting department satellite nodes.

5. **Campus Problem Density Heatmap:**
   - Visual floor-by-floor and building-by-building incident tracking identifying infrastructure failure hotspots.

---

## 💻 Tech Stack

- **Frontend:** React 19, Vite, Three.js, Lucide Icons, Canvas Confetti.
- **Backend:** Python 3.11, FastAPI, Pydantic v2.
- **Database & Auth:** Supabase PostgreSQL + Row-Level Security (`supabase/schema.sql`).

---

## 🚀 How to Run Locally

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```
Access at `http://localhost:5173`.

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn api.index:app --reload --port 8000
```
Swagger API docs available at `http://localhost:8000/docs`.
