import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { apiRequest } from '../utils/api'

const TOKEN_KEY = 'fitvision_auth_token'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const persistSession = useCallback((session) => {
    localStorage.setItem(TOKEN_KEY, session.token)
    setUser(session.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }

    apiRequest('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => setUser(response.data))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    persistSession(response.data)
    return response.data.user
  }, [persistSession])

  const register = useCallback(async (name, email, password) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    persistSession(response.data)
    return response.data.user
  }, [persistSession])

  const authorizedRequest = useCallback((path, options = {}) => {
    const token = localStorage.getItem(TOKEN_KEY)
    return apiRequest(path, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: Boolean(user), login, register, logout, authorizedRequest }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
