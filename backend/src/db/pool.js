import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// Dentar Devoto es una sola sucursal en un solo huso horario: "timestamp" y
// "date" acá son siempre hora de pared de Buenos Aires, sin zona horaria real.
// Por default, node-pg los convierte a objetos Date de JS, que sí tienen huso
// horario — y como el proceso corre en UTC pero el navegador en UTC-3, cada
// vuelta (guardar → leer → re-guardar) termina corriendo el horario. Estos
// parsers devuelven el texto tal cual está guardado, sin pasar por Date.
pg.types.setTypeParser(1114, (value) => value.replace(' ', 'T')) // timestamp without time zone
pg.types.setTypeParser(1082, (value) => value) // date

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
})
