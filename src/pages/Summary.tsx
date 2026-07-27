import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import '../App.css'
import { fetchAccountTransactions } from '../services/serviceApi'

type AccountSummaryState = {
  account: {
    id: string
    account_type: string
    balance: number
  }
}

type TransactionRecord = {
  id?: string
  transaction_type?: string
  amount?: number
  timestamp?: string
}

function SummaryPage() {
  const { accountId } = useParams()
  const location = useLocation()
  const account = (location.state as AccountSummaryState | null)?.account
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadTransactions = async () => {
      if (!accountId) {
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result = await fetchAccountTransactions(accountId)
        setTransactions(Array.isArray(result) ? result : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load account history.')
      } finally {
        setLoading(false)
      }
    }

    void loadTransactions()
  }, [accountId])

  const accountTypeLabel = (account?.account_type ?? 'Account').toString().toLowerCase()
  const typeText = accountTypeLabel === 'checking' ? 'Checking' : 'Savings'

  return (
    <div className="bank-app">
      <main className="dashboard">
        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Account summary</p>
            <h2>Balance: ${Number(account?.balance ?? 0).toFixed(2)}</h2>
            <p className="hero-text">
                {typeText} Account
                </p>
            <div className="action-row">
              <Link to="/accounts" className="primary-btn">
                Back to Accounts
              </Link>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Transactions</p>
              <h3>History</h3>
            </div>
          </div>

          {loading && <p className="status-text">Loading transactions...</p>}
          {error && <p className="status-error">{error}</p>}

          {!loading && !error && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((transaction, index) => (
                    <tr key={`${transaction.id ?? index}`}>
                      <td>{transaction.transaction_type ?? 'N/A'}</td>
                      <td>${Number(transaction.amount ?? 0).toFixed(2)}</td>
                      <td>{transaction.timestamp ? new Date(transaction.timestamp).toLocaleString() : 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>No transactions available for this account.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  )
}

export default SummaryPage
