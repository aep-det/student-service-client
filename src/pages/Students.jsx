import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { studentsApi } from '../api'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Field } from '../components/Field'
import { Modal } from '../components/Modal'
import { Page } from '../components/Page'
import { Snackbar } from '../components/Snackbar'
import { Table } from '../components/Table'
import { TableSkeleton } from '../components/Skeleton'

export function StudentsPage() {
  const { user } = useAuth()
  const isLecturer = user?.role === 'Lecturer'

  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const isFirstLoad = useRef(true)
  const inFlightRef = useRef(false)
  const lastQueryRef = useRef('')

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' })

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [enrollmentDate, setEnrollmentDate] = useState('')

  const resetForm = () => {
    setFormError(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setPassword('')
    setDateOfBirth('')
    setPhoneNumber('')
    setAddress('')
    setEnrollmentDate('')
  }

  const openCreate = () => {
    resetForm()
    setCreateOpen(true)
  }

  const openEdit = (student) => {
    setFormError(null)
    setSelected(student)
    setFirstName(student?.user?.firstName || '')
    setLastName(student?.user?.lastName || '')
    setEmail(student?.user?.email || '')
    setPassword('')
    setDateOfBirth(student?.dateOfBirth || '')
    setPhoneNumber(student?.phoneNumber || '')
    setAddress(student?.address || '')
    setEnrollmentDate(student?.enrollmentDate || '')
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
    const q = searchQuery.trim()
    if (inFlightRef.current && lastQueryRef.current === q) return
    inFlightRef.current = true
    lastQueryRef.current = q
    setLoading(true)
    setError(null)
    try {
      const res = await studentsApi.list({ page: 0, size: q ? 500 : 20 })
      const list = res?.data?.content || []
      const filtered = q
        ? list.filter((s) => {
            const ql = q.toLowerCase()
            const name = `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.toLowerCase()
            const email = (s.user?.email || '').toLowerCase()
            return name.includes(ql) || email.includes(ql)
          })
        : list
      setData({ data: { ...res?.data, content: filtered } })
    } catch (err) {
      setError(err?.message || 'Failed to load students')
    } finally {
      inFlightRef.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      reload()
      return
    }
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
      await studentsApi.create({
        firstName,
        lastName,
        email,
        password,
        dateOfBirth: dateOfBirth || undefined,
        phoneNumber: phoneNumber || undefined,
        address: address || undefined,
        enrollmentDate: enrollmentDate || undefined,
      })
      closeModals()
      await reload()
      showSnackbar('Student created successfully', 'success')
    } catch (err) {
      const errorMessage = err?.message || 'Failed to create student'
      setFormError(errorMessage)
      showSnackbar(errorMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  const onUpdate = async (e) => {
    e.preventDefault()
    if (!selected?.studentId) return
    setSaving(true)
    setFormError(null)
    try {
      await studentsApi.update(selected.studentId, {
        firstName,
        lastName,
        email,
        ...(password ? { password } : {}),
        dateOfBirth: dateOfBirth || undefined,
        phoneNumber: phoneNumber || undefined,
        address: address || undefined,
        enrollmentDate: enrollmentDate || undefined,
      })
      closeModals()
      await reload()
      showSnackbar('Student updated successfully', 'success')
    } catch (err) {
      const errorMessage = err?.message || 'Failed to update student'
      setFormError(errorMessage)
      showSnackbar(errorMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (student) => {
    setItemToDelete(student)
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    const id = itemToDelete?.studentId
    if (!id) {
      setConfirmOpen(false)
      setItemToDelete(null)
      return
    }

    setError(null)
    try {
      await studentsApi.remove(id)
      await reload()
      showSnackbar('Student deleted successfully', 'success')
    } catch (err) {
      const errorMessage = err?.message || 'Failed to delete student'
      setError(errorMessage)
      showSnackbar(errorMessage, 'error')
    } finally {
      setConfirmOpen(false)
      setItemToDelete(null)
    }
  }

  const rows = data?.data?.content || []

  return (
    <Page
      title="Students"
      actions={
        isLecturer ? null : (
          <Button type="button" onClick={openCreate}>
            Create student
          </Button>
        )
      }
    >
      <div className="page-toolbar" style={{ marginBottom: 12 }}>
        <input
          type="search"
          placeholder="Search by name or email…"
          aria-label="Search students by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: 280 }}
        />
      </div>
      {error ? <Alert type="error">{error}</Alert> : null}
      {loading ? (
        <TableSkeleton
          columns={[
            { key: 'studentId', header: 'ID' },
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'enrollmentDate', header: 'Enrollment' },
            { key: 'actions', header: 'Actions' },
          ]}
        />
      ) : (
        <Table
        keyField="studentId"
        columns={[
          { key: 'studentId', header: 'ID', render: (r) => r.studentId },
          { key: 'name', header: 'Name', render: (r) => `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim() },
          { key: 'email', header: 'Email', render: (r) => r.user?.email },
          { key: 'enrollmentDate', header: 'Enrollment', render: (r) => r.enrollmentDate },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" type="button" onClick={() => openEdit(r)}>
                  Edit
                </button>
                {isLecturer ? null : (
                  <button className="btn btn-secondary" type="button" onClick={() => handleDeleteClick(r)}>
                    Delete
                  </button>
                )}
              </div>
            ),
          },
        ]}
        rows={rows}
      />
      )}

      <Modal title="Create student" open={createOpen} onClose={closeModals}>
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
          <Field label="Date of birth">
            <input value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} type="date" />
          </Field>
          <Field label="Phone number">
            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </Field>
          <Field label="Address">
            <input value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
          <Field label="Enrollment date">
            <input value={enrollmentDate} onChange={(e) => setEnrollmentDate(e.target.value)} type="date" />
          </Field>
          <div className="form-actions">
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal title="Edit student" open={editOpen} onClose={closeModals}>
        {formError ? <Alert type="error">{formError}</Alert> : null}
        <form className="form" onSubmit={onUpdate}>
          <Field label="First name">
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </Field>
          <Field label="Last name">
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Field>
          <Field label="Email">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </Field>
          <Field label="New password (optional)">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              minLength={8}
              placeholder="Leave blank to keep current"
            />
          </Field>
          <Field label="Date of birth">
            <input value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} type="date" />
          </Field>
          <Field label="Phone number">
            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </Field>
          <Field label="Address">
            <input value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
          <Field label="Enrollment date">
            <input value={enrollmentDate} onChange={(e) => setEnrollmentDate(e.target.value)} type="date" />
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
        title="Delete Student"
        message={`Are you sure you want to delete student ${itemToDelete?.studentId}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setConfirmOpen(false)
          setItemToDelete(null)
        }}
        confirmLabel="Delete"
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
