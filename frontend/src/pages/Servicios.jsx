import { useEffect, useState } from 'react'
import { getServicios } from '../lib/api.js'

export default function Servicios() {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getServicios()
      .then(setServicios)
      .catch(() => setError('No pudimos cargar los tratamientos. Probá de nuevo más tarde.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="section container">
      <h1>Tratamientos</h1>
      <p>El valor de cada tratamiento depende del caso. Escribinos por WhatsApp y te lo confirmamos.</p>
      {loading && <p>Cargando…</p>}
      {error && <p style={{ color: '#B3413A' }}>{error}</p>}
      <div className="grid" style={{ marginTop: 32 }}>
        {servicios.map((s) => (
          <div className="card" key={s.id}>
            <h3>{s.nombre}</h3>
            <div className="card__price">{s.precio}</div>
            <p>{s.descripcion}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
