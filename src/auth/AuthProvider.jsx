import { useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth'
import { AuthContext } from './authContext'
import { clearAuth, loadAuth, saveAuth } from './authStorage'

function normalizeAuthFromAuthResponse(apiResponse) {
  const data = apiResponse?.data
  if (!data?.token) return null

  // Note: OpenAPI doesn't show a refresh token field; keep optional support.
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    user: {
      userId: data.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    },
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => loadAuth())
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    // If we have a token but no user, try to hydrate from /auth/me
    const init = async () => {
      try {
        if (auth?.token && !auth?.user) {
          const meRes = await authApi.me()
          const user = meRes?.data
          const next = { ...auth, user }
          saveAuth(next)
          setAuth(next)
        }
      } catch {
        // ignore; leave auth as-is
      } finally {
        setBootstrapped(true)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(() => {
    const signIn = async (email, password) => {
      const res = await authApi.login({ email, password })
      const next = normalizeAuthFromAuthResponse(res)
      if (!next) throw new Error('Login response did not include a token')
      saveAuth(next)
      setAuth(next)
      return next
    }

    const signUp = async (payload) => {
      const res = await authApi.register(payload)
      const next = normalizeAuthFromAuthResponse(res)
      if (!next) throw new Error('Registration response did not include a token')
      saveAuth(next)
      setAuth(next)
      return next
    }

    const signOut = async () => {
      try {
        await authApi.logout()
      } catch {
        // ignore
      }
      clearAuth()
      setAuth(null)
    }

    return {
      auth,
      bootstrapped,
      isAuthenticated: Boolean(auth?.token),
      user: auth?.user || null,
      token: auth?.token || null,
      signIn,
      signUp,
      signOut,
      setAuth: (next) => {
        if (!next) {
          clearAuth()
          setAuth(null)
          return
        }
        saveAuth(next)
        setAuth(next)
      },
    }
  }, [auth, bootstrapped])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
