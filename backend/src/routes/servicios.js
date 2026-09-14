import { Router } from 'express'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Público: solo servicios activos (lo que se muestra en /servicios)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM servicios WHERE activo = TRUE ORDER BY id')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener servicios' })
  }
})

// Admin: todos los servicios, activos e inactivos
router.get('/todos', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM servicios ORDER BY id')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener servicios' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  const { nombre, descripcion, precio } = req.body
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO servicios (nombre, descripcion, precio) VALUES ($1, $2, $3) RETURNING *',
      [nombre, descripcion || null, precio || 'Consultar']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el servicio' })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  const { nombre, descripcion, precio, activo } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE servicios SET nombre = $1, descripcion = $2, precio = $3, activo = $4 WHERE id = $5 RETURNING *`,
      [nombre, descripcion || null, precio || 'Consultar', activo, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Servicio no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el servicio' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM servicios WHERE id = $1 RETURNING id', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Servicio no encontrado' })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el servicio' })
  }
})

export default router
