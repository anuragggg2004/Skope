import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HelpBot from './components/HelpBot'
import CustomCursor from './components/CustomCursor'
import Loader from './components/Loader'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import FormPage from './pages/FormPage'
import PreferencesPage from './pages/PreferencesPage'
import ResultPage from './pages/ResultPage'
import ProfilePage from './pages/ProfilePage'
import SharePage from './pages/SharePage'
import Dashboard from './pages/Dashboard'

// Only show HelpBot on the landing page
function ConditionalHelpBot() {
  const { pathname } = useLocation()
  if (pathname !== '/') return null
  return <HelpBot />
}

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
          <Routes>
            {/* Public routes */}
            <Route path="/"      element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/share" element={<SharePage />} />

            {/* Protected routes */}
            <Route path="/form"        element={<ProtectedRoute><FormPage /></ProtectedRoute>} />
            <Route path="/preferences" element={<ProtectedRoute><PreferencesPage /></ProtectedRoute>} />
            <Route path="/result"      element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
            <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>

          {/* HelpBot only on landing page */}
          <ConditionalHelpBot />
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}
