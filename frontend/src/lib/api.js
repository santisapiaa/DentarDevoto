const TOKEN_KEY = 'token'

// Vacío en local (usa el proxy de Vite hacia localhost:4000).
// En Vercel, VITE_API_URL apunta al backend deployado (ej. Render).
const API_BASE = import.meta.env.VITE_API_URL || ''

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isLoggedIn() {
  return Boolean(getToken())
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && auth) {
    clearToken()
    window.location.href = '/login'
    throw new Error('Sesión expirada')
  }

  if (res.status === 204) return null

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Error inesperado')
  return data
}

// Auth
export const login = (email, password) => request('/auth/login', { method: 'POST', body: { email, password } })
export const getMe = () => request('/auth/me', { auth: true })

// Servicios
export const getServicios = () => request('/servicios')
export const getServiciosAdmin = () => request('/servicios/todos', { auth: true })
export const createServicio = (data) => request('/servicios', { method: 'POST', body: data, auth: true })
export const updateServicio = (id, data) => request(`/servicios/${id}`, { method: 'PUT', body: data, auth: true })
export const deleteServicio = (id) => request(`/servicios/${id}`, { method: 'DELETE', auth: true })

// Profesionales
export const getProfesionales = () => request('/profesionales')

// Pacientes
export const getPacientes = () => request('/pacientes', { auth: true })
export const createPaciente = (data) => request('/pacientes', { method: 'POST', body: data, auth: true })
export const updatePaciente = (id, data) => request(`/pacientes/${id}`, { method: 'PUT', body: data, auth: true })
export const deletePaciente = (id) => request(`/pacientes/${id}`, { method: 'DELETE', auth: true })

// Turnos
export const getTurnos = () => request('/turnos', { auth: true })
export const createTurno = (data) => request('/turnos', { method: 'POST', body: data, auth: true })
export const updateTurno = (id, data) => request(`/turnos/${id}`, { method: 'PUT', body: data, auth: true })
export const deleteTurno = (id) => request(`/turnos/${id}`, { method: 'DELETE', auth: true })

// Usuarios (staff)
export const getUsuarios = () => request('/usuarios', { auth: true })
export const createUsuario = (data) => request('/usuarios', { method: 'POST', body: data, auth: true })
export const deleteUsuario = (id) => request(`/usuarios/${id}`, { method: 'DELETE', auth: true })
