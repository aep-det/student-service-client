import { api } from './http'

export async function login({ email, password }) {
  return api.post('/api/v1/auth/login', { email, password })
}

export async function register({ firstName, lastName, email, password, dateOfBirth }) {
  return api.post('/api/v1/auth/register', {
    firstName,
    lastName,
    email,
    password,
    dateOfBirth,
  })
}

export async function logout() {
  return api.post('/api/v1/auth/logout')
}

export async function me() {
  return api.get('/api/v1/auth/me')
}

export async function checkRole(role) {
  return api.get(`/api/v1/auth/check-role/${encodeURIComponent(role)}`)
}

export async function changePassword({ currentPassword, newPassword }) {
  return api.post('/api/v1/auth/change-password', { currentPassword, newPassword })
}
