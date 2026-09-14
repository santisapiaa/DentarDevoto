import { useState } from 'react'
import {
  PIEZAS_PERMANENTES_SUPERIORES, PIEZAS_PERMANENTES_INFERIORES,
  PIEZAS_LECHE_SUPERIORES, PIEZAS_LECHE_INFERIORES,
  SUPERFICIES, CONDICIONES, condicionPorKey,
} from '../lib/odontograma.js'

// marcas: { [pieza]: { [superficie]: condicionKey } }. onCambiar(pieza, superficie, condicionKey | null).
export default function Odontograma({ titulo, marcas, onCambiar }) {
  const [piezaAbierta, setPiezaAbierta] = useState(null)

  function colorPieza(pieza) {
    const superficiesMarcadas = Object.values(marcas[pieza] || {})
    if (superficiesMarcadas.length === 0) return null
    return condicionPorKey(superficiesMarcadas[0])?.color
  }

  function renderFila(piezas) {
    return (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {piezas.map((pieza) => {
          const color = colorPieza(pieza)
          const abierta = piezaAbierta === pieza
          return (
            <button
              key={pieza}
              type="button"
              onClick={() => setPiezaAbierta(abierta ? null : pieza)}
              title={`Pieza ${pieza}`}
              style={{
                width: 34, height: 34, fontSize: '0.72rem', cursor: 'pointer',
                borderRadius: 4,
                border: abierta ? '2px solid var(--accent-dark)' : color ? `2px solid ${color}` : '1px solid var(--line)',
                background: '#fff',
                fontWeight: abierta ? 700 : 400,
              }}
            >
              {pieza}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>{titulo}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        {renderFila(PIEZAS_PERMANENTES_SUPERIORES)}
        {renderFila(PIEZAS_PERMANENTES_INFERIORES)}
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-soft)', margin: '4px 0' }}>Dientes de leche</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {renderFila(PIEZAS_LECHE_SUPERIORES)}
        {renderFila(PIEZAS_LECHE_INFERIORES)}
      </div>

      {piezaAbierta && (
        <div className="card" style={{ padding: 16, marginBottom: 16, maxWidth: 420 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Pieza {piezaAbierta}</strong>
            <a href="#" onClick={(e) => { e.preventDefault(); setPiezaAbierta(null) }}>Cerrar</a>
          </div>
          {SUPERFICIES.map((s) => (
            <div className="form-field" key={s.key}>
              <label htmlFor={`sup-${piezaAbierta}-${s.key}`}>{s.label}</label>
              <select
                id={`sup-${piezaAbierta}-${s.key}`}
                value={marcas[piezaAbierta]?.[s.key] || ''}
                onChange={(e) => onCambiar(piezaAbierta, s.key, e.target.value || null)}
              >
                <option value="">— Sin marca —</option>
                {CONDICIONES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <details>
        <summary style={{ cursor: 'pointer', color: 'var(--text-soft)', fontSize: '0.85rem' }}>Referencias</summary>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 10 }}>
          {CONDICIONES.map((c) => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
              <span style={{ width: 14, height: 14, borderRadius: 3, background: c.color, display: 'inline-block' }} />
              {c.abrev} — {c.label}
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
