import { useEffect, useState } from 'react'
import { getTurnos, createTurno, deleteTurno, getPacientes, getProfesionales } from '../lib/api.js'

// Como los turnos se coordinan por WhatsApp con el asistente, este panel
// sirve para que el asistente cargue manualmente el turno ya acordado
// (no hay reserva automática desde la web pública).
const FORM_INICIAL = { paciente_id: '', paciente_nombre: '', profesional_id: '', tratamiento: '', fecha_hora: '', notas: '' }

export default function Turnos() {
  const [turnos, setTurnos] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [profesionales, setProfesionales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(FORM_INICIAL)
  const [guardando, setGuardando] = useState(false)

  function cargar() {
    setLoading(true)
    Promise.all([getTurnos(), getPacientes(), getProfesionales()])
      .then(([t, p, pr]) => {
        setTurnos(t)
        setPacientes(p)
        setProfesionales(pr)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(cargar, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.fecha_hora || (!form.paciente_id && !form.paciente_nombre)) return
    setGuardando(true)
    try {
      await createTurno({
        paciente_id: form.paciente_id || null,
        paciente_nombre: form.paciente_id ? null : form.paciente_nombre,
        profesional_id: form.profesional_id || null,
        tratamiento: form.tratamiento,
        fecha_hora: form.fecha_hora,
        notas: form.notas,
      })
      setForm(FORM_INICIAL)
      cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este turno?')) return
    try {
      await deleteTurno(id)
      cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2>Turnos</h2>
      <p>Turnos coordinados por WhatsApp y cargados manualmente por el asistente.</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: 480, marginBottom: 32 }}>
        <div className="form-field">
          <label htmlFor="paciente">Paciente (del fichero)</label>
          <select id="paciente" value={form.paciente_id} onChange={(e) => setForm({ ...form, paciente_id: e.target.value })}>
            <option value="">— Elegir del fichero —</option>
            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        {!form.paciente_id && (
          <div className="form-field">
            <label htmlFor="pacienteNombre">O nombre (si todavía no está en el fichero)</label>
            <input id="pacienteNombre" value={form.paciente_nombre} onChange={(e) => setForm({ ...form, paciente_nombre: e.target.value })} />
          </div>
        )}
        <div className="form-field">
          <label htmlFor="profesional">Profesional</label>
          <select id="profesional" value={form.profesional_id} onChange={(e) => setForm({ ...form, profesional_id: e.target.value })}>
            <option value="">— Elegir —</option>
            {profesionales.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="tratamiento">Tratamiento</label>
          <input id="tratamiento" value={form.tratamiento} onChange={(e) => setForm({ ...form, tratamiento: e.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="fechaHora">Fecha y hora</label>
          <input id="fechaHora" type="datetime-local" value={form.fecha_hora} onChange={(e) => setForm({ ...form, fecha_hora: e.target.value })} required />
        </div>
        <div className="form-field">
          <label htmlFor="notas">Notas</label>
          <textarea id="notas" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
        </div>
        <button className="btn btn--primary" type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Cargar turno'}
        </button>
      </form>

      {error && <p style={{ color: '#B3413A' }}>{error}</p>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Profesional</th>
              <th>Tratamiento</th>
              <th>Fecha y hora</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((t) => (
              <tr key={t.id}>
                <td>{t.paciente_nombre || '—'}</td>
                <td>{t.profesional_nombre || '—'}</td>
                <td>{t.tratamiento || '—'}</td>
                <td>{new Date(t.fecha_hora).toLocaleString('es-AR')}</td>
                <td><a href="#" onClick={(e) => { e.preventDefault(); handleDelete(t.id) }}>Eliminar</a></td>
              </tr>
            ))}
            {turnos.length === 0 && (
              <tr><td colSpan={5}>Todavía no hay turnos cargados.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
