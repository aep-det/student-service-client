import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { coursesApi, lecturersApi } from '../api'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { Modal } from '../components/Modal'
import { Page } from '../components/Page'
import { Snackbar } from '../components/Snackbar'
import { Table } from '../components/Table'
import { TableSkeleton } from '../components/Skeleton'

export function LecturersPage() {
  const { user } = useAuth()
  const isLecturer = user?.role === 'Lecturer'

  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const isFirstLoad = useRef(true)
  const lastSearchedRef = useRef(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' })

  const [coursesOpen, setCoursesOpen] = useState(false)
  const [coursesLecturer, setCoursesLecturer] = useState(null)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [coursesList, setCoursesList] = useState([])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [hireDate, setHireDate] = useState('')

  const resetForm = () => {
    setFormError(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setPassword('')
    setSpecialization('')
    setPhoneNumber('')
    setHireDate('')
  }

  const openCreate = () => {
    resetForm()
    setCreateOpen(true)
  }

  const closeModal = () => {
    setCreateOpen(false)
    setSaving(false)
    setFormError(null)
  }

  const openLecturerCourses = async (lecturer) => {
    setCoursesLecturer(lecturer)
    setCoursesOpen(true)
    setCoursesList([])
    const lid = lecturer?.lecturerId
    if (!lid) {
      setCoursesLoading(false)
      return
    }
    setCoursesLoading(true)
    try {
      const res = await coursesApi.byLecturer(lid, { page: 0, size: 50 })
      setCoursesList(res?.data?.content || [])
    } catch (err) {
      console.error('Failed to load lecturer courses:', err)
      setCoursesList([])
    } finally {
      setCoursesLoading(false)
    }
  }

  const closeCoursesModal = () => {
    setCoursesOpen(false)
    setCoursesLecturer(null)
    setCoursesList([])
  }

  const reload = async () => {
    setLoading(true)
    setError(null)
    try {
      const q = searchQuery.trim()
      const res = await lecturersApi.list({ page: 0, size: q ? 500 : 20 })
      const list = res?.data?.content || []
      const filtered = q
        ? list.filter((l) => {
            const ql = q.toLowerCase()
            const name = `${l.user?.firstName || ''} ${l.user?.lastName || ''}`.toLowerCase()
            const email = (l.user?.email || '').toLowerCase()
            const spec = (l.specialization || '').toLowerCase()
            return name.includes(ql) || email.includes(ql) || spec.includes(ql)
          })
        : list
      setData({ data: { ...res?.data, content: filtered } })
    } catch (err) {
      setError(err?.message || 'Failed to load lecturers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      lastSearchedRef.current = searchQuery
      reload()
      return
    }
    if (lastSearchedRef.current === searchQuery) return
    lastSearchedRef.current = searchQuery
    const t = setTimeout(reload, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ open: true, message, type })
  }

  const onCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      await lecturersApi.create({
        firstName,
        lastName,
        email,
        password,
        specialization: specialization || undefined,
        phoneNumber: phoneNumber || undefined,
        hireDate: hireDate || undefined,
      })
      closeModal()
      await reload()
      showSnackbar('Lecturer created successfully', 'success')
    } catch (err) {
      const errorMessage = err?.message || 'Failed to create lecturer'
      setFormError(errorMessage)
      showSnackbar(errorMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  const rows = data?.data?.content || []

  return (
    <Page
      title="Lecturers"
      actions={
        isLecturer ? null : (
          <Button type="button" onClick={openCreate}>
            Create lecturer
          </Button>
        )
      }
    >
      <div className="page-toolbar" style={{ marginBottom: 12 }}>
        <input
          type="search"
          placeholder="Search by name, email or specialization…"
          aria-label="Search lecturers by name, email or specialization"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>
      {error ? <Alert type="error">{error}</Alert> : null}
      {loading ? (
        <TableSkeleton
          columns={[
            { key: 'lecturerId', header: 'ID' },
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'specialization', header: 'Specialization' },
          ]}
        />
      ) : (
        <Table
        keyField="lecturerId"
        columns={[
          { key: 'lecturerId', header: 'ID', render: (r) => r.lecturerId },
          { key: 'name', header: 'Name', render: (r) => `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim() },
          { key: 'email', header: 'Email', render: (r) => r.user?.email },
          { key: 'specialization', header: 'Specialization', render: (r) => r.specialization },
        ]}
        rows={rows}
        onRowClick={openLecturerCourses}
      />
      )}

      <Modal title="Create lecturer" open={createOpen} onClose={closeModal}>
        {formError ? <Alert type="error">{formError}</Alert> : null}
        <form className="form" onSubmit={onCreate}>
          <Field label="First name">
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </Field>
          <Field label="Last name">
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </Field>
          <Field label="Email">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </Field>
          <Field label="Password">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              minLength={8}
              required
            />
          </Field>
          <Field label="Specialization">
            <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
          </Field>
          <Field label="Phone number">
            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </Field>
          <Field label="Hire date">
            <input value={hireDate} onChange={(e) => setHireDate(e.target.value)} type="date" />
          </Field>
          <div className="form-actions">
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        title={`Courses – ${[coursesLecturer?.user?.firstName, coursesLecturer?.user?.lastName].filter(Boolean).join(' ') || 'Lecturer'}`}
        open={coursesOpen}
        onClose={closeCoursesModal}
      >
        {coursesLoading ? (
          <TableSkeleton
            columns={[
              { key: 'code', header: 'Code' },
              { key: 'title', header: 'Title' },
              { key: 'credits', header: 'Credits' },
              { key: 'capacity', header: 'Capacity' },
              { key: 'start', header: 'Start' },
              { key: 'end', header: 'End' },
            ]}
            rows={5}
          />
        ) : coursesList.length === 0 ? (
          <p>No courses.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Credits</th>
                  <th>Capacity</th>
                  <th>Start</th>
                  <th>End</th>
                </tr>
              </thead>
              <tbody>
                {coursesList.map((c) => (
                  <tr key={c.courseId}>
                    <td>{c.courseCode || '—'}</td>
                    <td>{c.title || '—'}</td>
                    <td>{c.credits ?? '—'}</td>
                    <td>{c.capacity ?? '—'}</td>
                    <td>{c.startDate || '—'}</td>
                    <td>{c.endDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Page>
  )
}
