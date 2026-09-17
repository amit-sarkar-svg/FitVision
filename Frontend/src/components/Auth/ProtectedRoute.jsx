import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="flex min-h-[200px] items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" replace state={{ unauthorized: true }} />
  return children
}
