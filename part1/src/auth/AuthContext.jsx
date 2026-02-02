import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import {
  clearStoredAuth,
  getStoredAuth,
  hasStoredAuth,
  isTokenExpired,
} from './authStorage'
import { login as loginService, refresh as refreshService } from './authService'

const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  const initializeSession = useCallback(async () => {
    if (!hasStoredAuth()) {
      setIsAuthenticated(false)
      setIsInitializing(false)
      return
    }
    if (isTokenExpired()) {
      try {
        await refreshService()
        setIsAuthenticated(true)
      } catch (error) {
        clearStoredAuth()
        setIsAuthenticated(false)
      } finally {
        setIsInitializing(false)
      }
      return
    }
    const stored = getStoredAuth()
    setIsAuthenticated(Boolean(stored?.accessToken))
    setIsInitializing(false)
  }, [])

  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  const login = useCallback(async ({ email, password, signal }) => {
    const result = await loginService({ email, password, signal })
    setIsAuthenticated(true)
    return result
  }, [])

  const logout = useCallback(() => {
    clearStoredAuth()
    setIsAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated,
      isInitializing,
      login,
      logout,
    }),
    [isAuthenticated, isInitializing, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export { AuthProvider, useAuth }
