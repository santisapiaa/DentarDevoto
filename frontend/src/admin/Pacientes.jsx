import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPacientes, createPaciente, deletePaciente } from '../lib/api.js'

const FORM_VACIO = { apellido: '', nombre: '', telefono: '', email: '' }

// Ojo: NO usar `new Date(fechaISO)` acá. ultima_visita es una fecha sin hora;
// el backend la manda como medianoche UTC, y un objeto Date la reinterpreta
// en el huso horario del navegador, corriendo el día para atrás en Argentina (UTC-3).
function formatFecha(fechaISO) {
  if (!fechaISO) return '—'
  const [anio, mes, dia] = fechaISO.slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

// Alta rápida (apellido/nombre/teléfono/email) para cuando llega el paciente.
// El resto de la ficha (domicilio, obra social, antecedentes, odontograma,
// cuenta corriente) se completa después en "Ver ficha".
export default function Pacientes() {
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  function cargar() {
    setLoading(true)
    getPacientes()
      .then(setPacientes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(cargar, [])

  const pacientesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return pacientes
    return pacientes.filter((p) =>
      `${p.apellido || ''} ${p.nombre}`.toLowerCase().includes(q) || (p.telefono || '').toLowerCase().includes(q)
    )
  }, [pacientes, busqueda])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre || !form.apellido) return
    setGuardando(true)
    try {
      await createPaciente(form)
      setForm(FORM_VACIO)
      cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este paciente del fichero? Se borra también su odontograma y cuenta corriente.')) return
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
      <p>Fichero de pacientes. Alta rápida acá abajo; la ficha completa (datos, antecedentes, odontograma, cuenta corriente) se carga desde "Ver ficha".</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: 480, marginBottom: 32 }}>
        <div className="form-field">
          <label htmlFor="apellido">Apellido</label>
          <input id="apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
        </div>
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

      <div className="form-field" style={{ maxWidth: 320 }}>
        <label htmlFor="busqueda">Buscar</label>
        <input
          id="busqueda"
          placeholder="Nombre, apellido o teléfono…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p style={{ color: '#B3413A' }}>{error}</p>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Apellido y nombre</th>
              <th>Teléfono</th>
              <th>Última visita</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.map((p) => (
              <tr key={p.id}>
                <td>{p.apellido ? `${p.apellido}, ${p.nombre}` : p.nombre}</td>
                <td>{p.telefono || '—'}</td>
                <td>{formatFecha(p.ultima_visita)}</td>
                <td style={{ display: 'flex', gap: 12 }}>
                  <Link to={`/admin/pacientes/${p.id}`}>Ver ficha</Link>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(p.id) }}>Eliminar</a>
                </td>
              </tr>
            ))}
            {pacientesFiltrados.length === 0 && (
              <tr><td colSpan={4}>{busqueda ? 'No hay pacientes que coincidan con la búsqueda.' : 'Todavía no hay pacientes cargados.'}</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
