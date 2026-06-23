# Skope: AI Career Discovery Platform 🔭

Skope is a visually stunning, Gen Z-native AI-powered diagnostic and college mapping platform designed specifically for Indian Class 12 students to discover their career archetypes, evaluate paths, and map colleges.

Built as a full-stack platform with a React/Vite frontend and an Express/Node.js backend, Skope uses advanced AI (Gemini API with OpenRouter fallbacks) to guide students through a highly personalized diagnostic interview and render an interactive post-report dashboard (PathReport).

---

## 🚀 Key Features

### 1. Diagnostic Chat Assessment
*   **Adaptive Interviewing**: Rather than a static form, Skope conducts a single-turn adaptive dialogue (up to 8 turns/16 messages) where an AI career counselor probes student strengths, self-learning habits, relocation preferences, board marks, and genuine interests.
*   **Direct & Honest Tone**: The AI counselor uses an older-sibling, candid tone that cuts through corporate sugarcoating, challenging vague student responses and calling out unrealistic expectations based on academic marks.

### 2. Visually Stunning PathReport Dashboard
*   **Gen Z-Native Aesthetics**: Designed with a sleek dark-mode aesthetic utilizing vibrant gradients, glassmorphism, micro-animations, and countUp JS animations.
*   **Instagram-Style Stories**: Highlights key insights, top careers, and next steps in a modern story-card format.
*   **Interactive SVG College Map**: Renders an interactive, responsive vector map of India pinning recommended colleges. Pins are color-coded by match difficulty (Red = Reach, Yellow = Target, Green = Safe) and feature active tooltips with geographic positioning coordinates.
*   **Visual Analytics**: Integrated horizontal bar, radar, and doughnut charts using Chart.js to map:
    *   Career match score against 5 key dimensions (Interest, Skill, Earning, Availability, Difficulty).
    *   Distribution of safety levels (Reach/Target/Safe) of target colleges.
    *   Core skill analysis comparison.
*   **AI Counselor Chat Widget**: A persistent sidebar chat interface that lets students query their custom PathReport in real-time, calling a context-aware backend RAG API.
*   **30-Day Motivation Plan**: A step-by-step checklist of actionable goals (syllabus reviews, networking, project building) that tracks user progress, updates a status bar, and rewards completion with a custom celebration confetti animation.

### 3. Route Flow Protection & Security Guards
*   **Access Guards**: Custom React Route wrappers (`FormRoute`, `PreferencesRoute`, `ResultRoute`) protect pages from direct URL manipulation. Users must satisfy page prerequisites (e.g., completing the assessment phase) before accessing results or preference settings.
*   **Legacy URL Normalizers**: Clean redirect matching handles legacy routes (e.g., `/questions` → `/form`, `/results` → `/result`) and routes them through the appropriate security guards.
*   **Admin Session Interceptors**: A lightweight admin API interceptor automatically logs out users and redirects them to the login screen if admin session tokens expire or are revoked.

### 4. Expanded College RAG Knowledge Base & MongoDB Sync
*   **Curated Data Integration**: Merged two databases—the Delhi NCR Colleges Database and the Delhi DU Colleges Expanded list—into a unified local RAG dataset (`knowledge_base.json`), expanding the platform's knowledge base to **247 comprehensive college records**.
*   **MongoDB Atlas Synchronization**: An automated script synchronizes and upserts local RAG records into a remote MongoDB instance, mapping types to standard Mongoose schemas and enforcing strict schema validations.
*   **IPv4 Dual-Stack Protection**: Connection protocols force IPv4 binding (`family: 4`) during database connections to ensure reliable network performance on dual-stack DNS setups.

---

## 🛠️ Technology Stack

### Front-End
*   **Framework**: React (Vite-powered single-page application)
*   **Styling**: Vanilla CSS with Tailwind CSS utilities
*   **Visualizations**: Chart.js for charts and analytics
*   **Animations**: Framer Motion & CSS keyframe animations
*   **Utilities**: html2canvas for PDF/report sharing, Lenis for smooth scroll

### Back-End
*   **Runtime**: Node.js & Express
*   **Database**: MongoDB Atlas (via Mongoose ODM)
*   **AI Integration**: Gemini API (`gemini-2.5-flash` with automatic fallback to OpenRouter `meta-llama/llama-3.3-70b-instruct`)
*   **Authentication**: Firebase Admin SDK & custom JSON Web Tokens (JWT)
*   **Security & Optimization**: Helmet, CORS policies, Express Rate Limit, Express Mongo Sanitize, Compression middleware

---

## 📂 Project Structure

```text
skope/
├── data/
│   ├── Delhi_DU_Colleges_Expanded.csv    # DU expanded college dataset
│   ├── Delhi_NCR_Colleges_Database.csv   # NCR colleges dataset
│   └── knowledge_base.json               # Unified 247-college RAG knowledge base
├── docs/
│   └── github_profile_readme.md          # Profile description document
├── models/
│   ├── College.js                        # Mongoose schema for College records
│   ├── User.js                           # User details schema
│   ├── Report.js                         # Saved PathReport schema
│   └── Admin.js                          # Admin authentication schema
├── public/
│   └── dashboard.html                    # Visual mockup dashboard
├── server/
│   ├── adminAuth.js                      # Admin authentication middleware & logs
│   ├── env.js                            # Backend environment validation (Zod)
│   └── firebaseAuth.js                   # Firebase User verification middleware
├── src/
│   ├── App.jsx                           # Core React routing & flow guards
│   ├── components/                       # Shared UI components
│   ├── pages/                            # Page components (Form, Result, Admin...)
│   └── index.css                         # Global CSS & Design System
├── tests/
│   ├── server.test.js                    # Server CORS and security test suite
│   └── test-gemini.js                    # Gemini API integration test script
├── server.js                             # Express API, RAG loading & Gemini routes
├── vite.config.js                        # Vite build configuration
└── package.json                          # App dependencies & run scripts
```

---

## ⚡ Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas database instance
*   Gemini API Key / OpenRouter Key

### Step 1: Clone and Install Dependencies
```bash
git clone https://github.com/anuragggg2004/Skope.git
cd Skope
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
JWT_SECRET=your_jwt_signing_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
```

### Step 3: Run the Application
Start the frontend development server and backend API concurrently:

**Start Front-End Dev Server (Vite):**
```bash
npm run dev
```

**Start Backend Server:**
```bash
npm run server
```

### Step 4: Run Tests
Validate the security headers, CORS settings, and API responses:
```bash
npm run test
```

---

## 👥 Contributors & Authors
*   **Anurag Tiwary** - Founder & Product Lead ([anuraggg.tech](https://anuraggg.tech))
*   **Claude & Antigravity** - AI Co-Builders

---
<sub>Built for Class 12 students looking to navigate their futures with absolute clarity. 🚀</sub>
