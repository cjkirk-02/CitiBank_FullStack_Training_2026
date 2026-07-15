import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header/Header'
import ServicesPage from './pages/ServicesPage'
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

function HomePage() {
  return (
    <div className="bank-app">
      <main className="dashboard">
        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Available balance</p>
            <h2>$24,580.90</h2>
            <p className="hero-text">
              Good morning, Olivia. You saved 18% more this month than last month.
            </p>

            <div className="action-row">
              <button type="button" className="primary-btn">
                View statements
              </button>
              <button type="button" className="primary-btn ghost">
                Manage cards
              </button>
            </div>
          </div>

          <div className="card-preview">
            <div className="chip" />
            <p className="card-number">•••• 4821</p>
            <div className="card-meta">
              <span>Olivia Chen</span>
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
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
