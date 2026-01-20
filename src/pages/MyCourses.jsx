import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { coursesApi, enrollmentsApi, lecturersApi, studentsApi } from '../api'
import { Alert } from '../components/Alert'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Page } from '../components/Page'
import { Snackbar } from '../components/Snackbar'
import { Table } from '../components/Table'
import { TableSkeleton } from '../components/Skeleton'

export function MyCoursesPage() {
  const { user } = useAuth()
  const isStudent = user?.role === 'Student'
  const isLecturer = user?.role === 'Lecturer'

  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' })
  const [dropConfirmOpen, setDropConfirmOpen] = useState(false)
  const [itemToDrop, setItemToDrop] = useState(null)
  const [profileError, setProfileError] = useState(null)

  const reload = async () => {
    setLoading(true)
    setError(null)
    setProfileError(null)
    try {
      if (isStudent) {
        const byEmailRes = await studentsApi.byEmail(user.email)
        const student = byEmailRes?.data
        const studentId = student?.studentId
        if (!studentId) {
          setProfileError('Student profile not found.')
          setData({ data: { content: [] } })
          return
        }
        const res = await enrollmentsApi.byStudent(studentId, { page: 0, size: 50 })
        setData(res)
      } else if (isLecturer) {
        const listRes = await lecturersApi.list({ page: 0, size: 500 })
        const list = listRes?.data?.content || []
        const lecturer = list.find((l) => l.user?.email === user?.email)
        const lecturerId = lecturer?.lecturerId
        if (!lecturerId) {
          setProfileError('Lecturer profile not found.')
          setData({ data: { content: [] } })
          return
        }
        const res = await coursesApi.byLecturer(lecturerId, { page: 0, size: 50 })
        setData(res)
      } else {
        setData({ data: { content: [] } })
      }
    } catch (err) {
      setError(err?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isStudent || isLecturer) {
      reload()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudent, isLecturer, user?.email])

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ open: true, message, type })
  }

  const handleDropClick = (enrollment) => {
    setItemToDrop(enrollment)
    setDropConfirmOpen(true)
  }

  const handleDropConfirm = async () => {
    const id = itemToDrop?.enrollmentId
    if (!id) {
      setDropConfirmOpen(false)
      setItemToDrop(null)
      return
    }
    setError(null)
    try {
      await enrollmentsApi.drop(id)
      await reload()
      showSnackbar('Enrollment dropped successfully', 'success')
    } catch (err) {
      setError(err?.message || 'Failed to drop enrollment')
      showSnackbar(err?.message || 'Failed to drop enrollment', 'error')
    } finally {
      setDropConfirmOpen(false)
      setItemToDrop(null)
    }
  }

  if (!isStudent && !isLecturer) {
    return (
      <Page title="My courses">
        <Alert type="info">This page is only available for students and lecturers.</Alert>
      </Page>
    )
  }

  const enrollments = isStudent ? (data?.data?.content || []) : []
  const courses = isLecturer ? (data?.data?.content || []) : []

  return (
    <Page title="My courses">
      {error ? <Alert type="error">{error}</Alert> : null}
      {profileError ? <Alert type="warning">{profileError}</Alert> : null}

      {loading ? (
        <TableSkeleton
          columns={
            isStudent
              ? [
                  { key: 'courseCode', header: 'Code' },
                  { key: 'title', header: 'Title' },
                  { key: 'status', header: 'Status' },
                  { key: 'grade', header: 'Grade' },
                  { key: 'enrollmentDate', header: 'Enrolled' },
                  { key: 'actions', header: 'Actions' },
                ]
              : [
                  { key: 'courseCode', header: 'Code' },
                  { key: 'title', header: 'Title' },
                  { key: 'credits', header: 'Credits' },
                  { key: 'capacity', header: 'Capacity' },
                  { key: 'startDate', header: 'Start' },
                  { key: 'endDate', header: 'End' },
                ]
          }
        />
      ) : isStudent ? (
        <Table
          keyField="enrollmentId"
          columns={[
            { key: 'courseCode', header: 'Code', render: (r) => r.course?.courseCode ?? '—' },
            { key: 'title', header: 'Title', render: (r) => r.course?.title ?? '—' },
            { key: 'status', header: 'Status', render: (r) => r.status ?? '—' },
            { key: 'grade', header: 'Grade', render: (r) => (r.grade != null ? r.grade : '—') },
            {
              key: 'enrollmentDate',
              header: 'Enrolled',
              render: (r) => (r.enrollmentDate ? new Date(r.enrollmentDate).toLocaleDateString() : '—'),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (r) =>
                r.status !== 'Dropped' ? (
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => handleDropClick(r)}
                  >
                    Drop
                  </button>
                ) : (
                  '—'
                ),
            },
          ]}
          rows={enrollments}
        />
      ) : (
        <Table
          keyField="courseId"
          columns={[
            { key: 'courseCode', header: 'Code', render: (r) => r.courseCode ?? '—' },
            { key: 'title', header: 'Title', render: (r) => r.title ?? '—' },
            { key: 'credits', header: 'Credits', render: (r) => (r.credits != null ? r.credits : '—') },
            { key: 'capacity', header: 'Capacity', render: (r) => (r.capacity != null ? r.capacity : '—') },
            { key: 'startDate', header: 'Start', render: (r) => r.startDate ?? '—' },
            { key: 'endDate', header: 'End', render: (r) => r.endDate ?? '—' },
          ]}
          rows={courses}
        />
      )}

      <ConfirmDialog
        open={dropConfirmOpen}
        title="Drop enrollment"
        message={`Are you sure you want to drop ${itemToDrop?.course?.courseCode || itemToDrop?.course?.title || 'this course'}?`}
        onConfirm={handleDropConfirm}
        onCancel={() => {
          setDropConfirmOpen(false)
          setItemToDrop(null)
        }}
        confirmLabel="Drop"
        cancelLabel="Cancel"
        variant="danger"
      />

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Page>
  )
}
