import { useEffect, useState } from 'react'
import { getPacientes, createPaciente, deletePaciente } from '../lib/api.js'

// Estructura de campos pendiente de definir con un fichero real
// (historia clínica, tratamientos, etc.) — hoy son los datos básicos.
export default function Pacientes() {
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '' })
  const [guardando, setGuardando] = useState(false)

  function cargar() {
    setLoading(true)
    getPacientes()
      .then(setPacientes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(cargar, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre) return
    setGuardando(true)
    try {
      await createPaciente(form)
      setForm({ nombre: '', telefono: '', email: '' })
      cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este paciente del fichero?')) return
    try {
      await deletePaciente(id)
      cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2>Pacientes</h2>
      <p>Fichero de pacientes. Estructura de campos pendiente de definir.</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: 480, marginBottom: 32 }}>
        <div className="form-field">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        </div>
        <div className="form-field">
          <label htmlFor="telefono">Teléfono</label>
          <input id="telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <button className="btn btn--primary" type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Agregar paciente'}
        </button>
      </form>

      {error && <p style={{ color: '#B3413A' }}>{error}</p>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Última visita</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.telefono || '—'}</td>
                <td>{p.ultima_visita ? new Date(p.ultima_visita).toLocaleDateString('es-AR') : '—'}</td>
                <td><a href="#" onClick={(e) => { e.preventDefault(); handleDelete(p.id) }}>Eliminar</a></td>
              </tr>
            ))}
            {pacientes.length === 0 && (
              <tr><td colSpan={4}>Todavía no hay pacientes cargados.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
