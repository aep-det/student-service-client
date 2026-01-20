import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function AdminOrLecturerRoute() {
  const { bootstrapped, user } = useAuth()

  if (!bootstrapped) return null
  if (user?.role !== 'Admin' && user?.role !== 'Lecturer') return <Navigate to="/" replace />

  return <Outlet />
}
