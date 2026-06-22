import React, { useState, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HelpBot from './components/HelpBot'
import CustomCursor from './components/CustomCursor'
import Loader from './components/Loader'

// Lazy load page components for code-splitting & performance optimization
const LandingPage = React.lazy(() => import('./pages/LandingPage'))
const LoginPage = React.lazy(() => import('./pages/LoginPage'))
const FormPage = React.lazy(() => import('./pages/FormPage'))
const PreferencesPage = React.lazy(() => import('./pages/PreferencesPage'))
const ResultPage = React.lazy(() => import('./pages/ResultPage'))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const SharePage = React.lazy(() => import('./pages/SharePage'))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))
const AdminLoginPage = React.lazy(() => import('./pages/AdminLoginPage'))
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage'))

// Only show HelpBot on the landing page
function ConditionalHelpBot() {
  const { pathname } = useLocation()
  if (pathname !== '/') return null
  return <HelpBot />
}

// Smart URL Normalizer / Redirector to handle mistyped, uppercase, and legacy paths
function SmartRouteRedirector({ children }) {
  const { pathname } = useLocation()
  const cleanPath = pathname.replace(/\/+/g, '/').trim()
  const lowerPath = cleanPath.toLowerCase()

  if (['/home', '/index', '/dashboard-home'].includes(lowerPath)) {
    return <Navigate to="/" replace />
  }

  // Legacy/Helper URLs mapping
  if (lowerPath === '/questions') {
    return <Navigate to="/form" replace />
  }
  if (lowerPath === '/results') {
    return <Navigate to="/result" replace />
  }
  if (lowerPath === '/recommendations') {
    return <Navigate to="/preferences" replace />
  }
  if (lowerPath === '/dashboard') {
    return <Navigate to="/admin/dashboard" replace />
  }

  const knownPaths = ['/result', '/profile', '/login', '/form', '/preferences', '/share']
  if (cleanPath !== '/' && cleanPath !== lowerPath && knownPaths.includes(lowerPath)) {
    return <Navigate to={lowerPath} replace />
  }

  return children
}

// Form route guard — requires starting an assessment
function FormRoute({ children }) {
  const { pathReport } = useAuth()
  const isStarted = sessionStorage.getItem('skope_assessment_started') === 'true' ||
                    sessionStorage.getItem('skope_chatHistory') ||
                    sessionStorage.getItem('skope_retake_active') === 'true'

  const isRetake = sessionStorage.getItem('skope_retake_active') === 'true'
  if (pathReport && !isRetake) {
    return <Navigate to="/result" replace />
  }

  if (!isStarted) {
    return <Navigate to="/" replace />
  }
  return children
}

// Preferences route guard — requires completing phase 1 questions
function PreferencesRoute({ children }) {
  const phase1 = sessionStorage.getItem('skope_phase1')
  if (!phase1) {
    return <Navigate to="/form" replace />
  }
  return children
}

// Result route guard — requires having a generated report
function ResultRoute({ children }) {
  const storedReport = sessionStorage.getItem('pathreport')
  if (!storedReport) {
    return <Navigate to="/form" replace />
  }
  return children
}

// Admin route guard — redirects to /admin/login if no valid session token
function AdminRoute({ children }) {
  const token = sessionStorage.getItem('skope_admin_token')
  if (!token) return <Navigate to="/admin/login" replace />
  return children
}

// Fallback spinner during route transitions
const RouteSpinner = () => (
  <>
    <div className="grid-bg" />
    <div className="orb-1" />
    <div className="orb-2" />
    <div className="page-wrapper min-h-screen flex items-center justify-center bg-[#050508]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[rgba(99,102,241,0.15)] border-t-[#6366f1] rounded-full animate-spin mx-auto mb-4" />
        <p className="font-dm text-[11px] text-[rgba(241,245,249,0.35)] uppercase tracking-[1.5px]">Loading skope...</p>
      </div>
    </div>
  </>
)

export default function App() {
  // Show loader only once per session
  const [loaderDone, setLoaderDone] = useState(
    () => sessionStorage.getItem('skope_loaded') === '1'
  )

  const handleLoaderComplete = () => {
    sessionStorage.setItem('skope_loaded', '1')
    setLoaderDone(true)
  }

  return (
    <>
      {/* Custom cursor — desktop only, self-disables on touch */}
      <CustomCursor />

      {/* Premium loader — first visit per session only */}
      {!loaderDone && <Loader onComplete={handleLoaderComplete} />}

      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<RouteSpinner />}>
            <SmartRouteRedirector>
              <Routes>
                {/* Public routes */}
                <Route path="/"      element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/share" element={<SharePage />} />

                {/* Protected routes */}
                <Route path="/form"        element={<ProtectedRoute><FormRoute><FormPage /></FormRoute></ProtectedRoute>} />
                <Route path="/preferences" element={<ProtectedRoute><PreferencesRoute><PreferencesPage /></PreferencesRoute></ProtectedRoute>} />
                <Route path="/result"      element={<ProtectedRoute><ResultRoute><ResultPage /></ResultRoute></ProtectedRoute>} />
                <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                {/* Wildcard 404 Fallback */}
                <Route path="*" element={<NotFoundPage />} />

                {/* Admin routes */}
                <Route path="/admin/login"     element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                <Route path="/admin"           element={<Navigate to="/admin/login" replace />} />
              </Routes>
            </SmartRouteRedirector>
          </Suspense>

          {/* HelpBot only on landing page */}
          <ConditionalHelpBot />
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}
