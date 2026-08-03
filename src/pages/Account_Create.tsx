import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import { createAccount } from '../services/serviceApi'

function AccountCreatePage() {
  const navigate = useNavigate()
  const [userId, setUserId] = useState('')
  const [accountType, setAccountType] = useState<'savings' | 'checking'>('savings')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateAccount = async () => {
    if (!userId.trim()) {
      setError('User ID is required.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await createAccount(userId.trim(), accountType)
      navigate('/services')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bank-app">
      <main className="dashboard">
        <section className="panel transfer-card">
          <p className="eyebrow">Accounts</p>
          <h3>Create New Account</h3>

          <label className="transfer-field" htmlFor="user-id-input">
            User ID
            <input
              id="user-id-input"
              type="text"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Enter user ID"
            />
          </label>

          <label className="transfer-field" htmlFor="account-type-select">
            Account Type
            <select
              id="account-type-select"
              value={accountType}
              onChange={(event) => setAccountType(event.target.value as 'savings' | 'checking')}
            >
              <option value="savings">Savings</option>
              <option value="checking">Checking</option>
            </select>
          </label>

          {error && <p className="status-error">{error}</p>}

          <div className="transfer-actions">
            <button type="button" className="ghost-btn dark" onClick={() => navigate('/services')} disabled={loading}>
              Cancel
            </button>
            <button type="button" className="primary-btn" onClick={() => void handleCreateAccount()} disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AccountCreatePage
