import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import { deleteAccount, deleteUser, fetchAccounts, fetchUsers, getRoleFromToken, updateUser } from '../services/serviceApi'

type ViewType = 'users' | 'accounts' | null

type UserRecord = {
  id: string
  name: string
  username: string
  email: string
  time_created: string
  role?: string
}

type AccountRecord = {
  id: string
  user_id: string
  account_type: string
  balance: number
  created_at: string
}

function ServicesPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<unknown[]>([])
  const [viewType, setViewType] = useState<ViewType>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [actionLoadingUserId, setActionLoadingUserId] = useState<string | null>(null)

  const token = localStorage.getItem('frontbank-token')
  const role = token ? getRoleFromToken(token) : null
  const isAdmin = role === 'admin'

  const loadData = async (type: 'users' | 'accounts') => {
    setLoading(true)
    setError(null)
    setTitle(type === 'users' ? 'Customers' : 'Accounts')
    setViewType(type)

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

  const formatCreatedAt = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return value
    }

    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = String(date.getFullYear())
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${month}/${day}/${year} - ${hours}:${minutes}`
  }

  const handleDeleteUser = async (userId: string) => {
    if (!token || !isAdmin) {
      setError('Admin access token is required to delete users.')
      return
    }

    const shouldDelete = window.confirm('Delete this user? This action cannot be undone.')
    if (!shouldDelete) {
      return
    }

    setActionLoadingUserId(userId)
    setError(null)

    try {
      await deleteUser(userId, token)
      setData((previous) => previous.filter((item) => {
        const user = item as UserRecord
        return user.id !== userId
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setActionLoadingUserId(null)
    }
  }

  const handleUpdateUser = async (user: UserRecord) => {
    if (!token || !isAdmin) {
      setError('Admin access token is required to update users.')
      return
    }

    const nextName = window.prompt('Update name:', user.name)
    if (nextName === null) {
      return
    }

    const nextUsername = window.prompt('Update username:', user.username)
    if (nextUsername === null) {
      return
    }

    const nextEmail = window.prompt('Update email:', user.email)
    if (nextEmail === null) {
      return
    }

    const payload: Partial<UserRecord> = {}
    if (nextName.trim() !== user.name) {
      payload.name = nextName.trim()
    }
    if (nextUsername.trim() !== user.username) {
      payload.username = nextUsername.trim()
    }
    if (nextEmail.trim() !== user.email) {
      payload.email = nextEmail.trim()
    }

    if (!Object.keys(payload).length) {
      return
    }

    setActionLoadingUserId(user.id)
    setError(null)

    try {
      const updatedUser = await updateUser(user.id, payload, token)
      setData((previous) => previous.map((item) => {
        const existing = item as UserRecord
        return existing.id === user.id ? updatedUser : existing
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setActionLoadingUserId(null)
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!isAdmin) {
      setError('Admin access is required to delete accounts.')
      return
    }

    const shouldDelete = window.confirm('Delete this account? This action cannot be undone.')
    if (!shouldDelete) {
      return
    }

    setActionLoadingUserId(accountId)
    setError(null)

    try {
      await deleteAccount(accountId)
      setData((previous) => previous.filter((item) => {
        const account = item as AccountRecord
        return account.id !== accountId
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setActionLoadingUserId(null)
    }
  }

  const renderUsers = () => {
    const users = data as UserRecord[]
    if (!users.length) {
      return <p className="status-text">No users found.</p>
    }

    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Time Created</th>
            <th>Update</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{formatCreatedAt(user.time_created)}</td>
              <td>
                <button
                  type="button"
                  className="primary-btn"
                  disabled={!isAdmin || actionLoadingUserId === user.id}
                  onClick={() => void handleUpdateUser(user)}
                >
                  Update
                </button>
              </td>
              <td>
                <button
                  type="button"
                  className="danger-btn"
                  disabled={!isAdmin || actionLoadingUserId === user.id}
                  onClick={() => void handleDeleteUser(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  const renderAccounts = () => {
    const accounts = data as AccountRecord[]
    if (!accounts.length) {
      return <p className="status-text">No accounts found.</p>
    }

    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Balance</th>
            <th>Time Created</th>
            <th>Account ID</th>
            <th>UserID</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.id}>
              <td>{account.account_type}</td>
              <td>{account.balance}</td>
              <td>{formatCreatedAt(account.created_at)}</td>
              <td>{account.id}</td>
              <td>{account.user_id}</td>
              <td>
                <button
                  type="button"
                  className="danger-btn"
                  disabled={!isAdmin || actionLoadingUserId === account.id}
                  onClick={() => void handleDeleteAccount(account.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  const renderTable = () => {
    if (viewType === 'users') {
      return renderUsers()
    }

    if (viewType === 'accounts') {
      return renderAccounts()
    }

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
        {title === 'Customers' && !loading && !error && !isAdmin && (
          <p className="status-text">Sign in as admin to enable user updates and deletions.</p>
        )}
        {title && !loading && !error && (
          <section className="panel">
            <div className="panel-header">
              <h3>{title}</h3>
              {viewType === 'accounts' && (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => navigate('/account-create')}
                  aria-label="Create account"
                >
                  +
                </button>
              )}
            </div>
            {renderTable()}
          </section>
        )}
      </main>
    </div>
  )
}

export default ServicesPage
