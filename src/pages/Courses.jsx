import { useEffect, useState } from 'react'
import { coursesApi, lecturersApi } from '../api'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { Modal } from '../components/Modal'
import { Page } from '../components/Page'
import { Table } from '../components/Table'
import { TableSkeleton } from '../components/Skeleton'

export function CoursesPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [lecturers, setLecturers] = useState([])
  const [loadingLecturers, setLoadingLecturers] = useState(false)

  const [courseCode, setCourseCode] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [credits, setCredits] = useState('')
  const [lecturerId, setLecturerId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [capacity, setCapacity] = useState('')
  const [courseMetadata, setCourseMetadata] = useState('')

  const resetForm = () => {
    setFormError(null)
    setCourseCode('')
    setTitle('')
    setDescription('')
    setCredits('')
    setLecturerId('')
    setStartDate('')
    setEndDate('')
    setCapacity('')
    setCourseMetadata('')
  }

  const loadLecturers = async () => {
    setLoadingLecturers(true)
    try {
      const res = await lecturersApi.list({ page: 0, size: 1000 })
      setLecturers(res?.data?.content || [])
    } catch (err) {
      console.error('Failed to load lecturers:', err)
      setLecturers([])
    } finally {
      setLoadingLecturers(false)
    }
  }

  const openCreate = () => {
    resetForm()
    loadLecturers()
    setCreateOpen(true)
  }

  const openEdit = (course) => {
    setFormError(null)
    setSelected(course)
    setCourseCode(course?.courseCode || '')
    setTitle(course?.title || '')
    setDescription(course?.description || '')
    setCredits(course?.credits ?? '')
    setLecturerId(course?.lecturer?.lecturerId ?? '')
    setStartDate(course?.startDate || '')
    setEndDate(course?.endDate || '')
    setCapacity(course?.capacity ?? '')
    setCourseMetadata(course?.courseMetadata || '')
    loadLecturers()
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
      const res = await coursesApi.list({ page: 0, size: 20 })
      setData(res)
    } catch (err) {
      setError(err?.message || 'Failed to load courses')
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
      await coursesApi.create({
        courseCode,
        title,
        description: description || undefined,
        credits: credits === '' ? undefined : Number(credits),
        lecturerId: lecturerId === '' ? undefined : Number(lecturerId),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        capacity: capacity === '' ? undefined : Number(capacity),
        courseMetadata: courseMetadata || undefined,
      })
      closeModals()
      await reload()
    } catch (err) {
      setFormError(err?.message || 'Failed to create course')
    } finally {
      setSaving(false)
    }
  }

  const onUpdate = async (e) => {
    e.preventDefault()
    if (!selected?.courseId) return
    setSaving(true)
    setFormError(null)
    try {
      await coursesApi.update(selected.courseId, {
        courseCode,
        title,
        description: description || undefined,
        credits: credits === '' ? undefined : Number(credits),
        lecturerId: lecturerId === '' ? undefined : Number(lecturerId),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        capacity: capacity === '' ? undefined : Number(capacity),
        courseMetadata: courseMetadata || undefined,
      })
      closeModals()
      await reload()
    } catch (err) {
      setFormError(err?.message || 'Failed to update course')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (course) => {
    const id = course?.courseId
    if (!id) return
    if (!window.confirm(`Delete course ${course?.courseCode || id}?`)) return

    setError(null)
    try {
      await coursesApi.remove(id)
      await reload()
    } catch (err) {
      setError(err?.message || 'Failed to delete course')
    }
  }

  const rows = data?.data?.content || []

  return (
    <Page
      title="Courses"
      actions={
        <Button type="button" onClick={openCreate}>
          Create course
        </Button>
      }
    >
      {error ? <Alert type="error">{error}</Alert> : null}
      {loading ? (
        <TableSkeleton
          columns={[
            { key: 'courseId', header: 'ID' },
            { key: 'courseCode', header: 'Code' },
            { key: 'title', header: 'Title' },
            { key: 'credits', header: 'Credits' },
            { key: 'capacity', header: 'Capacity' },
            { key: 'actions', header: 'Actions' },
          ]}
        />
      ) : (
        <Table
        keyField="courseId"
        columns={[
          { key: 'courseId', header: 'ID', render: (r) => r.courseId },
          { key: 'courseCode', header: 'Code', render: (r) => r.courseCode },
          { key: 'title', header: 'Title', render: (r) => r.title },
          { key: 'credits', header: 'Credits', render: (r) => r.credits },
          { key: 'capacity', header: 'Capacity', render: (r) => r.capacity },
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

      <Modal title="Create course" open={createOpen} onClose={closeModals}>
        {formError ? <Alert type="error">{formError}</Alert> : null}
        <form className="form form-two-column" onSubmit={onCreate}>
          <Field label="Course code" className="form-full-width">
            <input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} required />
          </Field>
          <Field label="Title" className="form-full-width">
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Field>
          <Field label="Description" className="form-full-width">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              style={{ resize: 'vertical', minHeight: '50px' }}
            />
          </Field>
          <Field label="Credits">
            <input value={credits} onChange={(e) => setCredits(e.target.value)} type="number" min={1} max={10} />
          </Field>
          <Field label="Lecturer">
            <select
              value={lecturerId}
              onChange={(e) => setLecturerId(e.target.value)}
              disabled={loadingLecturers}
            >
              <option value="">Select a lecturer</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer.lecturerId} value={lecturer.lecturerId}>
                  {lecturer.user?.firstName} {lecturer.user?.lastName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Start date">
            <input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" />
          </Field>
          <Field label="End date">
            <input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" />
          </Field>
          <Field label="Capacity">
            <input value={capacity} onChange={(e) => setCapacity(e.target.value)} type="number" min={1} />
          </Field>
          <Field label="Metadata" className="form-full-width">
            <textarea
              value={courseMetadata}
              onChange={(e) => setCourseMetadata(e.target.value)}
              rows={1}
              style={{ resize: 'vertical', minHeight: '40px' }}
              placeholder="Optional additional metadata"
            />
          </Field>
          <div className="form-actions">
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal title="Edit course" open={editOpen} onClose={closeModals}>
        {formError ? <Alert type="error">{formError}</Alert> : null}
        <form className="form form-two-column" onSubmit={onUpdate}>
          <Field label="Course code" className="form-full-width">
            <input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
          </Field>
          <Field label="Title" className="form-full-width">
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Credits">
            <input value={credits} onChange={(e) => setCredits(e.target.value)} type="number" min={1} max={10} />
          </Field>
          <Field label="Lecturer">
            <select
              value={lecturerId}
              onChange={(e) => setLecturerId(e.target.value)}
              disabled={loadingLecturers}
            >
              <option value="">Select a lecturer</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer.lecturerId} value={lecturer.lecturerId}>
                  {lecturer.user?.firstName} {lecturer.user?.lastName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Start date">
            <input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" />
          </Field>
          <Field label="End date">
            <input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" />
          </Field>
          <Field label="Capacity">
            <input value={capacity} onChange={(e) => setCapacity(e.target.value)} type="number" min={1} />
          </Field>
          <Field label="Description" className="form-full-width">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              style={{ resize: 'vertical', minHeight: '60px' }}
              placeholder="Optional course description"
            />
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
