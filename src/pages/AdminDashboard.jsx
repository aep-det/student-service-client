import { useEffect, useState } from 'react'
import { adminApi } from '../api'
import { Alert } from '../components/Alert'
import { Page } from '../components/Page'

export function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await adminApi.dashboard()
        setData(res)
      } catch (err) {
        setError(err?.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const d = data?.data

  return (
    <Page title="Admin Dashboard">
      {error ? <Alert type="error">{error}</Alert> : null}
      {loading ? <p>Loading…</p> : null}
      {d ? (
        <div className="grid">
          <div className="cardish">
            <div className="metric-label">Total Users</div>
            <div className="metric-value">{d.totalUsers}</div>
          </div>
          <div className="cardish">
            <div className="metric-label">Total Students</div>
            <div className="metric-value">{d.totalStudents}</div>
          </div>
          <div className="cardish">
            <div className="metric-label">Total Courses</div>
            <div className="metric-value">{d.totalCourses}</div>
          </div>
          <div className="cardish">
            <div className="metric-label">Total Enrollments</div>
            <div className="metric-value">{d.enrollmentStats?.totalEnrollments}</div>
          </div>
        </div>
      ) : null}
    </Page>
  )
}
