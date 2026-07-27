import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRoleFromToken, loginUser, signUpUser, verifyAccessToken } from '../services/serviceApi'

type SignupPageProps = {
  isAuthenticated: boolean
  onLogin: (token: string) => Promise<void> | void
}

function SignupPage({ isAuthenticated, onLogin }: SignupPageProps) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signUpUser(form)
      const { access_token } = await loginUser(form.username, form.password)
      const role = getRoleFromToken(access_token)

      await verifyAccessToken(access_token, role)
      await onLogin(access_token)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bank-app">
      <main className="dashboard">
        <section className="hero-card login-card">
          <div className="hero-copy">
            <p className="eyebrow">Open an account</p>
            <h2>Create your profile</h2>
            <p className="hero-text">
              Fill in your details to create a bank account and be signed in automatically.
            </p>
          </div>

          <form className="login-form" onSubmit={(event) => void handleSubmit(event)}>
            <label>
              <span>Full name</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </label>

            <label>
              <span>Email address</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="Enter your email"
                required
              />
            </label>

            <label>
              <span>Username</span>
              <input
                type="text"
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="Choose a username"
                required
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Choose a password"
                required
              />
            </label>

            {error && <p className="status-error">{error}</p>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default SignupPage
