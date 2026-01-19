import { useEffect, useState } from 'react'
import { usersApi } from '../api'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { Modal } from '../components/Modal'
import { Page } from '../components/Page'
import { Table } from '../components/Table'
import { TableSkeleton } from '../components/Skeleton'

export function UsersPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Student')

  const resetForm = () => {
    setFormError(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setPassword('')
    setRole('Student')
  }

  const openCreate = () => {
    resetForm()
    setCreateOpen(true)
  }

  const openEdit = (u) => {
    setFormError(null)
    setSelected(u)
    setFirstName(u?.firstName || '')
    setLastName(u?.lastName || '')
    setEmail(u?.email || '')
    setPassword('')
    setRole(u?.role || 'Student')
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
      const res = await usersApi.list({ page: 0, size: 20 })
      setData(res)
    } catch (err) {
      setError(err?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const onCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      await usersApi.create({ firstName, lastName, email, password, role })
      closeModals()
      await reload()
    } catch (err) {
      setFormError(err?.message || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  const onUpdate = async (e) => {
    e.preventDefault()
    if (!selected?.userId) return
    setSaving(true)
    setFormError(null)
    try {
      await usersApi.update(selected.userId, {
        firstName,
        lastName,
        email,
        ...(password ? { password } : {}),
      })
      closeModals()
      await reload()
    } catch (err) {
      setFormError(err?.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (u) => {
    const id = u?.userId
    if (!id) return
    if (!window.confirm(`Delete user ${u?.email || id}?`)) return
    setError(null)
    try {
      await usersApi.remove(id)
      await reload()
    } catch (err) {
      setError(err?.message || 'Failed to delete user')
    }
  }

  const rows = data?.data?.content || []

  return (
    <Page
      title="Users"
      actions={
        <Button type="button" onClick={openCreate}>
          Create user
        </Button>
      }
    >
      {error ? <Alert type="error">{error}</Alert> : null}
      {loading ? (
        <TableSkeleton
          columns={[
            { key: 'userId', header: 'ID' },
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'role', header: 'Role' },
            { key: 'actions', header: 'Actions' },
          ]}
        />
      ) : (
        <Table
        keyField="userId"
        columns={[
          { key: 'userId', header: 'ID', render: (r) => r.userId },
          { key: 'name', header: 'Name', render: (r) => `${r.firstName || ''} ${r.lastName || ''}`.trim() },
          { key: 'email', header: 'Email', render: (r) => r.email },
          { key: 'role', header: 'Role', render: (r) => r.role },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" type="button" onClick={() => openEdit(r)}>
                  Edit
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => onDelete(r)}>
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        rows={rows}
      />
      )}

      <Modal title="Create user" open={createOpen} onClose={closeModals}>
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
          <Field label="Role">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Student">Student</option>
              <option value="Lecturer">Lecturer</option>
              <option value="Admin">Admin</option>
            </select>
          </Field>
          <div className="form-actions">
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal title="Edit user" open={editOpen} onClose={closeModals}>
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
          <Field label="Role">
            <input value={role} readOnly />
          </Field>
          <div className="form-actions">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </Page>
  )
}
