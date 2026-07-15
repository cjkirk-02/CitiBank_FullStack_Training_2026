import { useState } from 'react'
import '../App.css'
import { fetchAccounts, fetchUsers } from '../services/serviceApi'

function ServicesPage() {
  const [data, setData] = useState<unknown[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')

  const loadData = async (type: 'users' | 'accounts') => {
    setLoading(true)
    setError(null)
    setTitle(type === 'users' ? 'Customers' : 'Accounts')

    try {
      const result = type === 'users' ? await fetchUsers() : await fetchAccounts()
      setData(Array.isArray(result) ? result : [result])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const renderTable = () => {
    if (!data.length) {
      return null
    }

    const firstItem = data[0] as Record<string, unknown>
    const columns = Object.keys(firstItem)

    return (
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const row = item as Record<string, unknown>
            return (
              <tr key={`${row.id ?? index}`}> 
                {columns.map((column) => (
                  <td key={`${column}-${index}`}>
                    {typeof row[column] === 'object' && row[column] !== null
                      ? JSON.stringify(row[column])
                      : String(row[column] ?? '')}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  return (
    <div className="bank-app">
      <main className="dashboard">
        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Banking services</p>
            <h2>Services Center</h2>
            <p className="hero-text">
              Choose a service to view customer and account information.
            </p>

            <div className="action-row">
              <button type="button" className="primary-btn" onClick={() => void loadData('users')}>
                Display All Customers
              </button>
              <button type="button" className="primary-btn" onClick={() => void loadData('accounts')}>
                Display All Accounts
              </button>
            </div>
          </div>
        </section>

        {loading && <p className="status-text">Loading...</p>}
        {error && <p className="status-error">{error}</p>}
        {title && !loading && !error && (
          <section className="panel">
            <h3>{title}</h3>
            {renderTable()}
          </section>
        )}
      </main>
    </div>
  )
}

export default ServicesPage
