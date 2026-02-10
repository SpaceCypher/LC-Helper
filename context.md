Got it. Below is a **clean, compiled, final Project Context** rewritten from scratch, **including the new “parts of the final solution” section**, and framed **explicitly for an AI-agent–driven system**.
No tech stack, no code — just *what the system is*, *why it exists*, and *how it is structured conceptually*.

---

# Project Context & Background

### (AI-Agent–Driven LeetCode Revision System)

## 1. Background & Motivation

Competitive programming and interview preparation platforms like LeetCode are excellent for **problem solving**, but they provide almost no support for **long-term retention**.

Once a problem is solved:

* The solution is forgotten over time
* Revisiting requires re-reading the entire problem
* There is no structured revision cycle
* Notes and insights are scattered or lost

Most users end up re-solving problems inefficiently, despite having solved them before.

This project exists to **convert solved LeetCode problems into a structured, intelligent revision system**, powered by AI agents and automated data ingestion.

---

## 2. Core Problem Statement

> *“How do I systematically revise problems I have already solved, using my own solutions, without manual tracking?”*

Key challenges:

1. **LeetCode does not expose a complete, reliable API** for all solved problems
2. Existing APIs are capped to recent activity (~20 problems)
3. Manual exports are tedious and error-prone
4. Generic spaced-repetition tools are disconnected from actual code
5. Users lack AI-assisted explanations of *their own* solutions

---

## 3. Why Existing Solutions Fail

Current tools fall short in at least one critical area:

| Category               | Limitation                        |
| ---------------------- | --------------------------------- |
| Analytics dashboards   | Show stats, not solutions         |
| Generic flashcard apps | Manual entry, no sync             |
| API-based sync tools   | Incomplete history                |
| Scrapers               | Fragile, rate-limited             |
| AI tutors              | Explain problems, not *your* code |

None of them provide:

* **Complete solved-problem history**
* **Latest accepted submission per problem**
* **Automatic revision scheduling**
* **AI explanations grounded in user code**

---

## 4. Design Philosophy

The system is built around four principles:

1. **Post-Solve Intelligence**
   The system activates *after* a problem is solved.

2. **User’s Code Is the Source of Truth**
   Explanations, notes, and revision are all derived from the user’s actual submission.

3. **Automation Over Manual Input**
   No manual copying, tagging, or tracking.

4. **Long-Term Retention, Not Short-Term Metrics**
   Focused on memory reinforcement, not streaks or counts.

---

## 5. High-Level Solution Overview

The solution is a **hybrid AI-agent system** that combines:

* Client-side data extraction (browser-level access)
* Server-side persistence and scheduling
* AI agents for reasoning, summarization, and revision guidance

Instead of relying on undocumented or capped APIs, the system observes **real user activity** and converts it into structured knowledge.

---

## 6. Parts of the Final Solution (System Components)

The final system is composed of **six conceptual parts**, each with a distinct responsibility.

---

### 6.1 Browser-Based Capture Layer

**Purpose:**
Capture *all accepted submissions* without API limits.

**Role in the system:**

* Observes user submissions directly from the browser
* Extracts:

  * Problem metadata
  * Accepted code
  * Language
  * Timestamp
* Triggers automatically on successful submission

This layer guarantees **complete coverage** of solved problems.

---

### 6.2 Local Sync Agent

**Purpose:**
Convert raw captured data into structured records.

**Responsibilities:**

* Deduplicate problems
* Keep only the **latest accepted submission per problem**
* Normalize problem identifiers
* Prepare data for backend ingestion

This agent ensures consistency before persistence.

---

### 6.3 Central Knowledge Store

**Purpose:**
Act as the single source of truth for revision.

Stores:

* Problem identity
* Latest solution code
* AI explanation
* User notes
* Revision schedule state

This enables:

* Daily revision views
* Historical tracking
* Intelligent querying

---

### 6.4 AI Explanation Agent

**Purpose:**
Explain *how the user solved the problem*, not how it’s usually solved.

Functions:

* Analyze submitted code
* Identify algorithmic approach
* Extract key insights and pitfalls
* Generate concise, structured explanations
* Maintain consistent output schema

This turns raw code into **understandable reasoning artifacts**.

---

### 6.5 Revision Intelligence Engine

**Purpose:**
Decide *when* and *what* to revise.

Responsibilities:

* Schedule revisions using spaced repetition
* Track revision outcomes
* Adjust intervals based on recall
* Surface due problems daily

This ensures efficient long-term memory reinforcement.

---

### 6.6 User-Facing Revision Interface

**Purpose:**
Make revision frictionless.

Features:

* Daily revision queue
* Side-by-side code and explanation
* Editable notes and recall points
* Completion tracking

The interface is optimized for **review, not problem solving**.

---

## 7. Role of AI Agents in the System

AI agents are not chatbots here — they are **deterministic reasoning components**.

Each agent has:

* A fixed role
* Strict input/output contracts
* No conversational ambiguity

Examples:

* Explanation agent
* Validation agent
* Scheduling agent

This keeps the system **predictable, auditable, and scalable**.

---

## 8. Privacy & Control Model

* All sensitive data capture happens locally
* No credentials are stored server-side
* Users control when sync occurs
* Backend receives only structured problem data

This makes the system safer than server-side scraping or token-based automation.

---

## 9. Non-Goals

To avoid scope creep, the system does **not** aim to:

* Replace LeetCode
* Teach algorithms from scratch
* Evaluate code correctness
* Compete with learning platforms

It strictly focuses on **revision and retention**.

---

## 10. End Goal

The final outcome is a system where:

> Solving a problem once is enough —
> the system ensures you never forget it.

By combining browser-level capture, structured storage, and AI-driven reasoning, the project transforms LeetCode practice into a **personal, long-term algorithm knowledge base**.

---
