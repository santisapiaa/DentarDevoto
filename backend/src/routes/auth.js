import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email])
    const usuario = rows[0]
    if (!usuario) return res.status(401).json({ error: 'Credenciales incorrectas' })

    const valido = await bcrypt.compare(password, usuario.password_hash)
    if (!valido) return res.status(401).json({ error: 'Credenciales incorrectas' })

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )
    res.json({ token })
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ id: req.user.id, email: req.user.email, rol: req.user.rol })
})

export default router
