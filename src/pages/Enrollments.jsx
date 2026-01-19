import { useEffect, useState } from 'react'
import { enrollmentsApi, studentsApi, coursesApi } from '../api'
import { Alert } from '../components/Alert'
import { Autocomplete } from '../components/Autocomplete'
import { Button } from '../components/Button'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Field } from '../components/Field'
import { Modal } from '../components/Modal'
import { Page } from '../components/Page'
import { Snackbar } from '../components/Snackbar'
import { Table } from '../components/Table'
import { TableSkeleton } from '../components/Skeleton'

export function EnrollmentsPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [itemToDrop, setItemToDrop] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' })

  const [enrollmentRows, setEnrollmentRows] = useState([{ studentId: '', courseId: '', id: Date.now() }])
  const [status, setStatus] = useState('Active')
  const [grade, setGrade] = useState('')

  const resetCreate = () => {
    setFormError(null)
    setEnrollmentRows([{ studentId: '', courseId: '', id: Date.now() }])
  }

  const addEnrollmentRow = () => {
    setEnrollmentRows([...enrollmentRows, { studentId: '', courseId: '', id: Date.now() }])
  }

  const removeEnrollmentRow = (id) => {
    if (enrollmentRows.length > 1) {
      setEnrollmentRows(enrollmentRows.filter((row) => row.id !== id))
    }
  }

  const updateEnrollmentRow = (id, field, value) => {
    setEnrollmentRows(
      enrollmentRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    )
  }

  const searchStudents = async (query) => {
    // Search students by listing all and filtering client-side, or use a search endpoint
    // Since there's no direct student search, we'll list all students with a large page size
    // and filter client-side for better UX
    const response = await studentsApi.list({ page: 0, size: 1000 })
    const allStudents = response?.data?.content || []
    
    // Filter by name or email
    const queryLower = query.toLowerCase()
    const filtered = allStudents.filter((student) => {
      const name = `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.toLowerCase()
      const email = (student.user?.email || '').toLowerCase()
      return name.includes(queryLower) || email.includes(queryLower)
    })
    
    return { data: { content: filtered } }
  }

  const searchCourses = async (query) => {
    return await coursesApi.searchByTitle(query, { page: 0, size: 50 })
  }

  const getStudentDisplayText = (student) => {
    const name = `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim()
    const email = student.user?.email || ''
    return name ? `${name} (${email})` : email || `Student ID: ${student.studentId}`
  }

  const getStudentValue = (student) => student.studentId

  const getCourseDisplayText = (course) => {
    return `${course.courseCode} - ${course.title}`
  }

  const getCourseValue = (course) => course.courseId

  const openCreate = () => {
    resetCreate()
    setCreateOpen(true)
  }

  const openEdit = (enrollment) => {
    setFormError(null)
    setSelected(enrollment)
    setStatus(enrollment?.status || 'Active')
    setGrade(enrollment?.grade ?? '')
    setEditOpen(true)
  }

  const closeModals = () => {
    setCreateOpen(false)
    setEditOpen(false)
    setSelected(null)
    setSaving(false)
    setFormError(null)
    resetCreate()
  }

  const reload = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await enrollmentsApi.list({ page: 0, size: 20 })
      setData(res)
    } catch (err) {
      setError(err?.message || 'Failed to load enrollments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ open: true, message, type })
  }

  const onCreate = async (e) => {
    e.preventDefault()
    
    // Validate all rows
    const validRows = enrollmentRows.filter((row) => row.studentId && row.courseId)
    if (validRows.length === 0) {
      setFormError('Please add at least one enrollment with both student and course selected')
      return
    }

    // Check for duplicates
    const uniquePairs = new Set()
    for (const row of validRows) {
      const pair = `${row.studentId}-${row.courseId}`
      if (uniquePairs.has(pair)) {
        setFormError('Duplicate enrollments detected. Please remove duplicates.')
        return
      }
      uniquePairs.add(pair)
    }

    setSaving(true)
    setFormError(null)
    
    let successCount = 0
    let errorCount = 0
    const errors = []

    try {
      // Create enrollments sequentially to handle errors properly
      for (const row of validRows) {
        try {
          await enrollmentsApi.create({
            studentId: Number(row.studentId),
            courseId: Number(row.courseId),
          })
          successCount++
        } catch (err) {
          errorCount++
          errors.push(err?.message || 'Failed to create enrollment')
        }
      }

      if (errorCount === 0) {
        closeModals()
        await reload()
        showSnackbar(
          successCount === 1
            ? 'Enrollment created successfully'
            : `${successCount} enrollments created successfully`,
          'success'
        )
      } else if (successCount > 0) {
        await reload()
        showSnackbar(
          `${successCount} enrollments created, ${errorCount} failed: ${errors[0]}`,
          'error'
        )
      } else {
        setFormError(errors[0] || 'Failed to create enrollments')
        showSnackbar(errors[0] || 'Failed to create enrollments', 'error')
      }
    } catch (err) {
      const errorMessage = err?.message || 'Failed to create enrollments'
      setFormError(errorMessage)
      showSnackbar(errorMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  const onUpdate = async (e) => {
    e.preventDefault()
    if (!selected?.enrollmentId) return
    setSaving(true)
    setFormError(null)
    try {
      await enrollmentsApi.update(selected.enrollmentId, {
        status,
        grade: grade === '' ? undefined : Number(grade),
      })
      closeModals()
      await reload()
      showSnackbar('Enrollment updated successfully', 'success')
    } catch (err) {
      const errorMessage = err?.message || 'Failed to update enrollment'
      setFormError(errorMessage)
      showSnackbar(errorMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDropClick = (enrollment) => {
    setItemToDrop(enrollment)
    setConfirmOpen(true)
  }

  const handleDropConfirm = async () => {
    const id = itemToDrop?.enrollmentId
    if (!id) {
      setConfirmOpen(false)
      setItemToDrop(null)
      return
    }

    setError(null)
    try {
      await enrollmentsApi.drop(id)
      await reload()
      showSnackbar('Enrollment dropped successfully', 'success')
    } catch (err) {
      const errorMessage = err?.message || 'Failed to drop enrollment'
      setError(errorMessage)
      showSnackbar(errorMessage, 'error')
    } finally {
      setConfirmOpen(false)
      setItemToDrop(null)
    }
  }

  const rows = data?.data?.content || []

  return (
    <Page
      title="Enrollments"
      actions={
        <Button type="button" onClick={openCreate}>
          Create enrollment
        </Button>
      }
    >
      {error ? <Alert type="error">{error}</Alert> : null}
      {loading ? (
        <TableSkeleton
          columns={[
            { key: 'enrollmentId', header: 'ID' },
            { key: 'student', header: 'Student' },
            { key: 'course', header: 'Course' },
            { key: 'status', header: 'Status' },
            { key: 'grade', header: 'Grade' },
            { key: 'actions', header: 'Actions' },
          ]}
        />
      ) : (
        <Table
        keyField="enrollmentId"
        columns={[
          { key: 'enrollmentId', header: 'ID', render: (r) => r.enrollmentId },
          { key: 'student', header: 'Student', render: (r) => r.student?.user?.email },
          { key: 'course', header: 'Course', render: (r) => r.course?.courseCode },
          { key: 'status', header: 'Status', render: (r) => r.status },
          { key: 'grade', header: 'Grade', render: (r) => r.grade },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" type="button" onClick={() => openEdit(r)}>
                  Edit
                </button>
                {r.status !== 'Dropped' && (
                  <button className="btn btn-secondary" type="button" onClick={() => handleDropClick(r)}>
                    Drop
                  </button>
                )}
              </div>
            ),
          },
        ]}
        rows={rows}
      />
      )}

      <Modal title="Create enrollment" open={createOpen} onClose={closeModals}>
        {formError ? <Alert type="error">{formError}</Alert> : null}
        <form className="form" onSubmit={onCreate}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', opacity: 0.85 }}>Enrollments</span>
              <Button
                type="button"
                variant="secondary"
                onClick={addEnrollmentRow}
                disabled={saving}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              >
                + Add Row
              </Button>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {enrollmentRows.map((row, index) => (
                <div
                  key={row.id}
                  style={{
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', opacity: 0.7 }}>Enrollment {index + 1}</span>
                    {enrollmentRows.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => removeEnrollmentRow(row.id)}
                        disabled={saving}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <Field label="Student">
                      <Autocomplete
                        value={row.studentId}
                        onChange={(value) => updateEnrollmentRow(row.id, 'studentId', value)}
                        onSearch={searchStudents}
                        getDisplayText={getStudentDisplayText}
                        getValue={getStudentValue}
                        placeholder="Search by name or email..."
                        disabled={saving}
                      />
                    </Field>
                    <Field label="Course">
                      <Autocomplete
                        value={row.courseId}
                        onChange={(value) => updateEnrollmentRow(row.id, 'courseId', value)}
                        onSearch={searchCourses}
                        getDisplayText={getCourseDisplayText}
                        getValue={getCourseValue}
                        placeholder="Search by course title..."
                        disabled={saving}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <Button
              type="submit"
              disabled={
                saving ||
                enrollmentRows.every((row) => !row.studentId || !row.courseId)
              }
            >
              {saving
                ? `Creating ${enrollmentRows.filter((r) => r.studentId && r.courseId).length}…`
                : `Create ${enrollmentRows.filter((r) => r.studentId && r.courseId).length || ''} enrollment${enrollmentRows.filter((r) => r.studentId && r.courseId).length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal title="Edit enrollment" open={editOpen} onClose={closeModals}>
        {formError ? <Alert type="error">{formError}</Alert> : null}
        <form className="form" onSubmit={onUpdate}>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Dropped">Dropped</option>
              <option value="Completed">Completed</option>
            </select>
          </Field>
          <Field label="Grade">
            <input value={grade} onChange={(e) => setGrade(e.target.value)} type="number" min={0} max={10} step={0.1} />
          </Field>
          <div className="form-actions">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Drop Enrollment"
        message={`Are you sure you want to drop enrollment ${itemToDrop?.enrollmentId}? This action cannot be undone.`}
        onConfirm={handleDropConfirm}
        onCancel={() => {
          setConfirmOpen(false)
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
