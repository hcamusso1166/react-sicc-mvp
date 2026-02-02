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