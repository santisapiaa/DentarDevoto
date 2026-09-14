import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.js'
import serviciosRoutes from './routes/servicios.js'
import profesionalesRoutes from './routes/profesionales.js'
import pacientesRoutes from './routes/pacientes.js'
import turnosRoutes from './routes/turnos.js'
import usuariosRoutes from './routes/usuarios.js'

dotenv.config()

const app = express()
app.use(helmet())

// FRONTEND_URL admite una o varias URLs separadas por coma
// (ej. el dominio de producción de Vercel + algún preview puntual).
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Origen no permitido por CORS'))
  },
}))
app.use(express.json())

// Frena intentos de fuerza bruta contra el login del staff.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Probá de nuevo en unos minutos.' },
})

app.use('/api/auth/login', loginLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/servicios', serviciosRoutes)
app.use('/api/profesionales', profesionalesRoutes)
app.use('/api/pacientes', pacientesRoutes)
app.use('/api/turnos', turnosRoutes)
app.use('/api/usuarios', usuariosRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use((req, res) => res.status(404).json({ error: 'No encontrado' }))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`)
})
