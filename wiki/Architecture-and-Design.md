# System Architecture & Route Protection

Skope is structured as a full-stack JavaScript application built with **React (Vite)** on the frontend and **Express (Node.js)** on the backend.

---

## 🛣️ Route Flow Protection

To prevent students from skipping steps in the career discovery journey (e.g., trying to access `/result` or `/preferences` without completing the diagnostic assessment), Skope implements custom route guards.

### Flow Map:
```
Home (/) 
  └── Start Assessment (Sets flag)
        └── FormPage (/form)
              └── Complete Questions (Saves phase1)
                    └── PreferencesPage (/preferences)
                          └── Save Preferences (Generates report)
                                └── ResultPage (/result)
```

### React Route Guards ([App.jsx](https://github.com/anuragggg2004/Skope/blob/main/src/App.jsx)):

1.  **`FormRoute`**:
    *   Ensures users cannot access `/form` directly unless they have an active assessment in progress (tracked via `sessionStorage.getItem('skope_assessment_started') === 'true'`).
    *   If a user has a completed profile report, it redirects them to `/result` automatically. Otherwise, it redirects them to `/` (Home).
2.  **`PreferencesRoute`**:
    *   Requires the user to have completed Phase 1 questions (tracked via existence of `skope_phase1` data in `sessionStorage`).
    *   Redirects to `/form` if not satisfied.
3.  **`ResultRoute`**:
    *   Requires a generated `pathreport` in `sessionStorage` or database.
    *   If the user refreshes or opens in a new tab, a fallback hook fetches the report from the backend. If no report is found, they are redirected to `/form`.

---

## 🔒 Admin Dashboard Session Interceptor

The Admin Dashboard ([AdminDashboardPage.jsx](https://github.com/anuragggg2004/Skope/blob/main/src/pages/AdminDashboardPage.jsx)) contains an interceptor that listens to all API calls starting with `/api/admin/*`.

If any server request returns a `401 Unauthorized` or `403 Forbidden` response (due to token expiration or revocation):
1.  All admin session tokens are cleared from `sessionStorage` immediately.
2.  The user is automatically redirected to `/admin/login`.
3.  A warning message is displayed.

This ensures the admin interface never exposes stale data or behaves in an unauthorized state.
