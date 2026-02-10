# LC Helper 🧠

**Your Personal LeetCode Second Brain**

A privacy-focused, Recall-First revision system that ensures you **never forget** an algorithm you've solved. It combines automated capture, strict AI explanations, and smart spaced repetition into a premium, distraction-free dashboard.

---

## ✨ Features

### 1. Zero-Friction Capture
- **Browser Extension**: Automatically detects when you submit an *Accepted* solution on LeetCode.
- **Smart Sync**: Instantly captures your code, problem details, constraints, and complexity analysis.
- **No API Dependency**: Works directly with the DOM, making it resilient to API changes.

### 2. Strict AI Explanations (Gemini Powered)
- **Code-Based Analysis**: The AI reads *your specific code* to explain the logic.
- **No Cheat Sheet**: It is strictly forbidden from generating new code or suggesting "better" solutions.
- **Mental Models**: Focuses on "Core Idea", "Key Insight", and "Common Pitfalls" to build long-term understanding.

### 3. Smart Revision System
- **Daily Review Cap**: Limits you to **3 problems per day** to prevent burnout.
- **Auto-Redistribution**: If you miss a day, problems are automatically spread out to future slots.
- **Spaced Repetition**: Uses a scientifically backed schedule: `[2, 3, 7, 21, 60]` days.
- **Active Recall**: The UI hides the solution until you've tried to mentally reconstruct it.

### 4. Interactive Dashboard
- **Calendar View**: Visualise your revision schedule with a GitHub-style activity grid.
- **Status Indicators**:
  - 🔵 **Scheduled**: Upcoming reviews
  - 🟡 **Due**: Ready for review today
  - 🟢 **Completed**: All done for the day
  - 🔴 **Overdue**: Missed targets
- **Upcoming List**: A sorted agenda of what's coming up next week.

---

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- Chrome-based browser (Chrome, Edge, Brave, Arc)
- A Google Gemini API Key (Free tier works great!)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/lc-helper.git
cd lc-helper
npm install
```

### 2. Database Setup
Initialize the local SQLite database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Environment Config
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL="file:./dev.db"
```

### 4. Start the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see your dashboard.

---

## 🧩 Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Toggle **Developer mode** in the top right.
3. Click **Load unpacked**.
4. Select the `extension/` folder inside this project directory.
5. That's it! The LC Helper icon should appear in your toolbar.

---

## 🚀 How It Works

### Step 1: Solve
Go to LeetCode and solve a problem. As soon as you see the **"Accepted"** screen, the extension will animate and notify you: *"Synced to LC Helper!"*

### Step 2: Review (The Next Day)
Check your Dashboard. You'll see today's 3 problems.
1. **Recall**: Read the problem title and your old notes. Try to remember the approach.
2. **Reveal**: Click to see your code and the AI explanation.
3. **Rate**: Mark as **Success**, **Partial**, or **Fail**.
   - *Success* → Pushes review to next interval (e.g., 7 days).
   - *Partial/Fail* → Reschedules for sooner (e.g., 2-3 days).

### Step 3: Track
Use the **Calendar** to see your consistency. Green squares mean you've completed your daily 3 problems.

---

## 📚 Philosophy

**Why build this?**
Most "spaced repetition" tools for code are just flashcards. They don't have *your* code, they don't explain *why* it works, and they don't limit your workload.

**LC Helper is different:**
- **It's Personal**: It uses *your* solution as the source of truth.
- **It's Sustainable**: The 3-problem cap ensures you can actually stick to it.
- **It's Focused**: No social features, no leaderboards, no distractions. Just you and your algorithms.

---

## 🏗️ Structure

- **`/app`**: Next.js App Router (Dashboard, Problem Views)
- **`/lib`**: Core logic (Spaced Repetition, Gemini Wrapper, DB)
- **`/extension`**: Chrome Extension source code
- **`/prisma`**: Database schema
- **`/components`**: React UI components (Glassmorphism design)

---

## 📝 License

Personal Use License. Feel free to fork and learn, but please credit the original author.
