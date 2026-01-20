import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function AdminRoute() {
  const { bootstrapped, user } = useAuth()

  if (!bootstrapped) return null
  if (user?.role !== 'Admin') return <Navigate to="/" replace />

  return <Outlet />
}
