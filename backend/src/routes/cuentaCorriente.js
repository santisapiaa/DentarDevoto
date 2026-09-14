import { Router } from 'express'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

// Montado en /api/pacientes/:pacienteId/cuenta-corriente (mergeParams para leer :pacienteId)
const router = Router({ mergeParams: true })

// El saldo se calcula al vuelo (suma acumulada de debe-haber en orden de
// fecha) en vez de guardarse, para que nunca quede desincronizado si se
// edita o borra un movimiento viejo.
const SELECT_CON_SALDO = `
  SELECT id, fecha, presentacion, debe, haber,
    SUM(debe - haber) OVER (ORDER BY fecha, id) AS saldo
  FROM cuenta_corriente
  WHERE paciente_id = $1
  ORDER BY fecha, id
`

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(SELECT_CON_SALDO, [req.params.pacienteId])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la cuenta corriente' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  const { fecha, presentacion, debe, haber } = req.body
  if (!fecha || !presentacion) return res.status(400).json({ error: 'Fecha y presentación son obligatorias' })
  try {
    await pool.query(
      'INSERT INTO cuenta_corriente (paciente_id, fecha, presentacion, debe, haber) VALUES ($1, $2, $3, $4, $5)',
      [req.params.pacienteId, fecha, presentacion, debe || 0, haber || 0]
    )
    const { rows } = await pool.query(SELECT_CON_SALDO, [req.params.pacienteId])
    res.status(201).json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el movimiento' })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  const { fecha, presentacion, debe, haber } = req.body
  if (!fecha || !presentacion) return res.status(400).json({ error: 'Fecha y presentación son obligatorias' })
  try {
    const { rows } = await pool.query(
      `UPDATE cuenta_corriente SET fecha = $1, presentacion = $2, debe = $3, haber = $4
       WHERE id = $5 AND paciente_id = $6 RETURNING id`,
      [fecha, presentacion, debe || 0, haber || 0, req.params.id, req.params.pacienteId]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Movimiento no encontrado' })
    const { rows: full } = await pool.query(SELECT_CON_SALDO, [req.params.pacienteId])
    res.json(full)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el movimiento' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM cuenta_corriente WHERE id = $1 AND paciente_id = $2 RETURNING id',
      [req.params.id, req.params.pacienteId]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Movimiento no encontrado' })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el movimiento' })
  }
})

export default router
