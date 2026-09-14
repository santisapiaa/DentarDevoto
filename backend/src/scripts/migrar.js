// Aplica schema.sql contra la base indicada en DATABASE_URL.
// Útil para bases administradas (Render, Railway) donde no tenés psql a mano.
// Uso: npm run migrate
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from '../db/pool.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const schemaPath = path.join(__dirname, '../db/schema.sql')
const sql = fs.readFileSync(schemaPath, 'utf-8')

try {
  await pool.query(sql)
  console.log('Schema aplicado correctamente.')
} catch (err) {
  console.error('Error al aplicar el schema:', err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
