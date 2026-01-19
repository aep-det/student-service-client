import { useMemo, useState } from 'react'
import { coursesApi, lecturersApi, studentsApi } from '../api'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { Page } from '../components/Page'

function pad2(n) {
  return String(n).padStart(2, '0')
}

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function SeedPage() {
  const [countStudents, setCountStudents] = useState(10)
  const [countLecturers, setCountLecturers] = useState(5)
  const [countCourses, setCountCourses] = useState(8)
  const [prefix, setPrefix] = useState('demo')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [log, setLog] = useState([])

  const nowKey = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${pad2(
      d.getHours(),
    )}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`
  }, [])

  const appendLog = (entry) => {
    setLog((prev) => [...prev, { at: new Date().toISOString(), ...entry }])
  }

  const clearLog = () => {
    setLog([])
    setError(null)
  }

  const seedStudents = async (count) => {
    const firstNames = ['Ava', 'Noah', 'Mila', 'Leo', 'Iris', 'Nina', 'Ethan', 'Zoe', 'Aria', 'Owen']
    const lastNames = ['Vale', 'Stone', 'Wright', 'Klein', 'Nova', 'Sato', 'Reed', 'Park', 'Blake', 'Mori']

    for (let i = 1; i <= count; i++) {
      const firstName = pick(firstNames)
      const lastName = pick(lastNames)
      const email = `${prefix}.student.${nowKey}.${i}@example.com`
      const password = `Passw0rd!${i}`

      appendLog({ scope: 'students', status: 'working', message: `Creating ${email}` })
      await studentsApi.create({
        firstName,
        lastName,
        email,
        password,
        enrollmentDate: todayIso(),
      })
      appendLog({ scope: 'students', status: 'ok', message: `Created ${email}` })
    }
  }

  const seedLecturers = async (count) => {
    const firstNames = ['Sage', 'Rene', 'Quinn', 'Theo', 'Nora', 'Lina', 'Hugo', 'Ada', 'Jules', 'Remy']
    const lastNames = ['Aster', 'Cobalt', 'Frost', 'Lumen', 'Vega', 'Cruz', 'Hart', 'Lin', 'Rowe', 'Khan']
    const specializations = ['Algorithms', 'Databases', 'AI', 'Security', 'UI/UX', 'Cloud', 'Networks', 'Compilers']

    for (let i = 1; i <= count; i++) {
      const firstName = pick(firstNames)
      const lastName = pick(lastNames)
      const email = `${prefix}.lecturer.${nowKey}.${i}@example.com`
      const password = `Passw0rd!${i}`

      appendLog({ scope: 'lecturers', status: 'working', message: `Creating ${email}` })
      await lecturersApi.create({
        firstName,
        lastName,
        email,
        password,
        specialization: pick(specializations),
        hireDate: todayIso(),
      })
      appendLog({ scope: 'lecturers', status: 'ok', message: `Created ${email}` })
    }
  }

  const seedCourses = async (count) => {
    const topics = ['Systems', 'Design', 'Data', 'Math', 'Web', 'Security', 'Vision', 'Language', 'Cloud', 'Robotics']
    const vibes = ['Studio', 'Lab', 'Seminar', 'Workshop', 'Field', 'Clinic']

    let lecturerIds = []
    try {
      const res = await lecturersApi.list({ page: 0, size: 50 })
      lecturerIds = (res?.data?.content || [])
        .map((l) => l?.lecturerId)
        .filter((x) => typeof x === 'number')
    } catch {
      lecturerIds = []
    }

    for (let i = 1; i <= count; i++) {
      const courseCode = `${prefix.toUpperCase().slice(0, 4)}-${String(i).padStart(3, '0')}-${nowKey.slice(0, 8)}`
      const title = `${pick(topics)} ${pick(vibes)} ${i}`

      const payload = {
        courseCode,
        title,
        description: 'Seeded demo course',
        credits: 3 + (i % 3),
        capacity: 20 + (i % 5) * 5,
        startDate: todayIso(),
      }

      if (lecturerIds.length > 0) {
        payload.lecturerId = pick(lecturerIds)
      }

      appendLog({ scope: 'courses', status: 'working', message: `Creating ${courseCode}` })
      await coursesApi.create(payload)
      appendLog({ scope: 'courses', status: 'ok', message: `Created ${courseCode}` })
    }
  }

  const run = async (fn) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      const msg = err?.message || 'Seeding failed'
      setError(msg)
      appendLog({ scope: 'error', status: 'error', message: msg })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page
      title="Seed demo data"
      actions={
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" type="button" onClick={clearLog} disabled={busy}>
            Clear log
          </button>
          <Button
            type="button"
            onClick={() =>
              run(async () => {
                await seedLecturers(Number(countLecturers) || 0)
                await seedCourses(Number(countCourses) || 0)
                await seedStudents(Number(countStudents) || 0)
              })
            }
            disabled={busy}
          >
            {busy ? 'Seeding…' : 'Seed all'}
          </Button>
        </div>
      }
    >
      <p>
        Creates batches of Students, Lecturers, and Courses using the API (must be signed in with permissions to
        create).
      </p>

      {error ? <Alert type="error">{error}</Alert> : null}

      <div className="grid" style={{ marginTop: 12 }}>
        <div className="cardish">
          <h3 style={{ marginTop: 0 }}>Settings</h3>
          <div className="form" style={{ gap: 10 }}>
            <Field label="Prefix (used in emails / codes)">
              <input value={prefix} onChange={(e) => setPrefix(e.target.value)} disabled={busy} />
            </Field>
            <Field label="Students">
              <input
                value={countStudents}
                onChange={(e) => setCountStudents(e.target.value)}
                type="number"
                min={0}
                disabled={busy}
              />
            </Field>
            <Field label="Lecturers">
              <input
                value={countLecturers}
                onChange={(e) => setCountLecturers(e.target.value)}
                type="number"
                min={0}
                disabled={busy}
              />
            </Field>
            <Field label="Courses">
              <input
                value={countCourses}
                onChange={(e) => setCountCourses(e.target.value)}
                type="number"
                min={0}
                disabled={busy}
              />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={busy}
              onClick={() => run(() => seedStudents(Number(countStudents) || 0))}
            >
              Seed students
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={busy}
              onClick={() => run(() => seedLecturers(Number(countLecturers) || 0))}
            >
              Seed lecturers
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={busy}
              onClick={() => run(() => seedCourses(Number(countCourses) || 0))}
            >
              Seed courses
            </button>
          </div>
        </div>

        <div className="cardish">
          <h3 style={{ marginTop: 0 }}>Log</h3>
          {log.length === 0 ? (
            <p style={{ margin: 0, opacity: 0.8 }}>Nothing yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {log.slice(-40).map((l, idx) => (
                <div
                  key={`${l.at}-${idx}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '8px 10px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background:
                      l.status === 'error'
                        ? 'rgba(255, 90, 115, 0.10)'
                        : l.status === 'ok'
                          ? 'rgba(32, 227, 178, 0.08)'
                          : 'rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <div style={{ opacity: 0.9 }}>{l.message}</div>
                  <div style={{ opacity: 0.55, fontSize: 12, whiteSpace: 'nowrap' }}>
                    {l.scope}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p style={{ marginTop: 14, opacity: 0.8 }}>
        Tip: courses will auto-attach to a random existing lecturer if any are found.
      </p>
    </Page>
  )
}
