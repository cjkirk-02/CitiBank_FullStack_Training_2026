import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRoleFromToken, loginUser, verifyAccessToken } from '../services/serviceApi'

type LoginPageProps = {
  isAuthenticated: boolean
  onLogin: (token: string) => Promise<void> | void
}

function LoginPage({ isAuthenticated, onLogin }: LoginPageProps) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
      const { access_token } = await loginUser(username, password)
      const role = getRoleFromToken(access_token)

      await verifyAccessToken(access_token, role)
      await onLogin(access_token)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bank-app">
      <main className="dashboard">
        <section className="hero-card login-card">
          <div className="hero-copy">
            <p className="eyebrow">Secure access</p>
            <h2>Login to your account</h2>
            <p className="hero-text">
              Enter your username and password to verify your identity and unlock your bank dashboard.
            </p>
          </div>

          <form className="login-form" onSubmit={(event) => void handleSubmit(event)}>
            <label>
              <span>Username</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                required
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>

            {error && <p className="status-error">{error}</p>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default LoginPage
