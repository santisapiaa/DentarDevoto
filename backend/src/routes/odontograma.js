import { Router } from 'express'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'
import { TIPOS, PIEZAS_VALIDAS, SUPERFICIES, CONDICIONES } from '../constants/odontograma.js'

// Montado en /api/pacientes/:pacienteId/odontograma (mergeParams para leer :pacienteId)
const router = Router({ mergeParams: true })

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT tipo, pieza, superficie, condicion FROM odontograma WHERE paciente_id = $1',
      [req.params.pacienteId]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el odontograma' })
  }
})

router.put('/:tipo/:pieza/:superficie', requireAuth, async (req, res) => {
  const { tipo, pieza, superficie } = req.params
  const { condicion } = req.body
  const piezaNum = Number(pieza)

  if (!TIPOS.includes(tipo)) return res.status(400).json({ error: 'Tipo de grilla inválido' })
  if (!PIEZAS_VALIDAS.includes(piezaNum)) return res.status(400).json({ error: 'Número de pieza inválido' })
  if (!SUPERFICIES.includes(superficie)) return res.status(400).json({ error: 'Superficie inválida' })
  if (!CONDICIONES.includes(condicion)) return res.status(400).json({ error: 'Condición inválida' })

  try {
    const { rows } = await pool.query(
      `INSERT INTO odontograma (paciente_id, tipo, pieza, superficie, condicion)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (paciente_id, tipo, pieza, superficie) DO UPDATE SET condicion = EXCLUDED.condicion, actualizado_en = NOW()
       RETURNING tipo, pieza, superficie, condicion`,
      [req.params.pacienteId, tipo, piezaNum, superficie, condicion]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar la superficie' })
  }
})

router.delete('/:tipo/:pieza/:superficie', requireAuth, async (req, res) => {
  const { tipo, pieza, superficie } = req.params
  try {
    await pool.query(
      'DELETE FROM odontograma WHERE paciente_id = $1 AND tipo = $2 AND pieza = $3 AND superficie = $4',
      [req.params.pacienteId, tipo, Number(pieza), superficie]
    )
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: 'Error al borrar la marca' })
  }
})

export default router
