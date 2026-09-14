import { useEffect, useState } from 'react'
import { getProfesionales } from '../lib/api.js'

// TODO: sumar matrícula (MN), universidad y foto de cada profesional cuando las tengas a mano.
export default function Profesionales() {
  const [profesionales, setProfesionales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProfesionales()
      .then(setProfesionales)
      .catch(() => setError('No pudimos cargar el equipo. Probá de nuevo más tarde.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="section container">
      <h1>Nuestro equipo en Devoto</h1>
      <p>Los profesionales que atienden en nuestra sucursal, cada uno especializado en su área.</p>
      {loading && <p>Cargando…</p>}
      {error && <p style={{ color: '#B3413A' }}>{error}</p>}
      <div className="grid" style={{ marginTop: 32 }}>
        {profesionales.map((p) => (
          <div className="card" key={p.id}>
            <h3>{p.nombre}</h3>
            <p style={{ color: 'var(--accent-dark)', marginBottom: 4 }}>{p.especialidad}</p>
            <p>{p.titulo}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
