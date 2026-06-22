# Welcome to the Skope Wiki! 🔭

Skope is an AI-powered diagnostic and college mapping platform designed for Indian Class 12 students.

This Wiki provides detailed technical documentation on the system's architecture, security controls, database integration, and configuration.

## 📖 Wiki Sections

### 1. [Architecture & Design](Architecture-and-Design)
*   **System Overview**: Detailed layout of the React frontend and Express backend.
*   **Route Protection & Guards**: Deep dive into how we protect the career discovery journey (`/form`, `/preferences`, `/result`) from URL hijacking.
*   **Admin Session Interceptors**: Details on how the admin dashboard protects itself against token expiration.

### 2. [RAG & Database Sync](RAG-and-Database-Sync)
*   **Knowledge Base Structure**: Format of the local `knowledge_base.json` RAG configuration.
*   **CSV College Datasets**: Information on the integrated Delhi NCR and expanded Delhi University (DU) college CSV databases.
*   **Database Synchronizer**: Explanation of how the data is merged, deduplicated, validated, and upserted into MongoDB Atlas.
*   **Dual-Stack Safe Connections**: How the Mongoose connection forces IPv4 to prevent DNS lookup failures.

### 3. [Setup & Configuration](Setup-and-Configuration)
*   **Local Installation**: Step-by-step instructions to get the application up and running.
*   **Environment Configuration**: Reference list of all required API keys, secrets, and database URIs.
*   **Testing & Security Verification**: How to run security audits and validation test suites.

---
<sub>Need help? Contact Anurag Tiwary (Founder) or check the project [README](https://github.com/anuragggg2004/Skope) for a high-level guide.</sub>
