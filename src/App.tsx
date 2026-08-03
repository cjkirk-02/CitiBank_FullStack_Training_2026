import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header/Header'
import ServicesPage from './pages/ServicesPage'
import LoginPage from './pages/Login'
import SignupPage from './pages/Signup'
import AboutPage from './pages/About'
import AccountsPage from './pages/Accounts'
import SummaryPage from './pages/Summary'
import TransferPage from './pages/Transfer'
import AccountCreatePage from './pages/Account_Create'
import { fetchUsers, getRoleFromToken, getUsernameFromToken } from './services/serviceApi'
import './App.css'

const transactions = [
  { id: 1, name: 'Salary Deposit', type: 'Income', amount: '+$4,200.00', time: 'Today · 09:15' },
  { id: 2, name: 'Groceries', type: 'Expense', amount: '-$84.20', time: 'Yesterday · 18:40' },
  { id: 3, name: 'Transfer to Savings', type: 'Transfer', amount: '-$500.00', time: 'Yesterday · 08:10' },
]

const goals = [
  { id: 1, title: 'Emergency Fund', value: '$10,200', target: '$15,000', progress: '68%' },
  { id: 2, title: 'Vacation', value: '$4,800', target: '$8,000', progress: '60%' },
]

type HomePageProps = {
  role: string | null
}

function HomePage({ role }: HomePageProps) {
  const isAdmin = role === 'admin'

  return (
    <div className="bank-app">
      <main className="dashboard">
        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">{isAdmin ? 'Admin dashboard' : 'Available balance'}</p>
            <h2>{isAdmin ? 'Admin Control Center' : '$24,580.90'}</h2>
            <p className="hero-text">
              {isAdmin
                ? 'You have elevated privileges for secure account oversight and banking operations.'
                : 'Good morning, Olivia. You saved 18% more this month than last month.'}
            </p>

            <div className="action-row">
              <button type="button" className="primary-btn">
                {isAdmin ? 'Manage users' : 'View statements'}
              </button>
              <button type="button" className="primary-btn ghost">
                {isAdmin ? 'Audit logs' : 'Manage cards'}
              </button>
            </div>
          </div>

          <div className="card-preview">
            <div className="chip" />
            <p className="card-number">•••• 4821</p>
            <div className="card-meta">
              <span>{isAdmin ? 'Admin Access' : 'Olivia Chen'}</span>
              <span>08/28</span>
            </div>
          </div>
        </section>

        <section className="summary-grid" aria-label="Account overview">
          <article className="summary-card">
            <p className="eyebrow">Monthly income</p>
            <h3>$8,450</h3>
          </article>
          <article className="summary-card">
            <p className="eyebrow">Spending</p>
            <h3>$2,140</h3>
          </article>
          <article className="summary-card">
            <p className="eyebrow">Savings goal</p>
            <h3>72%</h3>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Recent activity</p>
                <h3>Transactions</h3>
              </div>
              <a href="#">See all</a>
            </div>

            <ul className="transaction-list">
              {transactions.map((transaction) => (
                <li key={transaction.id} className="transaction-item">
                  <div>
                    <p className="transaction-name">{transaction.name}</p>
                    <p className="transaction-meta">{transaction.time}</p>
                  </div>
                  <div className="transaction-right">
                    <p className={`transaction-amount ${transaction.type.toLowerCase()}`}>
                      {transaction.amount}
                    </p>
                    <span className="transaction-type">{transaction.type}</span>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Your progress</p>
                <h3>Savings goals</h3>
              </div>
              <a href="#">Add goal</a>
            </div>

            <div className="goals-list">
              {goals.map((goal) => (
                <div key={goal.id} className="goal-card">
                  <div className="goal-row">
                    <h4>{goal.title}</h4>
                    <span>{goal.progress}</span>
                  </div>
                  <p className="goal-values">
                    {goal.value} of {goal.target}
                  </p>
                  <div className="progress-bar" aria-hidden="true">
                    <div className="progress-fill" style={{ width: goal.progress }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

function App() {
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('frontbank-token'))
  const [role, setRole] = useState<string | null>(() => {
    const savedToken = localStorage.getItem('frontbank-token')
    return savedToken ? getRoleFromToken(savedToken) : null
  })

  useEffect(() => {
    if (!authToken) {
      setRole(null)
      localStorage.removeItem('frontbank-role')
      return
    }

    const currentRole = getRoleFromToken(authToken)
    setRole(currentRole)
    if (currentRole) {
      localStorage.setItem('frontbank-role', currentRole)
    }
  }, [authToken])

  useEffect(() => {
    if (!authToken) {
      return
    }

    const savedUserId = localStorage.getItem('frontbank-user-id')
    if (savedUserId) {
      return
    }

    const username = getUsernameFromToken(authToken)
    if (!username) {
      return
    }

    void fetchUsers().then((users) => {
      const currentUser = users.find((user: { username?: string; id?: string }) => user.username === username)
      if (currentUser?.id) {
        localStorage.setItem('frontbank-user-id', currentUser.id)
      }
    }).catch(() => {
      localStorage.removeItem('frontbank-user-id')
      console.error('Failed to fetch users or find the current user.')
    })
  }, [authToken])

  const handleLogin = async (token: string) => {
    localStorage.setItem('frontbank-token', token)
    setAuthToken(token)

    const username = getUsernameFromToken(token)
    if (!username) {
      return
    }

    try {
      const users = await fetchUsers()
      const currentUser = users.find((user: { username?: string; id?: string }) => user.username === username)
      if (currentUser?.id) {
        localStorage.setItem('frontbank-user-id', currentUser.id)
      }
    } catch {
      localStorage.removeItem('frontbank-user-id')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('frontbank-token')
    localStorage.removeItem('frontbank-role')
    localStorage.removeItem('frontbank-user-id')
    setAuthToken(null)
    setRole(null)
  }

  return (
    <BrowserRouter>
      <Header isLoggedIn={Boolean(authToken)} isAdmin={role === 'admin'} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomePage role={role} />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/account-create" element={<AccountCreatePage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/transfer" element={<TransferPage />} />
        <Route path="/summary/:accountId" element={<SummaryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/login"
          element={
            authToken ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage isAuthenticated={Boolean(authToken)} onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            authToken ? (
              <Navigate to="/" replace />
            ) : (
              <SignupPage isAuthenticated={Boolean(authToken)} onLogin={handleLogin} />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
