import { Router } from 'express'
import bcrypt from 'bcrypt'
import { pool } from '../db/pool.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// Solo admins pueden ver y dar de alta usuarios de staff.
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, email, rol, creado_en FROM usuarios ORDER BY email')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
})

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { email, password, rol } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son obligatorios' })
  if (password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })
  const rolFinal = rol === 'asistente' ? 'asistente' : 'admin'
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      'INSERT INTO usuarios (email, password_hash, rol) VALUES ($1, $2, $3) RETURNING id, email, rol, creado_en',
      [email, passwordHash, rolFinal]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ya existe un usuario con ese email' })
    res.status(500).json({ error: 'Error al crear el usuario' })
  }
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'No podés eliminar tu propio usuario' })
  }
  try {
    const { rows } = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el usuario' })
  }
})

export default router
