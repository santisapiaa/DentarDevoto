import { Router } from 'express'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'
import { CONDICIONES_MEDICAS } from '../constants/antecedentes.js'

const router = Router()

function validarAntecedentes(antecedentes) {
  if (antecedentes === undefined) return []
  if (!Array.isArray(antecedentes)) return null
  const validos = antecedentes.every((a) => CONDICIONES_MEDICAS.includes(a))
  return validos ? antecedentes : null
}

// Protegido: solo staff logueado puede ver el fichero de pacientes
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pacientes ORDER BY apellido, nombre')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pacientes' })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pacientes WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Paciente no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el paciente' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  const { apellido, nombre, telefono, email } = req.body
  if (!nombre || !apellido) return res.status(400).json({ error: 'Apellido y nombre son obligatorios' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO pacientes (apellido, nombre, telefono, email) VALUES ($1, $2, $3, $4) RETURNING *',
      [apellido, nombre, telefono || null, email || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el paciente' })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  const {
    apellido, nombre, telefono, email, ultima_visita,
    domicilio, localidad, cp, ocupacion, fecha_nacimiento, sexo, estado_civil, derivado_por,
    obra_social, nro_afiliado, plan_tratamiento,
    dientes_existentes, color, observaciones,
    antecedentes, usa_marcapasos, alergico_farmacos, trastornos_hemorragicos, toma_medicacion, medicacion_detalle,
  } = req.body
  if (!nombre || !apellido) return res.status(400).json({ error: 'Apellido y nombre son obligatorios' })

  const antecedentesValidados = validarAntecedentes(antecedentes)
  if (antecedentesValidados === null) return res.status(400).json({ error: 'Antecedentes médicos inválidos' })

  try {
    const { rows } = await pool.query(
      `UPDATE pacientes SET
        apellido = $1, nombre = $2, telefono = $3, email = $4, ultima_visita = $5,
        domicilio = $6, localidad = $7, cp = $8, ocupacion = $9, fecha_nacimiento = $10,
        sexo = $11, estado_civil = $12, derivado_por = $13,
        obra_social = $14, nro_afiliado = $15, plan_tratamiento = $16,
        dientes_existentes = $17, color = $18, observaciones = $19,
        antecedentes = $20, usa_marcapasos = $21, alergico_farmacos = $22,
        trastornos_hemorragicos = $23, toma_medicacion = $24, medicacion_detalle = $25
       WHERE id = $26 RETURNING *`,
      [
        apellido, nombre, telefono || null, email || null, ultima_visita || null,
        domicilio || null, localidad || null, cp || null, ocupacion || null, fecha_nacimiento || null,
        sexo || null, estado_civil || null, derivado_por || null,
        obra_social || null, nro_afiliado || null, plan_tratamiento || null,
        dientes_existentes || null, color || null, observaciones || null,
        JSON.stringify(antecedentesValidados), usa_marcapasos ?? null, alergico_farmacos ?? null,
        trastornos_hemorragicos ?? null, toma_medicacion ?? null, medicacion_detalle || null,
        req.params.id,
      ]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Paciente no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el paciente' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM pacientes WHERE id = $1 RETURNING id', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Paciente no encontrado' })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el paciente' })
  }
})

export default router
