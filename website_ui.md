Alright, this is the **UI/UX philosophy + practical design guide** you want an AI agent (or yourself) to follow to build a **premium, glassmorphism-style, “feels expensive”** app — without turning it into a Dribbble toy.

This is **design doctrine + actionable rules**, not vague inspiration.

---

# LC Helper – Premium Glass UI Design Guide

## 1. Design Goal (Very Important)

The UI should feel like:

> **A private, focused, high-end tool built for thinking**, not browsing.

Keywords:

* calm
* minimal
* intentional
* slightly futuristic
* zero visual noise

This is **not** a social app, **not** a dashboard stuffed with charts, and **not** a neon-gradient flex.

---

## 2. Overall Visual Language

### Core Style

* **Glassmorphism (controlled, subtle)**
* Rounded corners
* Soft shadows
* Depth via blur, not color
* Dark-first design (light mode optional later)

### Avoid

* Harsh borders
* High-saturation gradients
* Emoji spam
* Flat “Material UI” look
* Overuse of glass (everything ≠ glass)

Glass is an **accent**, not the entire app.

---

## 3. Color System

### Background

* Deep neutral dark

  * charcoal / graphite
  * slightly bluish or purplish tint
* Never pure black

Example vibe:

* `#0e1116`
* `#0b0f14`

### Foreground Cards (Glass)

* Semi-transparent
* Frosted blur
* Slight tint (blue/gray)

Rules:

* Opacity: ~6–12%
* Blur: medium (not heavy)
* Border: 1px translucent white at very low opacity

### Accent Colors (Use Sparingly)

Use **one** accent color:

* muted cyan / blue / violet

Use it only for:

* primary buttons
* focus rings
* active states
* success indicators

Never for large surfaces.

---

## 4. Typography (Huge Impact)

### Font Choices

* Use **one** sans-serif family
* Clean, modern, neutral

Good characteristics:

* High x-height
* Slightly wide letterforms
* Good code compatibility

Hierarchy matters more than font choice.

---

### Text Hierarchy Rules

You should be able to tell what’s important **without reading**.

* Page title: large, light weight
* Section title: medium
* Body text: normal
* Meta info: smaller, muted
* Hints / secondary info: lower opacity

Avoid:

* Bold everywhere
* Underlines
* All-caps headings

---

## 5. Layout Principles

### Rule #1: Breathing Space

Whitespace is a **feature**, not wasted space.

* Large margins
* Consistent padding
* Fewer elements per screen

If something feels cramped, it is.

---

### Rule #2: Vertical Flow > Grid Overload

For a thinking app:

* Prefer vertical stacking
* Avoid dense grids unless browsing problems

The **revision view** should feel like reading a notebook, not scanning a table.

---

### Rule #3: Single Primary Action per Screen

Each screen should answer:

> “What am I supposed to do here?”

Examples:

* Dashboard → “Start revision”
* Revision page → “Recall → Reveal → Rate”
* Problems list → “Pick a problem”

No competing CTAs.

---

## 6. Cards & Containers (Glass Done Right)

### When to Use Glass

* Main content cards
* Revision container
* Problem preview cards
* Modals

### When NOT to Use Glass

* Background
* Navigation bar (keep it solid or semi-solid)
* Long scrolling lists (too heavy)

---

### Glass Card Anatomy

Every card should have:

* Rounded corners (consistent radius)
* Soft shadow
* Subtle border
* Internal padding (generous)

Never:

* Hard edges
* Multiple nested glass layers

---

## 7. Buttons & Interactions

### Button Style

* Rounded (pill or soft rectangle)
* Subtle hover animation
* No aggressive shadows

Primary button:

* Filled with accent color
* Text readable but not loud

Secondary button:

* Transparent
* Border or muted text

---

### Interaction Feedback (Critical)

Every action must respond visually:

* Hover → slight glow / lift
* Click → compression
* Disabled → clearly inactive

Nothing should feel “dead”.

---

## 8. Animations & Motion

### Philosophy

Animations should:

* guide attention
* confirm action
* feel physical

They should **never**:

* distract
* loop endlessly
* slow down thinking

---

### Where to Animate

* Card reveal (solution / explanation)
* Page transitions
* Modal open/close
* Button hover

### Where NOT to Animate

* Text content
* Large lists
* Repeated elements

---

## 9. Revision View (Most Important Screen)

This screen defines the app.

### Structure (Conceptual)

1. Problem title + difficulty (always visible)
2. Recall notes (visible immediately)
3. “I tried → Show solution” button
4. Code viewer (after reveal)
5. AI explanation (after reveal)
6. Deep notes (collapsible)
7. Revision rating buttons

---

### UX Rule (Non-negotiable)

> **The solution must never be visible by default.**

The UI should psychologically **encourage recall** before recognition.

---

### Visual Tone Here

* Calm
* Paper-like
* Focused
* No distractions

Think “private study desk”, not “coding platform”.

---

## 10. Notes UI

### Recall Notes

* Short
* Bullet-like
* Limited count
* Muted styling

They should feel like:

> “Things I must remember next time”

### Deep Notes

* Markdown
* Collapsible
* Slightly more expressive
* Still visually restrained

---

## 11. Icons & Visual Elements

* Use icons sparingly
* Simple line icons only
* No emojis in core UI

Icons should support meaning, not decorate.

---

## 12. Error & Empty States

### Empty States

* Calm message
* Subtle illustration (optional)
* Clear next step

Never shame the user.

---

### Errors

* Clear
* Minimal
* Non-alarming unless critical

Example tone:

> “AI explanation not generated yet. You can retry later.”

---

## 13. What Makes It Feel “Premium”

Small things:

* Consistent spacing everywhere
* Same border radius across components
* Predictable interactions
* No visual glitches
* No layout shifts
* Smooth but fast transitions

Premium ≠ flashy
Premium = **nothing feels off**

---

## 14. Final Mental Model for the AI Agent

Tell the AI agent this:

> “Design like you’re building a private macOS productivity app for a single power user who values focus over features.”

If it follows that, the UI will land.


