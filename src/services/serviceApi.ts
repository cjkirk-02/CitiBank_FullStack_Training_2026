export async function fetchUsers() {
  const response = await fetch('http://127.0.0.1:5000/users')

  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }

  return response.json()
}

export async function fetchAccounts() {
  const response = await fetch('http://127.0.0.1:5000/accounts')

  if (!response.ok) {
    throw new Error('Failed to fetch accounts')
  }

  return response.json()
}
