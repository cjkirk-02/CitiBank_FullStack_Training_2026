import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import { fetchAccountsByUser } from '../services/serviceApi'

type AccountRecord = {
  id: string
  account_type: string
  balance: number
}

function AccountsPage() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<AccountRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAccounts = async () => {
      const token = localStorage.getItem('frontbank-token')
      const userId = localStorage.getItem('frontbank-user-id')

      if (!token || !userId) {
        setError('Please log in to view your accounts.')
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result = await fetchAccountsByUser(userId, token)
        setAccounts(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load your accounts.')
      } finally {
        setLoading(false)
      }
    }

    void loadAccounts()
  }, [])

  const handleCardClick = (account: AccountRecord) => {
    navigate(`/summary/${account.id}`, { state: { account } })
  }

  return (
    <div className="bank-app">
      <main className="dashboard">
        <section className="hero-card hero-card-with-action">
          <div className="hero-copy">
            <p className="eyebrow">Accounts</p>
            <h2>My Accounts</h2>
            <p className="hero-text">
              View and manage your bank accounts.
            </p>
          </div>
          <div className="hero-actions">
            <button type="button" className="primary-btn" onClick={() => navigate('/transfer')}>
              Make a Transfer
            </button>
          </div>
        </section>

        {loading && <p className="status-text">Loading your accounts...</p>}
        {error && <p className="status-error">{error}</p>}

        {!loading && !error && (
          <section className="account-grid">
            {accounts.length > 0 ? (
              accounts.map((account) => {
                const isChecking = account.account_type.toLowerCase() === 'checking'
                return (
                  <button
                    key={account.id}
                    type="button"
                    className={`account-card ${isChecking ? 'checking-card' : 'savings-card'}`}
                    onClick={() => handleCardClick(account)}
                  >
                    <span className="account-label">{isChecking ? 'Checking' : 'Savings'}</span>
                    <span className="account-balance">${Number(account.balance).toFixed(2)}</span>
                  </button>
                )
              })
            ) : (
              <p className="status-text">No accounts found for this user.</p>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default AccountsPage