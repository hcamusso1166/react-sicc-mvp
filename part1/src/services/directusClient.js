import {
  clearStoredAuth,
  getAccessToken,
  getRefreshToken,
  setStoredAuth,
} from '../auth/authStorage'

const resolveDefaultApiBase = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/directus`
  }
  return 'https://tto.com.ar'
}

const API_BASE = (
  import.meta.env.VITE_DIRECTUS_URL || resolveDefaultApiBase()
).replace(/\/$/, '')
const DIRECTUS_PUBLIC_URL = (
  import.meta.env.VITE_DIRECTUS_PUBLIC_URL || API_BASE
).replace(/\/$/, '')

let refreshPromise = null

const buildUrl = (path) => {
  if (!path) return API_BASE
  if (path.startsWith('http')) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${normalized}`
}

const getErrorMessage = async (response) => {
  try {
    const payload = await response.json()
    return (
      payload?.errors?.[0]?.message ||
      payload?.message ||
      `Request failed: ${response.status}`
    )
  } catch (error) {
    return `Request failed: ${response.status}`
  }
}

const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearStoredAuth()
    throw new Error('No hay refresh token disponible.')
  }
  refreshPromise = (async () => {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
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
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

const request = async (path, options = {}) => {
  const {
    method = 'GET',
    headers = {},
    body,
    signal,
    skipAuth = false,
    isFormData = false,
    retry = false,
  } = options

  const finalHeaders = { ...headers }
  if (!skipAuth) {
    const token = getAccessToken()
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`
    }
  }
  if (body && !isFormData && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json'
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: finalHeaders,
    body: body && !isFormData ? JSON.stringify(body) : body,
    signal,
  })

  if (response.status === 401 && !retry && !skipAuth) {
    try {
      await refreshAccessToken()
    } catch (error) {
      clearStoredAuth()
      throw error
    }
    return request(path, { ...options, retry: true })
  }

  return response
}

const requestJSON = async (path, options = {}) => {
  const response = await request(path, options)
  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
  return response.json()
}

export {
  API_BASE,
  DIRECTUS_PUBLIC_URL,
  buildUrl,
  getErrorMessage,
  request,
  requestJSON,
}