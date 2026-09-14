import { Router } from 'express'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const ESTADOS_VALIDOS = ['confirmado', 'cancelado', 'atendido']

const SELECT_TURNO = `
  SELECT
    t.id, t.tratamiento, t.fecha_hora, t.notas, t.estado, t.creado_en,
    t.paciente_id, COALESCE(p.nombre, t.paciente_nombre) AS paciente_nombre,
    t.profesional_id, pr.nombre AS profesional_nombre
  FROM turnos t
  LEFT JOIN pacientes p ON p.id = t.paciente_id
  LEFT JOIN profesionales pr ON pr.id = t.profesional_id
`

// Si viene paciente_id, guardamos también su nombre actual como copia:
// así, si el paciente se borra del fichero más adelante, el turno no
// se queda sin nombre (la columna paciente_id pasa a NULL por el ON DELETE SET NULL).
async function resolverNombrePaciente(paciente_id, paciente_nombre) {
  if (!paciente_id) return paciente_nombre || null
  const { rows } = await pool.query('SELECT nombre FROM pacientes WHERE id = $1', [paciente_id])
  return rows[0]?.nombre || null
}

// Todos los turnos se coordinan por WhatsApp; esto es el registro interno
// que carga el asistente una vez que el turno ya quedó acordado.
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`${SELECT_TURNO} ORDER BY t.fecha_hora`)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener turnos' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  const { paciente_id, paciente_nombre, profesional_id, tratamiento, fecha_hora, notas } = req.body
  if (!fecha_hora) return res.status(400).json({ error: 'La fecha y hora son obligatorias' })
  if (!paciente_id && !paciente_nombre) {
    return res.status(400).json({ error: 'Indicá el paciente (de la lista o a mano)' })
  }
  try {
    if (paciente_id) {
      const existe = await pool.query('SELECT 1 FROM pacientes WHERE id = $1', [paciente_id])
      if (!existe.rows[0]) return res.status(400).json({ error: 'El paciente seleccionado no existe' })
    }
    const nombreSnapshot = await resolverNombrePaciente(paciente_id, paciente_nombre)
    const { rows } = await pool.query(
      `INSERT INTO turnos (paciente_id, paciente_nombre, profesional_id, tratamiento, fecha_hora, notas)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [paciente_id || null, nombreSnapshot, profesional_id || null, tratamiento || null, fecha_hora, notas || null]
    )
    const { rows: full } = await pool.query(`${SELECT_TURNO} WHERE t.id = $1`, [rows[0].id])
    res.status(201).json(full[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el turno' })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  const { paciente_id, paciente_nombre, profesional_id, tratamiento, fecha_hora, notas } = req.body
  try {
    const nombreSnapshot = await resolverNombrePaciente(paciente_id, paciente_nombre)
    const { rows } = await pool.query(
      `UPDATE turnos SET paciente_id = $1, paciente_nombre = $2, profesional_id = $3,
        tratamiento = $4, fecha_hora = $5, notas = $6 WHERE id = $7 RETURNING id`,
      [paciente_id || null, nombreSnapshot, profesional_id || null, tratamiento || null, fecha_hora, notas || null, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Turno no encontrado' })
    const { rows: full } = await pool.query(`${SELECT_TURNO} WHERE t.id = $1`, [rows[0].id])
    res.json(full[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el turno' })
  }
})

// Cambiar solo el estado (confirmar / cancelar / marcar atendido) sin reenviar todo el turno.
router.patch('/:id/estado', requireAuth, async (req, res) => {
  const { estado } = req.body
  if (!ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Usá: ${ESTADOS_VALIDOS.join(', ')}` })
  }
  try {
    const { rows } = await pool.query(
      'UPDATE turnos SET estado = $1 WHERE id = $2 RETURNING id, paciente_id, fecha_hora',
      [estado, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Turno no encontrado' })

    // Al marcar un turno como atendido, actualiza la última visita del paciente
    // (sin retroceder si ya tenía una visita más reciente registrada).
    if (estado === 'atendido' && rows[0].paciente_id) {
      await pool.query(
        'UPDATE pacientes SET ultima_visita = GREATEST(ultima_visita, $2::date) WHERE id = $1',
        [rows[0].paciente_id, rows[0].fecha_hora]
      )
    }

    const { rows: full } = await pool.query(`${SELECT_TURNO} WHERE t.id = $1`, [rows[0].id])
    res.json(full[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el estado' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM turnos WHERE id = $1 RETURNING id', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Turno no encontrado' })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el turno' })
  }
})

export default router
