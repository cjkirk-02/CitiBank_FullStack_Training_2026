import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import { fetchAccountsByUser, transferBetweenAccounts } from '../services/serviceApi'

type AccountRecord = {
  id: string
  account_type: string
  balance: number
}

function TransferPage() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<AccountRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [amountInput, setAmountInput] = useState('')

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

        if (result.length > 0) {
          setFromAccountId(result[0].id)
          setToAccountId(result[1]?.id ?? result[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load your accounts.')
      } finally {
        setLoading(false)
      }
    }

    void loadAccounts()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!fromAccountId || !toAccountId) {
      setError('Please select both accounts to complete the transfer.')
      return
    }

    if (fromAccountId === toAccountId) {
      setError('Choose two different accounts for the transfer.')
      return
    }

    const amountPattern = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/
    if (!amountPattern.test(amountInput)) {
      setError('Enter a positive amount with up to two decimal places.')
      return
    }

    const amount = Number.parseFloat(amountInput)
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a positive amount with up to two decimal places.')
      return
    }

    const token = localStorage.getItem('frontbank-token')
    if (!token) {
      setError('Please log in again before making a transfer.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await transferBetweenAccounts(fromAccountId, toAccountId, amount, token)
      setSuccess('Transfer completed successfully.')
      setAmountInput('')
      setTimeout(() => {
        navigate('/accounts')
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete the transfer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bank-app">
      <main className="dashboard">
        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Transfer</p>
            <h2>Move money between accounts</h2>
            <p className="hero-text">
              Select your source and destination accounts, enter a valid amount, and transfer funds instantly.
            </p>
          </div>
        </section>

        {loading && <p className="status-text">Processing transfer...</p>}
        {error && <p className="status-error">{error}</p>}
        {success && <p className="status-text">{success}</p>}

        {!loading && !error && accounts.length >= 2 ? (
          <form className="transfer-card" onSubmit={handleSubmit}>
            <label className="transfer-field">
              <span>Transfer From -</span>
              <select value={fromAccountId} onChange={(event) => setFromAccountId(event.target.value)}>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_type} — ${Number(account.balance).toFixed(2)}
                  </option>
                ))}
              </select>
            </label>

            <label className="transfer-field">
              <span>Transfer To -</span>
              <select value={toAccountId} onChange={(event) => setToAccountId(event.target.value)}>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_type} — ${Number(account.balance).toFixed(2)}
                  </option>
                ))}
              </select>
            </label>

            <label className="transfer-field">
              <span>Amount -</span>
              <input
                type="text"
                inputMode="decimal"
                value={amountInput}
                placeholder="0.00"
                onChange={(event) => setAmountInput(event.target.value)}
              />
            </label>

            <p className="transfer-hint">Click "Transfer" to initiate internal transfer</p>

            <div className="transfer-actions">
              <button type="button" className="ghost-btn" onClick={() => navigate('/accounts')}>
                Cancel
              </button>
              <button type="submit" className="primary-btn">
                Transfer
              </button>
            </div>
          </form>
        ) : (
          !loading && !error && accounts.length < 2 ? (
            <p className="status-text">You need at least two accounts to make a transfer.</p>
          ) : null
        )}
      </main>
    </div>
  )
}

export default TransferPage
