import { useEffect, useState } from 'react'
import { getUsuarios, createUsuario, deleteUsuario } from '../lib/api.js'

const FORM_INICIAL = { email: '', password: '', rol: 'asistente' }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(FORM_INICIAL)
  const [guardando, setGuardando] = useState(false)

  function cargar() {
    setLoading(true)
    getUsuarios()
      .then(setUsuarios)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(cargar, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      await createUsuario(form)
      setForm(FORM_INICIAL)
      cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este usuario del staff?')) return
    try {
      await deleteUsuario(id)
      cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2>Usuarios del staff</h2>
      <p>Solo los admins pueden dar de alta o eliminar usuarios que acceden al panel.</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: 480, marginBottom: 32 }}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="form-field">
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div className="form-field">
          <label htmlFor="rol">Rol</label>
          <select id="rol" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
            <option value="asistente">Asistente</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {error && <p style={{ color: '#B3413A' }}>{error}</p>}
        <button className="btn btn--primary" type="submit" disabled={guardando}>
          {guardando ? 'Creando…' : 'Crear usuario'}
        </button>
      </form>

      {loading ? (
        <p>Cargando…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Rol</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.rol}</td>
                <td><a href="#" onClick={(e) => { e.preventDefault(); handleDelete(u.id) }}>Eliminar</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
