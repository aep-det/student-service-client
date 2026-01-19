import { getApiBaseUrl } from './config'
import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  loadAuth,
  saveAuth,
} from '../auth/authStorage'

async function parseJsonSafe(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function buildUrl(path) {
  const base = getApiBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

async function refreshTokenOnce() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  const response = await fetch(buildUrl('/api/v1/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) return null

  const json = await parseJsonSafe(response)
  const nextToken = json?.data?.token
  if (!nextToken) return null

  const prev = loadAuth() || {}
  const next = {
    ...prev,
    token: nextToken,
    user: {
      userId: json?.data?.userId,
      email: json?.data?.email,
      firstName: json?.data?.firstName,
      lastName: json?.data?.lastName,
      role: json?.data?.role,
    },
  }
  saveAuth(next)
  return nextToken
}

export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export async function apiRequest(path, { method = 'GET', headers, body } = {}) {
  const url = buildUrl(path)
  const token = getAccessToken()

  const response = await fetch(url, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    const nextToken = await refreshTokenOnce()
    if (nextToken) {
      const retry = await fetch(url, {
        method,
        headers: {
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          Authorization: `Bearer ${nextToken}`,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (retry.ok) return parseJsonSafe(retry)

      const retryBody = await parseJsonSafe(retry)
      throw new ApiError('Request failed', {
        status: retry.status,
        body: retryBody,
      })
    }

    clearAuth()
  }

  if (!response.ok) {
    const errBody = await parseJsonSafe(response)
    const message =
      errBody?.message || errBody?.error || response.statusText || 'Request failed'
    throw new ApiError(message, { status: response.status, body: errBody })
  }

  return parseJsonSafe(response)
}

export const api = {
  get: (path) => apiRequest(path, { method: 'GET' }),
  post: (path, body) => apiRequest(path, { method: 'POST', body }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body }),
  del: (path) => apiRequest(path, { method: 'DELETE' }),
}
