Great question — this is actually the **core intellectual backbone** of the whole app. If this part isn’t clear, the rest is just CRUD + UI.

Below is a **clean, end-to-end explanation of how the revision system works**, written as **context for an AI agent** (and also as a sanity check for you).

---

# Revision System — Concept & Mechanics (Context)

## 1. What the Revision System Is (High Level)

The revision system is a **recall-first spaced repetition engine** designed specifically for **algorithmic problem solving**, not flashcards.

Its goal is **not** to:

* re-teach concepts
* show solutions repeatedly
* optimize code

Its goal **is** to:

> force the user to *reconstruct their own solution from memory*, at increasing time gaps.

---

## 2. Core Philosophy (Very Important)

### Recall > Recognition

Most coding revision tools fail because they show:

* the problem
* then immediately the solution

That trains **recognition**, not **recall**.

This system enforces the following invariant:

> The user must attempt recall **before** seeing the solution, explanation, or notes.

This is enforced **by UI and data flow**, not user discipline.

---

## 3. What Is Being Revised?

Each **Problem** has:

* exactly **one stored solution** (latest accepted)
* exactly **one AI explanation** (generated once)
* multiple **personal notes**
* one **Revision state**

The revision system operates on the **Problem**, not individual submissions.

---

## 4. Revision State (Mental Model)

Each problem has a hidden state that answers:

* When was this last reviewed?
* When should it be reviewed next?
* How confident is the user?
* How many successful recalls have happened?

This state is **not visible to the user directly**, but drives what appears on the dashboard.

---

## 5. Spaced Repetition Schedule

### Fixed, Deterministic Intervals

The system uses **hard-coded intervals** (no ML, no adaptive magic):

```
[1, 3, 7, 21, 60] days
```

Why fixed?

* Predictable
* Easy to reason about
* Transparent
* Good enough for algorithm recall

---

## 6. What Happens When a Problem Is First Added

When a new problem enters the system (via browser extension sync):

1. Problem + solution are stored
2. Revision state is initialized:

   * `revisionCount = 0`
   * `lastReviewed = null`
   * `nextReview = today + 1 day`
   * `confidence = neutral`

The problem is **not shown immediately** unless it’s due.

---

## 7. Daily Dashboard Logic

Every day, the system queries:

> “Which problems are due for revision today or earlier?”

Criteria:

* `nextReview ≤ today`

The dashboard:

* shows **only due problems**
* limits count (e.g. 3–5 max)
* does not allow random browsing

This creates **gentle pressure** without overload.

---

## 8. Revision Flow (Step-by-Step)

This flow is **strict** and intentional.

### Step 1: Enter Revision Mode

User clicks a due problem.

Visible:

* Problem title
* Difficulty
* Recall notes (short, user-written)

Hidden:

* Code
* AI explanation
* Deep notes

---

### Step 2: Recall Phase (Most Important)

User tries to mentally answer:

* What was the approach?
* What was the key trick?
* What was the complexity?
* Where are the pitfalls?

The UI does **nothing** here.
No timers.
No hints.

This friction is intentional.

---

### Step 3: Reveal Phase

User explicitly clicks:

> “I tried → Show solution”

Only now does the system reveal:

* Code
* AI explanation
* Deep notes

This moment is where **error correction** happens.

---

### Step 4: Self-Assessment

User must choose **one outcome**:

* ✅ **SUCCESS**
  → “I recalled most of it correctly”

* ⚠️ **PARTIAL**
  → “I remembered the idea, but missed details”

* ❌ **FAIL**
  → “I blanked or misunderstood”

This is the **only subjective input** in the system.

---

## 9. How the Revision State Updates

This is deterministic logic.

### If SUCCESS

* `revisionCount += 1`
* `nextReview = today + interval[revisionCount]`

### If PARTIAL

* `revisionCount` stays the same
* `nextReview = today + interval[revisionCount]`

### If FAIL

* `revisionCount = 1`
* `nextReview = today + 3 days`

Why not reset to day 1?

* Prevents demoralizing loops
* Encourages recovery, not punishment

---

## 10. Confidence Score (Secondary Signal)

User also sets a **confidence score (1–5)**.

This:

* does NOT affect scheduling (for now)
* is stored for future insights
* helps the user notice patterns (e.g., “I always overestimate DP”)

---

## 11. Notes System & Revision

### Recall Notes

* Short
* Visible **before reveal**
* Act as mental anchors

These are:

> “Things I want my future self to remember”

### Deep Notes

* Longer
* Visible **after reveal**
* Used to capture clarifications, edge cases, insights

Notes evolve across revisions — the system encourages **externalizing learning**.

---

## 12. What the System Does NOT Do

Very important for scope clarity.

The revision system does NOT:

* auto-grade correctness
* time the user
* force daily streaks
* optimize intervals dynamically
* show solutions immediately
* recommend new problems

This is not a gamified platform.
It’s a **personal thinking tool**.

---

## 13. Why This Works (Learning Theory, Informal)

This design aligns with:

* Active recall
* Spaced repetition
* Desirable difficulty
* Error-driven learning

But it avoids:

* Flashcard oversimplification
* Passive rereading
* Over-automation

---

## 14. Mental Summary (One Paragraph)

> Each problem enters the system once, is reviewed at increasing intervals, forces recall before recognition, and updates its schedule based on honest self-assessment. Over time, the user builds durable algorithmic memory rather than familiarity.

---

## 15. AI-Agent Implementation Readiness

An AI agent can implement this because:

* State transitions are explicit
* Intervals are fixed
* UI gating rules are clear
* No hidden heuristics exist

