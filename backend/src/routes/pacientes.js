import { Router } from 'express'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Protegido: solo staff logueado puede ver el fichero de pacientes
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pacientes ORDER BY nombre')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pacientes' })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pacientes WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Paciente no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el paciente' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  const { nombre, telefono, email, ultima_visita } = req.body
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO pacientes (nombre, telefono, email, ultima_visita) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, telefono || null, email || null, ultima_visita || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el paciente' })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  const {
    nombre, telefono, email, ultima_visita,
    domicilio, localidad, ocupacion, fecha_nacimiento,
    obra_social, nro_afiliado, plan_tratamiento,
    dientes_existentes, color, observaciones,
  } = req.body
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' })
  try {
    const { rows } = await pool.query(
      `UPDATE pacientes SET
        nombre = $1, telefono = $2, email = $3, ultima_visita = $4,
        domicilio = $5, localidad = $6, ocupacion = $7, fecha_nacimiento = $8,
        obra_social = $9, nro_afiliado = $10, plan_tratamiento = $11,
        dientes_existentes = $12, color = $13, observaciones = $14
       WHERE id = $15 RETURNING *`,
      [
        nombre, telefono || null, email || null, ultima_visita || null,
        domicilio || null, localidad || null, ocupacion || null, fecha_nacimiento || null,
        obra_social || null, nro_afiliado || null, plan_tratamiento || null,
        dientes_existentes || null, color || null, observaciones || null,
        req.params.id,
      ]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Paciente no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el paciente' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM pacientes WHERE id = $1 RETURNING id', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Paciente no encontrado' })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el paciente' })
  }
})

export default router
