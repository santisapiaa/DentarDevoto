import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// Los proveedores administrados (Render, Railway, etc.) exigen SSL.
// En local (Postgres propio) no hace falta.
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
})
