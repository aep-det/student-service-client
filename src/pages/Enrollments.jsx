import { useEffect, useState } from 'react'
import { enrollmentsApi } from '../api'
import { Alert } from '../components/Alert'
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

  const [studentId, setStudentId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [status, setStatus] = useState('Active')
  const [grade, setGrade] = useState('')

  const resetCreate = () => {
    setFormError(null)
    setStudentId('')
    setCourseId('')
  }

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
    setSaving(true)
    setFormError(null)
    try {
      await enrollmentsApi.create({
        studentId: Number(studentId),
        courseId: Number(courseId),
      })
      closeModals()
      await reload()
      showSnackbar('Enrollment created successfully', 'success')
    } catch (err) {
      const errorMessage = err?.message || 'Failed to create enrollment'
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
                <button className="btn btn-secondary" type="button" onClick={() => handleDropClick(r)}>
                  Drop
                </button>
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
          <Field label="Student ID">
            <input value={studentId} onChange={(e) => setStudentId(e.target.value)} type="number" min={1} required />
          </Field>
          <Field label="Course ID">
            <input value={courseId} onChange={(e) => setCourseId(e.target.value)} type="number" min={1} required />
          </Field>
          <div className="form-actions">
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create'}
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
