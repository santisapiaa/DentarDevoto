// Crea (o actualiza la contraseña de) un usuario de staff directo en la base.
// Uso: npm run crear-admin -- correo@ejemplo.com contraseñaSegura admin
// El rol es opcional y por defecto es "admin".
import bcrypt from 'bcrypt'
import { pool } from '../db/pool.js'

const [, , email, password, rol = 'admin'] = process.argv

if (!email || !password) {
  console.error('Uso: npm run crear-admin -- correo@ejemplo.com contraseñaSegura [admin|asistente]')
  process.exit(1)
}

if (password.length < 8) {
  console.error('La contraseña debe tener al menos 8 caracteres.')
  process.exit(1)
}

const rolFinal = rol === 'asistente' ? 'asistente' : 'admin'

try {
  const passwordHash = await bcrypt.hash(password, 10)
  const { rows } = await pool.query(
    `INSERT INTO usuarios (email, password_hash, rol) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, rol = EXCLUDED.rol
     RETURNING id, email, rol`,
    [email, passwordHash, rolFinal]
  )
  console.log('Usuario listo:', rows[0])
} catch (err) {
  console.error('Error al crear el usuario:', err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
