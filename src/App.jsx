import './App.css'

import { NavLink, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/useAuth'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AdminDashboardPage } from './pages/AdminDashboard'
import { CoursesPage } from './pages/Courses'
import { EnrollmentsPage } from './pages/Enrollments'
import { HomePage } from './pages/Home'
import { LecturersPage } from './pages/Lecturers'
import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import { SeedPage } from './pages/Seed'
import { StudentsPage } from './pages/Students'
import { UsersPage } from './pages/Users'

function App() {
  const { isAuthenticated, user, signOut } = useAuth()

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand">Student Service</div>
          <nav className="menu">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/students">Students</NavLink>
            <NavLink to="/courses">Courses</NavLink>
            <NavLink to="/enrollments">Enrollments</NavLink>
            <NavLink to="/lecturers">Lecturers</NavLink>
            <NavLink to="/users">Users</NavLink>
            <NavLink to="/admin">Admin</NavLink>
            {isAuthenticated ? <NavLink to="/seed">Seed</NavLink> : null}
          </nav>
        </div>

        <div className="topbar-right">
          {isAuthenticated ? (
            <>
              <div className="user-chip">
                {user?.email || 'Signed in'}
                {user?.role ? <span className="pill">{user.role}</span> : null}
              </div>
              <button className="btn btn-secondary" onClick={signOut}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink className="btn btn-secondary" to="/login">
                Login
              </NavLink>
              <NavLink className="btn btn-primary" to="/register">
                Register
              </NavLink>
            </>
          )}
        </div>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/enrollments" element={<EnrollmentsPage />} />
            <Route path="/lecturers" element={<LecturersPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/seed" element={<SeedPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}

export default App
