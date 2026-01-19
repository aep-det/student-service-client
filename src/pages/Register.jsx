import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { Page } from '../components/Page'
import { useAuth } from '../auth/useAuth'

export function RegisterPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUp({ firstName, lastName, email, password, dateOfBirth })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page title="Register">
      {error ? <Alert type="error">{error}</Alert> : null}
      <form className="form" onSubmit={onSubmit}>
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
            required
            minLength={8}
          />
        </Field>
        <Field label="Date of birth (optional)">
          <input value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} type="date" />
        </Field>
        <div className="form-actions">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </Button>
        </div>
      </form>
    </Page>
  )
}
