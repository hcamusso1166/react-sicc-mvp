const STORAGE_KEY = 'directus_auth'

const readStorage = () => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (error) {
    return null
  }
}

const writeStorage = (value) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

const clearStorage = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

const normalizeAuthPayload = (payload) => {
  const data = payload?.data ?? payload
  if (!data) return null
  const accessToken = data.access_token
  const refreshToken = data.refresh_token
  const expiresIn = Number(data.expires ?? 0)
  if (!accessToken || !refreshToken) return null
  const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : null
  return {
    accessToken,
    refreshToken,
    expiresAt,
  }
}

const getStoredAuth = () => readStorage()

const setStoredAuth = (payload) => {
  const normalized = normalizeAuthPayload(payload)
  if (!normalized) return null
  writeStorage(normalized)
  return normalized
}

const clearStoredAuth = () => {
  clearStorage()
}

const getAccessToken = () => readStorage()?.accessToken || ''

const getRefreshToken = () => readStorage()?.refreshToken || ''

const isTokenExpired = () => {
  const expiresAt = readStorage()?.expiresAt
  if (!expiresAt) return false
  return Date.now() >= expiresAt
}

const hasStoredAuth = () => {
  const auth = readStorage()
  return Boolean(auth?.accessToken && auth?.refreshToken)
}

export {
  getStoredAuth,
  setStoredAuth,
  clearStoredAuth,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  hasStoredAuth,
}