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
part1/src/auth/authService.js
part1/src/auth/authService.js
Nuevo
+57
-0

import {
  clearStoredAuth,
  getRefreshToken,
  setStoredAuth,
} from './authStorage'
import { API_BASE, getErrorMessage } from '../services/directusClient'

const login = async ({ email, password, signal }) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
  const payload = await response.json()
  const stored = setStoredAuth(payload)
  if (!stored) {
    throw new Error('Respuesta de autenticación inválida.')
  }
  return stored
}

const refresh = async ({ signal } = {}) => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No hay refresh token disponible.')
  }
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  if (!response.ok) {
    clearStoredAuth()
    throw new Error(await getErrorMessage(response))
  }
  const payload = await response.json()
  const stored = setStoredAuth(payload)
  if (!stored) {
    throw new Error('Respuesta de refresh inválida.')
  }
  return stored
}

const logout = () => {
  clearStoredAuth()
}

export { login, refresh, logout }