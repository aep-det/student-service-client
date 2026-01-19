import { useEffect, useState } from 'react'
import { lecturersApi } from '../api'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { Modal } from '../components/Modal'
import { Page } from '../components/Page'
import { Table } from '../components/Table'
import { TableSkeleton } from '../components/Skeleton'

export function LecturersPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

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

  const reload = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await lecturersApi.list({ page: 0, size: 20 })
      setData(res)
    } catch (err) {
      setError(err?.message || 'Failed to load lecturers')
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
    } catch (err) {
      setFormError(err?.message || 'Failed to create lecturer')
    } finally {
      setSaving(false)
    }
  }

  const rows = data?.data?.content || []

  return (
    <Page
      title="Lecturers"
      actions={
        <Button type="button" onClick={openCreate}>
          Create lecturer
        </Button>
      }
    >
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
    </Page>
  )
}
