import { useEffect, useState } from 'react'
import { getServiciosAdmin, createServicio, updateServicio, deleteServicio } from '../lib/api.js'

const FORM_VACIO = { nombre: '', descripcion: '', precio: 'Consultar' }

export default function ServiciosAdmin() {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(FORM_VACIO)
  const [editandoId, setEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)

  function cargar() {
    setLoading(true)
    getServiciosAdmin()
      .then(setServicios)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(cargar, [])

  function empezarEdicion(s) {
    setEditandoId(s.id)
    setForm({ nombre: s.nombre, descripcion: s.descripcion || '', precio: s.precio || 'Consultar' })
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setForm(FORM_VACIO)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre) return
    setGuardando(true)
    try {
      if (editandoId) {
        const servicio = servicios.find((s) => s.id === editandoId)
        await updateServicio(editandoId, { ...form, activo: servicio.activo })
      } else {
        await createServicio(form)
      }
      cancelarEdicion()
      cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function toggleActivo(servicio) {
    try {
      await updateServicio(servicio.id, { ...servicio, activo: !servicio.activo })
      cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este servicio?')) return
    try {
      await deleteServicio(id)
      if (editandoId === id) cancelarEdicion()
      cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2>Servicios y precios</h2>
      <p>Los tratamientos que se muestran en la web pública se marcan como "Activo". El precio es texto libre: podés dejar "Consultar" o poner un valor fijo.</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: 480, marginBottom: 32 }}>
        <div className="form-field">
          <label htmlFor="nombre">Nombre del servicio</label>
          <input id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        </div>
        <div className="form-field">
          <label htmlFor="descripcion">Descripción</label>
          <textarea id="descripcion" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="precio">Precio</label>
          <input id="precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} required />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn--primary" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Agregar servicio'}
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
              <th>Nombre</th>
              <th>Precio</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((s) => (
              <tr key={s.id}>
                <td>{s.nombre}</td>
                <td>{s.precio}</td>
                <td>{s.activo ? 'Activo' : 'Oculto'}</td>
                <td style={{ display: 'flex', gap: 12 }}>
                  <a href="#" onClick={(e) => { e.preventDefault(); empezarEdicion(s) }}>Editar</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); toggleActivo(s) }}>
                    {s.activo ? 'Ocultar' : 'Activar'}
                  </a>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(s.id) }}>Eliminar</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  )
}
