import { Router } from 'express'
import { pool } from '../db/pool.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM profesionales ORDER BY id')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener profesionales' })
  }
})

export default router
