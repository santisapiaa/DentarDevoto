import { useEffect, useState } from 'react'
import {
  getTurnos, createTurno, updateTurno, updateTurnoEstado, deleteTurno,
  getPacientes, getProfesionales,
} from '../lib/api.js'

// Como los turnos se coordinan por WhatsApp con el asistente, este panel
// sirve para que el asistente cargue manualmente el turno ya acordado
// (no hay reserva automática desde la web pública).
const FORM_VACIO = { paciente_id: '', paciente_nombre: '', profesional_id: '', tratamiento: '', fecha_hora: '', notas: '' }

const ESTADO_LABEL = { confirmado: 'Confirmado', cancelado: 'Cancelado', atendido: 'Atendido' }

// fecha_hora es hora de pared sin huso horario ("2026-09-14T10:30:00").
// El input datetime-local usa el mismo formato recortado a los minutos —
// nada de pasar esto por un objeto Date (eso reintroduce el corrimiento de huso horario).
function toInputDatetime(fechaHoraTexto) {
  return fechaHoraTexto.slice(0, 16)
}

function formatFechaHora(fechaHoraTexto) {
  const [fecha, hora] = fechaHoraTexto.split('T')
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}, ${hora.slice(0, 8)}`
}

export default function Turnos() {
  const [turnos, setTurnos] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [profesionales, setProfesionales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(FORM_VACIO)
  const [editandoId, setEditandoId] = useState(null)
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

  function empezarEdicion(t) {
    setEditandoId(t.id)
    setForm({
      paciente_id: t.paciente_id || '',
      paciente_nombre: t.paciente_id ? '' : (t.paciente_nombre || ''),
      profesional_id: t.profesional_id || '',
      tratamiento: t.tratamiento || '',
      fecha_hora: toInputDatetime(t.fecha_hora),
      notas: t.notas || '',
    })
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setForm(FORM_VACIO)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.fecha_hora || (!form.paciente_id && !form.paciente_nombre)) return
    setGuardando(true)
    const payload = {
      paciente_id: form.paciente_id || null,
      paciente_nombre: form.paciente_id ? null : form.paciente_nombre,
      profesional_id: form.profesional_id || null,
      tratamiento: form.tratamiento,
      fecha_hora: form.fecha_hora,
      notas: form.notas,
    }
    try {
      if (editandoId) {
        await updateTurno(editandoId, payload)
      } else {
        await createTurno(payload)
      }
      cancelarEdicion()
      cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarEstado(id, estado) {
    try {
      await updateTurnoEstado(id, estado)
      cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este turno? Esta acción no se puede deshacer (para no perder el historial, mejor usá "Cancelar").')) return
    try {
      await deleteTurno(id)
      if (editandoId === id) cancelarEdicion()
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
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn--primary" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Cargar turno'}
          </button>
          {editandoId && (
            <button className="btn btn--ghost" type="button" onClick={cancelarEdicion}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {error && <p style={{ color: '#B3413A' }}>{error}</p>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Profesional</th>
              <th>Tratamiento</th>
              <th>Fecha y hora</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((t) => (
              <tr key={t.id}>
                <td>{t.paciente_nombre || '—'}</td>
                <td>{t.profesional_nombre || '—'}</td>
                <td>{t.tratamiento || '—'}</td>
                <td>{formatFechaHora(t.fecha_hora)}</td>
                <td>{ESTADO_LABEL[t.estado] || t.estado}</td>
                <td style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {t.estado === 'confirmado' && (
                    <>
                      <a href="#" onClick={(e) => { e.preventDefault(); cambiarEstado(t.id, 'atendido') }}>Marcar atendido</a>
                      <a href="#" onClick={(e) => { e.preventDefault(); cambiarEstado(t.id, 'cancelado') }}>Cancelar</a>
                    </>
                  )}
                  {(t.estado === 'cancelado' || t.estado === 'atendido') && (
                    <a href="#" onClick={(e) => { e.preventDefault(); cambiarEstado(t.id, 'confirmado') }}>Reactivar</a>
                  )}
                  <a href="#" onClick={(e) => { e.preventDefault(); empezarEdicion(t) }}>Editar</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(t.id) }}>Eliminar</a>
                </td>
              </tr>
            ))}
            {turnos.length === 0 && (
              <tr><td colSpan={6}>Todavía no hay turnos cargados.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      )}
    </div>
  )
}
