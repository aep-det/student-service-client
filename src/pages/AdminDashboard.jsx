import { useEffect, useState, useMemo, useRef } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { adminApi } from '../api'
import { Alert } from '../components/Alert'
import { Page } from '../components/Page'
import { CardSkeleton, ChartSkeleton } from '../components/Skeleton'

const COLORS = ['#7c5cff', '#20e3b2', '#ff5a73', '#ffa500', '#9b59b6', '#3498db']

export function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [trendsData, setTrendsData] = useState(null)
  const [popularCourses, setPopularCourses] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingTrends, setLoadingTrends] = useState(true)
  const [loadingPopularCourses, setLoadingPopularCourses] = useState(true)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const dashboardRes = await adminApi.dashboard()
        setData(dashboardRes)

        // Fetch additional data, but don't fail if these fail
        try {
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          const today = new Date()
          const trendsRes = await adminApi.enrollmentTrends({
            startDate: thirtyDaysAgo.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
          })
          setTrendsData(trendsRes)
        } catch (err) {
          console.warn('Failed to load enrollment trends:', err)
        } finally {
          setLoadingTrends(false)
        }

        try {
          const popularRes = await adminApi.popularCourses({ page: 0, size: 10 })
          setPopularCourses(popularRes)
        } catch (err) {
          console.warn('Failed to load popular courses:', err)
        } finally {
          setLoadingPopularCourses(false)
        }
      } catch (err) {
        setError(err?.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const d = data?.data
  const trends = trendsData?.data
  const courses = popularCourses?.data?.content || []

  // Prepare enrollment status data for pie chart
  const enrollmentStatusData = useMemo(() => {
    if (!d?.enrollmentStats) return []
    return [
      { name: 'Active', value: d.enrollmentStats.activeEnrollments || 0 },
      { name: 'Completed', value: d.enrollmentStats.completedEnrollments || 0 },
      { name: 'Dropped', value: d.enrollmentStats.droppedEnrollments || 0 },
    ].filter((item) => item.value > 0)
  }, [d?.enrollmentStats])

  // Prepare enrollment trends data for line chart
  const trendsChartData = useMemo(() => {
    if (!trends?.dailyEnrollments) return []
    return Object.entries(trends.dailyEnrollments)
      .map(([date, count]) => {
        const dateObj = new Date(date)
        return {
          date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          dateSort: dateObj.getTime(),
          enrollments: count,
        }
      })
      .sort((a, b) => a.dateSort - b.dateSort)
      .map(({ dateSort, ...rest }) => rest)
  }, [trends?.dailyEnrollments])

  // Prepare popular courses data for bar chart
  const coursesChartData = useMemo(() => {
    return courses.map((course) => ({
      name: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
      enrollments: course.enrollmentCount || 0,
      capacity: course.capacity || 0,
      rate: ((course.enrollmentRate || 0) * 100).toFixed(1),
    }))
  }, [courses])

  return (
    <Page title="Admin Dashboard">
      {error ? <Alert type="error">{error}</Alert> : null}
      
      {/* Summary Cards */}
      {loading ? (
        <div style={{ marginBottom: '24px' }}>
          <CardSkeleton count={4} />
        </div>
      ) : d ? (
        <div className="grid" style={{ marginBottom: '24px' }}>
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

      {/* Charts Grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
        {/* Enrollment Status Pie Chart */}
        {loading ? (
          <ChartSkeleton height={300} />
        ) : enrollmentStatusData.length > 0 ? (
          <div className="cardish">
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Enrollment Status</h3>
            <ResponsiveContainer width="100%" height={300} debounce={150}>
              <PieChart>
                <Pie
                  data={enrollmentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {enrollmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : null}

        {/* Enrollment Trends Line Chart */}
        {loadingTrends ? (
          <ChartSkeleton height={300} />
        ) : trendsChartData.length > 0 ? (
          <div className="cardish">
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Enrollment Trends (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300} debounce={150}>
              <LineChart data={trendsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.7)" />
                <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(16, 18, 24, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#7c5cff"
                  strokeWidth={2}
                  dot={{ fill: '#7c5cff', r: 4 }}
                  name="Enrollments"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : null}

        {/* Popular Courses Bar Chart */}
        {loadingPopularCourses ? (
          <div style={{ gridColumn: 'span 2' }}>
            <ChartSkeleton height={300} />
          </div>
        ) : coursesChartData.length > 0 ? (
          <div className="cardish" style={{ gridColumn: 'span 2' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Popular Courses</h3>
            <ResponsiveContainer width="100%" height={300} debounce={150}>
              <BarChart data={coursesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.7)" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(16, 18, 24, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => {
                    if (name === 'rate') return `${value}%`
                    return value
                  }}
                />
                <Legend />
                <Bar dataKey="enrollments" fill="#7c5cff" name="Enrollments" isAnimationActive={false} />
                <Bar dataKey="capacity" fill="#20e3b2" name="Capacity" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>
    </Page>
  )
}
