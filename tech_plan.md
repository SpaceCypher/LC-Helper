Perfect. Below is a **clean, complete, implementation-ready technical context** that you can hand to an **AI agent** and expect it to build the app end-to-end **without further clarification**.

This is **NOT marketing fluff**, **NOT partial notes**, and **NO code** — it’s a **systems + constraints + architecture contract**.

---

# LC Helper

### Personal LeetCode Revision & Recall System

**Technical Implementation Context (AI-Agent Ready)**

---

## 1. Project Background & Motivation

LeetCode does not provide a reliable public API to fetch **all solved problems and latest submissions per problem**.
Existing GraphQL endpoints are **intentionally capped** (≈20 problems) and third-party APIs hit **rate limits**, **break frequently**, or depend on unstable infrastructure.

This project exists to solve **one specific problem**:

> Build a **personal, reliable, recall-first revision system** that tracks *all* solved LeetCode problems, stores the *latest solution per problem*, generates *one-time AI explanations*, and enforces *spaced repetition* — **without depending on LeetCode APIs**.

---

## 2. Core Design Decision (Critical)

### ❌ API-based syncing is unreliable

* LeetCode GraphQL caps results
* Third-party APIs rate-limit (429)
* Credentials & cookies break
* Syncing historical data is fragile

### ✅ Final Solution: **Browser Extension + Local Sync**

Instead of pulling data from LeetCode servers:

* A **browser extension** runs in the user’s authenticated LeetCode session
* It **captures accepted submissions at the moment they happen**
* It extracts:

  * problem slug
  * language
  * final submitted code
  * timestamp
* It sends this data **directly to the backend**

This guarantees:

* No rate limits
* No missing history
* No cookies stored server-side
* No dependency on undocumented APIs

---

## 3. High-Level System Architecture

### Components

1. **Browser Extension**
2. **Backend Web App**
3. **Local Database**
4. **AI Explanation Engine**
5. **Revision Scheduler**
6. **Frontend Dashboard**

### Data Flow (End-to-End)

1. User solves a problem on LeetCode
2. Browser extension detects:

   * submission accepted
   * code is visible in DOM / network
3. Extension sends payload → backend API
4. Backend:

   * upserts problem
   * stores latest solution
   * initializes / updates revision state
5. AI explanation is generated **once**
6. Problem enters revision queue
7. User revises daily via dashboard

---

## 4. Non-Goals (Explicit)

* ❌ Multi-user support
* ❌ Public SaaS deployment
* ❌ Competitive features / leaderboards
* ❌ Live syncing of old LeetCode history
* ❌ Real-time collaboration

This is a **single-user, private, self-hosted learning system**.

---

## 5. Technology Stack (Frozen)

### Frontend

* **Next.js (App Router)**
* **TypeScript**
* **Tailwind CSS**
* Monaco Editor (read-only code view)
* Markdown rendering for notes & AI output

### Backend

* Next.js API routes (same project)
* No separate server required

### Database

* **SQLite (local file)**

  * Reason: college Wi-Fi blocks remote DBs
  * Zero network dependency
  * Fully supported by Prisma
* Prisma ORM

> Database is swappable later (Postgres/Supabase) without schema changes.

### AI

* **SDK**: `@google/genai`
* **Model**: `gemini-3-flash-preview`
* **API usage rules**:

  * AI explanations are generated **once per problem**
  * Cached permanently
  * Never regenerated automatically
  * JSON-only responses enforced

### Browser Extension

* Chrome / Chromium-based
* Manifest v3
* Content script + background worker
* Communicates with backend via HTTPS

---

## 6. Project Structure (Expected)

```
LC_Helper/
├── app/
│   ├── page.tsx                 # Daily revision dashboard
│   ├── problems/
│   │   ├── page.tsx             # All problems list
│   │   └── [slug]/page.tsx      # Revision view
│   ├── api/
│   │   ├── sync/route.ts        # Extension → backend ingestion
│   │   ├── ai/explain/route.ts  # AI explanation trigger
│   │   ├── revisions/route.ts  # Revision result updates
│   │   └── notes/route.ts       # Notes CRUD
│   └── layout.tsx
│
├── lib/
│   ├── db.ts                    # Prisma singleton
│   ├── revision.ts              # Spaced repetition logic
│   ├── gemini.ts                # AI wrapper (one-time generation)
│
├── prisma/
│   └── schema.prisma
│
├── extension/
│   ├── manifest.json
│   ├── content.js               # Extract submission data
│   ├── background.js            # Send to backend
│
├── components/
│   ├── ProblemCard.tsx
│   ├── CodeViewer.tsx
│   ├── NotesEditor.tsx
│   └── RevisionControls.tsx
│
├── .env
└── README.md
```

---

## 7. Database Design (Conceptual)

### Core Entities

* **Problem**

  * title
  * slug
  * difficulty
  * createdAt

* **Solution**

  * language
  * code
  * submittedAt
  * one-to-one with Problem (latest only)

* **AIExplanation**

  * approach tag
  * core idea
  * step breakdown
  * complexity
  * insight
  * pitfall
  * optional roast
  * generatedAt

* **Revision**

  * lastReviewed
  * nextReview
  * revisionCount
  * confidence score

* **Note**

  * type: RECALL | DEEP
  * content
  * timestamps

---

## 8. Revision System Rules

### Spaced Repetition Intervals

Hard-coded and deterministic:

```
[1, 3, 7, 21, 60] days
```

### Revision Outcomes

* SUCCESS → advance interval
* PARTIAL → repeat same interval
* FAIL → reset to day 3

### UX Rule (Important)

> **Recall before recognition is mandatory**

The solution, explanation, and deep notes are **hidden** until the user explicitly reveals them.

---

## 9. AI Explanation Contract (Critical)

### AI Behavior Constraints

* Explain **only the user’s approach**
* No optimizations
* No alternative methods
* Reference actual variables / logic
* Output **strict JSON**
* Deterministic temperature (low)

### Why

This ensures:

* Stable storage
* No hallucinated improvements
* Comparable explanations across time

---

## 10. Browser Extension Responsibilities

### What it does

* Detect accepted submissions
* Extract:

  * titleSlug
  * code
  * language
  * timestamp
* POST payload to backend `/api/sync`

### What it does NOT do

* No database access
* No AI calls
* No long-term storage

The extension is **dumb but reliable**.

---

## 11. Security & Privacy Model

* No credentials stored server-side
* No LeetCode cookies leave browser
* Backend is local / private
* No authentication required (single user)
* AI API key stored in `.env`

---

## 12. Development Constraints

* Must work offline (except AI calls)
* Must work on restrictive networks
* Must tolerate AI rate limits
* Must never lose historical data once ingested

---

## 13. Expected Outcome

At the end, the system provides:

* A **daily list of problems to revise**
* A **clean revision flow**:
  recall → reveal → reflect → rate
* Permanent storage of:

  * latest solutions
  * personal notes
  * AI explanations
* Zero dependence on LeetCode APIs

---

## 14. AI-Agent Readiness Check

An AI agent **can** build this app from this context because:

* Scope is finite
* Decisions are frozen
* Architecture is explicit
* Constraints are documented
* No ambiguous requirements remain

---

