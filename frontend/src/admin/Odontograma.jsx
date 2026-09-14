import { PIEZAS_SUPERIORES, PIEZAS_INFERIORES, CONDICIONES, condicionPorKey } from '../lib/odontograma.js'

// marcas: { [pieza]: condicionKey }. onCambiar(pieza, condicionKey | null) — null borra la marca.
export default function Odontograma({ titulo, marcas, onCambiar }) {
  function renderFila(piezas) {
    return (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {piezas.map((pieza) => {
          const condicion = condicionPorKey(marcas[pieza])
          return (
            <div key={pieza} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)' }}>{pieza}</div>
              <select
                value={marcas[pieza] || ''}
                onChange={(e) => onCambiar(pieza, e.target.value || null)}
                title={condicion?.label || 'Sin marca'}
                style={{
                  width: 44,
                  padding: '4px 2px',
                  fontSize: '0.72rem',
                  textAlign: 'center',
                  border: '1px solid var(--line)',
                  borderRadius: 4,
                  background: condicion ? condicion.color : '#fff',
                  color: condicion ? '#fff' : 'var(--text)',
                }}
              >
                <option value="">—</option>
                {CONDICIONES.map((c) => (
                  <option key={c.key} value={c.key}>{c.abrev}</option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>{titulo}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {renderFila(PIEZAS_SUPERIORES)}
        {renderFila(PIEZAS_INFERIORES)}
      </div>
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
