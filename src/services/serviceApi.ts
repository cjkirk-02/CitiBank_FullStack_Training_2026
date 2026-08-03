const API_BASE_URL = 'http://127.0.0.1:5000'

export async function fetchUsers() {
  const response = await fetch(`${API_BASE_URL}/users`)

  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }

  return response.json()
}

export async function updateUser(
  userId: string,
  payload: Partial<{ name: string; email: string; username: string; password: string; role: string }>,
  token: string,
) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Failed to update user' }))
    throw new Error(errorPayload.error || 'Failed to update user')
  }

  return response.json() as Promise<{ id: string; name: string; username: string; email: string; role: string; time_created: string }>
}

export async function deleteUser(userId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Failed to delete user' }))
    throw new Error(errorPayload.error || 'Failed to delete user')
  }

  return response.json() as Promise<{ message: string }>
}

export async function fetchAccounts() {
  const response = await fetch(`${API_BASE_URL}/accounts`)

  if (!response.ok) {
    throw new Error('Failed to fetch accounts')
  }

  return response.json()
}

export async function createAccount(userId: string, accountType: 'savings' | 'checking') {
  const response = await fetch(`${API_BASE_URL}/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      account_type: accountType,
    }),
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Failed to create account' }))
    throw new Error(errorPayload.error || 'Failed to create account')
  }

  return response.json() as Promise<{
    id: string
    user_id: string
    account_type: string
    balance: number
    created_at: string
  }>
}

export async function deleteAccount(accountId: string) {
  const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Failed to delete account' }))
    throw new Error(errorPayload.error || 'Failed to delete account')
  }

  return response.json() as Promise<{ message: string }>
}

export async function fetchAccountsByUser(userId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/accounts/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Failed to fetch user accounts' }))
    throw new Error(errorPayload.error || 'Failed to fetch user accounts')
  }

  return response.json() as Promise<Array<{ id: string; account_type: string; balance: number }>>
}

export async function fetchAccountTransactions(accountId: string) {
  const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/transactions`)

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Failed to fetch account history' }))
    throw new Error(errorPayload.error || 'Failed to fetch account history')
  }

  return response.json() as Promise<Array<{ id: string; transaction_type: string; amount: number; timestamp: string }>>
}

export async function transferBetweenAccounts(fromAccountId: string, toAccountId: string, amount: number, token: string) {
  const withdrawResponse = await fetch(`${API_BASE_URL}/accounts/${fromAccountId}/withdraw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  })

  if (!withdrawResponse.ok) {
    const errorPayload = await withdrawResponse.json().catch(() => ({ error: 'Transfer failed during withdrawal' }))
    throw new Error(errorPayload.error || 'Transfer failed during withdrawal')
  }

  const depositResponse = await fetch(`${API_BASE_URL}/accounts/${toAccountId}/deposit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  })

  if (!depositResponse.ok) {
    const errorPayload = await depositResponse.json().catch(() => ({ error: 'Transfer failed during deposit' }))
    throw new Error(errorPayload.error || 'Transfer failed during deposit')
  }

  return {
    withdraw: await withdrawResponse.json(),
    deposit: await depositResponse.json(),
  }
}

export async function signUpUser(payload: {
  name: string
  email: string
  username: string
  password: string
}) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      role: 'customer',
    }),
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Signup failed' }))
    throw new Error(errorPayload.error || 'Signup failed')
  }

  return response.json()
}

export async function loginUser(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Login failed' }))
    throw new Error(errorPayload.error || 'Login failed')
  }

  return response.json() as Promise<{ access_token: string }>
}

export function getRoleFromToken(token: string) {
  if (!token) {
    return null
  }

  const payload = token.split('.')[1]
  if (!payload) {
    return null
  }

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decodedPayload = atob(normalizedPayload)
    const parsedPayload = JSON.parse(decodedPayload) as { role?: string }
    return parsedPayload.role ?? null
  } catch {
    return null
  }
}

export function getUsernameFromToken(token: string) {
  if (!token) {
    return null
  }
  console.log('Extracting username from token:', token)

  const payload = token.split('.')[1]
  if (!payload) {
    return null
  }

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decodedPayload = atob(normalizedPayload)
    const parsedPayload = JSON.parse(decodedPayload) as { sub?: string }
    return parsedPayload.sub ?? null
  } catch {
    return null
  }
}

export async function verifyAccessToken(token: string, role: string | null) {
  const route = role === 'admin' ? '/admin' : '/dashboard'
  const response = await fetch(`${API_BASE_URL}${route}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Token verification failed' }))
    throw new Error(errorPayload.error || 'Token verification failed')
  }

  return response.json()
}
