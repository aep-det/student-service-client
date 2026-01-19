const STORAGE_KEY = 'studentService.auth'

export function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getAccessToken() {
  return loadAuth()?.token || null
}

export function getRefreshToken() {
  return loadAuth()?.refreshToken || null
}
