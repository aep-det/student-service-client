import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function ProtectedRoute() {
  const { bootstrapped, isAuthenticated } = useAuth()

  if (!bootstrapped) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}
