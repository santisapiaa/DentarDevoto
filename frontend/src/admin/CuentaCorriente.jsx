import { useEffect, useState } from 'react'
import { getCuentaCorriente, createMovimiento, deleteMovimiento } from '../lib/api.js'

const FORM_VACIO = { fecha: '', presentacion: '', debe: '', haber: '' }

function formatMoneda(valor) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(valor))
}

// Igual que ultima_visita: nunca pasar la fecha por `new Date(...)`, se muestra tal cual llega.
function formatFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

export default function CuentaCorriente({ pacienteId }) {
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)

  function cargar() {
    setLoading(true)
    getCuentaCorriente(pacienteId)
      .then(setMovimientos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(cargar, [pacienteId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.fecha || !form.presentacion) return
    setGuardando(true)
    try {
      const actualizados = await createMovimiento(pacienteId, {
        fecha: form.fecha,
        presentacion: form.presentacion,
        debe: form.debe || 0,
        haber: form.haber || 0,
      })
      setMovimientos(actualizados)
      setForm(FORM_VACIO)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este movimiento?')) return
    try {
      await deleteMovimiento(pacienteId, id)
      cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  const saldoFinal = movimientos.length ? movimientos[movimientos.length - 1].saldo : 0

  return (
    <div>
      <h3>Cuenta corriente</h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 20 }}>
        <div className="form-field" style={{ marginBottom: 0 }}>
          <label htmlFor="ccFecha">Fecha</label>
          <input id="ccFecha" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required />
        </div>
        <div className="form-field" style={{ marginBottom: 0, minWidth: 200 }}>
          <label htmlFor="ccPresentacion">Presentación realizada</label>
          <input id="ccPresentacion" value={form.presentacion} onChange={(e) => setForm({ ...form, presentacion: e.target.value })} required />
        </div>
        <div className="form-field" style={{ marginBottom: 0, width: 110 }}>
          <label htmlFor="ccDebe">Debe</label>
          <input id="ccDebe" type="number" step="0.01" min="0" value={form.debe} onChange={(e) => setForm({ ...form, debe: e.target.value })} />
        </div>
        <div className="form-field" style={{ marginBottom: 0, width: 110 }}>
          <label htmlFor="ccHaber">Haber</label>
          <input id="ccHaber" type="number" step="0.01" min="0" value={form.haber} onChange={(e) => setForm({ ...form, haber: e.target.value })} />
        </div>
        <button className="btn btn--primary" type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Agregar'}
        </button>
      </form>

      {error && <p style={{ color: '#B3413A' }}>{error}</p>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <>
          <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Presentación realizada</th>
                <th>Debe</th>
                <th>Haber</th>
                <th>Saldo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id}>
                  <td>{formatFecha(m.fecha)}</td>
                  <td>{m.presentacion}</td>
                  <td>{Number(m.debe) ? formatMoneda(m.debe) : '—'}</td>
                  <td>{Number(m.haber) ? formatMoneda(m.haber) : '—'}</td>
                  <td>{formatMoneda(m.saldo)}</td>
                  <td><a href="#" onClick={(e) => { e.preventDefault(); handleDelete(m.id) }}>Eliminar</a></td>
                </tr>
              ))}
              {movimientos.length === 0 && (
                <tr><td colSpan={6}>Todavía no hay movimientos.</td></tr>
              )}
            </tbody>
          </table>
          </div>
          {movimientos.length > 0 && (
            <p style={{ marginTop: 12 }}><strong>Saldo actual: {formatMoneda(saldoFinal)}</strong></p>
          )}
        </>
      )}
    </div>
  )
}
