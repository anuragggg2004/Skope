# Setup & Configuration Guide

This section covers the local setup, environmental setup, and test suite commands.

---

## 🛠️ Local Installation

To run Skope locally, follow these steps:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/anuragggg2004/Skope.git
    cd Skope
    ```
2.  **Install Node Modules**:
    ```bash
    npm install
    ```
3.  **Setup Environment Variables**:
    Create a `.env` file in the root of the workspace. (See the configuration details below).
4.  **Start Services**:
    *   **Frontend**: `npm run dev` (Runs on port `5173`)
    *   **Backend**: `npm run server` (Runs on port `3000`)

---

## 🔑 Environment Configuration

The backend server loads credentials and settings from the `.env` file:

| Variable | Description | Example / Required Format |
|---|---|---|
| `PORT` | Express server port | `3000` |
| `MONGODB_URI` | MongoDB Connection URL | `mongodb+srv://...` |
| `GEMINI_API_KEY` | Google Gemini API Credential | `AIzaSy...` |
| `OPENROUTER_API_KEY` | OpenRouter Fallback Key | `sk-or-v1-...` |
| `JWT_SECRET` | Token signature secret | `super_secret_jwt_key` |
| `FIREBASE_PROJECT_ID` | Firebase Project identifier | `skope-c67d1` |

---

## 🧪 Running Verification Tests

Skope has a backend integration test suite powered by **Vitest** and **Supertest** to verify backend endpoints, security headers, and CORS rules.

To run the test suite:
```bash
npm run test
```

### Verified Test Checks:
*   `[RAG] Loaded knowledge base successfully` log check.
*   CORS policy validation against unauthorized origins.
*   Verification of Helmet security headers (such as `X-Frame-Options` and `Content-Security-Policy`).
