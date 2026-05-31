import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <>
        <div className="grid-bg" />
        <div className="orb-1" />
        <div className="orb-2" />
        <div className="page-wrapper min-h-screen flex items-center justify-center">
          <div className="text-center animate-fadeUp">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue to-purple mx-auto mb-4 flex items-center justify-center shadow-[0_4px_20px_rgba(79,142,247,0.3)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2.5" fill="none" />
                <line x1="15" y1="15" x2="21" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="w-8 h-8 border-2 border-[rgba(79,142,247,0.2)] border-t-blue rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
