import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getPaciente, updatePaciente,
  getOdontograma, setSuperficieOdontograma, borrarSuperficieOdontograma,
} from '../lib/api.js'
import Odontograma from './Odontograma.jsx'
import CuentaCorriente from './CuentaCorriente.jsx'
import { CONDICIONES_MEDICAS } from '../lib/antecedentes.js'

const FORM_VACIO = {
  apellido: '', nombre: '', telefono: '', email: '', ultima_visita: '',
  domicilio: '', localidad: '', cp: '', ocupacion: '', fecha_nacimiento: '',
  sexo: '', estado_civil: '', derivado_por: '',
  obra_social: '', nro_afiliado: '', plan_tratamiento: '',
  dientes_existentes: '', color: '', observaciones: '',
  antecedentes: [], usa_marcapasos: null, alergico_farmacos: null,
  trastornos_hemorragicos: null, toma_medicacion: null, medicacion_detalle: '',
}

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null
  const [anio, mes, dia] = fechaNacimiento.slice(0, 10).split('-').map(Number)
  const hoy = new Date()
  let edad = hoy.getFullYear() - anio
  const noCumplioAun = hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)
  if (noCumplioAun) edad -= 1
  return edad
}

function SiNoPregunta({ label, valor, onChange }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text)' }}>
          <input type="radio" checked={valor === true} onChange={() => onChange(true)} /> Sí
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text)' }}>
          <input type="radio" checked={valor === false} onChange={() => onChange(false)} /> No
        </label>
      </div>
    </div>
  )
}

export default function FichaPaciente() {
  const { id } = useParams()
  const [form, setForm] = useState(FORM_VACIO)
  const [marcas, setMarcas] = useState({ estado_actual: {}, tratamiento_realizado: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)

  function cargar() {
    setLoading(true)
    Promise.all([getPaciente(id), getOdontograma(id)])
      .then(([paciente, odonto]) => {
        setForm({
          apellido: paciente.apellido || '',
          nombre: paciente.nombre || '',
          telefono: paciente.telefono || '',
          email: paciente.email || '',
          ultima_visita: paciente.ultima_visita ? paciente.ultima_visita.slice(0, 10) : '',
          domicilio: paciente.domicilio || '',
          localidad: paciente.localidad || '',
          cp: paciente.cp || '',
          ocupacion: paciente.ocupacion || '',
          fecha_nacimiento: paciente.fecha_nacimiento ? paciente.fecha_nacimiento.slice(0, 10) : '',
          sexo: paciente.sexo || '',
          estado_civil: paciente.estado_civil || '',
          derivado_por: paciente.derivado_por || '',
          obra_social: paciente.obra_social || '',
          nro_afiliado: paciente.nro_afiliado || '',
          plan_tratamiento: paciente.plan_tratamiento || '',
          dientes_existentes: paciente.dientes_existentes || '',
          color: paciente.color || '',
          observaciones: paciente.observaciones || '',
          antecedentes: paciente.antecedentes || [],
          usa_marcapasos: paciente.usa_marcapasos,
          alergico_farmacos: paciente.alergico_farmacos,
          trastornos_hemorragicos: paciente.trastornos_hemorragicos,
          toma_medicacion: paciente.toma_medicacion,
          medicacion_detalle: paciente.medicacion_detalle || '',
        })
        const nuevasMarcas = { estado_actual: {}, tratamiento_realizado: {} }
        odonto.forEach((m) => {
          if (!nuevasMarcas[m.tipo][m.pieza]) nuevasMarcas[m.tipo][m.pieza] = {}
          nuevasMarcas[m.tipo][m.pieza][m.superficie] = m.condicion
        })
        setMarcas(nuevasMarcas)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(cargar, [id])

  function toggleAntecedente(key) {
    setForm((prev) => {
      const yaEsta = prev.antecedentes.includes(key)
      const antecedentes = yaEsta ? prev.antecedentes.filter((a) => a !== key) : [...prev.antecedentes, key]
      return { ...prev, antecedentes }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setGuardando(true)
    setMensaje('')
    try {
      await updatePaciente(id, form)
      setMensaje('Ficha guardada.')
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleCambiarSuperficie(tipo, pieza, superficie, condicion) {
    setMarcas((prev) => {
      const copia = { ...prev, [tipo]: { ...prev[tipo] } }
      const piezaActual = { ...(copia[tipo][pieza] || {}) }
      if (condicion) piezaActual[superficie] = condicion
      else delete piezaActual[superficie]
      copia[tipo][pieza] = piezaActual
      return copia
    })
    try {
      if (condicion) await setSuperficieOdontograma(id, tipo, pieza, superficie, condicion)
      else await borrarSuperficieOdontograma(id, tipo, pieza, superficie)
    } catch (err) {
      setError(err.message)
      cargar()
    }
  }

  const edad = calcularEdad(form.fecha_nacimiento)

  if (loading) return <p>Cargando…</p>

  return (
    <div>
      <p><Link to="/admin/pacientes">← Volver al fichero</Link></p>
      <h2>Ficha odontológica {(form.apellido || form.nombre) && `— ${form.apellido} ${form.nombre}`}</h2>

      {error && <p style={{ color: '#B3413A' }}>{error}</p>}
      {mensaje && <p style={{ color: 'var(--accent-dark)' }}>{mensaje}</p>}

      <form onSubmit={handleSubmit}>
        <h3>Datos personales</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 24px' }}>
          <div className="form-field">
            <label htmlFor="apellido">Apellido</label>
            <input id="apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
          </div>
          <div className="form-field">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="form-field">
            <label htmlFor="telefono">Teléfono</label>
            <input id="telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="domicilio">Domicilio</label>
            <input id="domicilio" value={form.domicilio} onChange={(e) => setForm({ ...form, domicilio: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="localidad">Localidad</label>
            <input id="localidad" value={form.localidad} onChange={(e) => setForm({ ...form, localidad: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="cp">Código postal</label>
            <input id="cp" value={form.cp} onChange={(e) => setForm({ ...form, cp: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="ocupacion">Profesión</label>
            <input id="ocupacion" value={form.ocupacion} onChange={(e) => setForm({ ...form, ocupacion: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="fechaNacimiento">Fecha de nacimiento {edad !== null && `(${edad} años)`}</label>
            <input id="fechaNacimiento" type="date" value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="sexo">Sexo</label>
            <select id="sexo" value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })}>
              <option value="">—</option>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="estadoCivil">Estado civil</label>
            <select id="estadoCivil" value={form.estado_civil} onChange={(e) => setForm({ ...form, estado_civil: e.target.value })}>
              <option value="">—</option>
              <option value="soltero">Soltero/a</option>
              <option value="casado">Casado/a</option>
              <option value="divorciado">Divorciado/a</option>
              <option value="viudo">Viudo/a</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="derivadoPor">Derivado por</label>
            <input id="derivadoPor" value={form.derivado_por} onChange={(e) => setForm({ ...form, derivado_por: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="obraSocial">Obra social</label>
            <input id="obraSocial" value={form.obra_social} onChange={(e) => setForm({ ...form, obra_social: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="nroAfiliado">N° de afiliado</label>
            <input id="nroAfiliado" value={form.nro_afiliado} onChange={(e) => setForm({ ...form, nro_afiliado: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="ultimaVisita">Última visita</label>
            <input id="ultimaVisita" type="date" value={form.ultima_visita} onChange={(e) => setForm({ ...form, ultima_visita: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="dientesExistentes">Dientes existentes</label>
            <input id="dientesExistentes" value={form.dientes_existentes} onChange={(e) => setForm({ ...form, dientes_existentes: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="color">Color</label>
            <input id="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          </div>
        </div>

        <h3>Historia clínica</h3>
        <p style={{ marginTop: -8 }}>Antecedentes: marcá lo que haya padecido o padezca el paciente.</p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '6px 16px', marginBottom: 20,
        }}>
          {CONDICIONES_MEDICAS.map((c) => (
            <label key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={form.antecedentes.includes(c.key)}
                onChange={() => toggleAntecedente(c.key)}
              />
              {c.label}
            </label>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0 24px' }}>
          <SiNoPregunta label="¿Usa marcapasos?" valor={form.usa_marcapasos} onChange={(v) => setForm({ ...form, usa_marcapasos: v })} />
          <SiNoPregunta label="¿Es alérgico a alguna droga o fármaco?" valor={form.alergico_farmacos} onChange={(v) => setForm({ ...form, alergico_farmacos: v })} />
          <SiNoPregunta label="¿Tiene o tuvo trastornos hemorrágicos?" valor={form.trastornos_hemorragicos} onChange={(v) => setForm({ ...form, trastornos_hemorragicos: v })} />
          <SiNoPregunta label="¿Toma alguna medicación?" valor={form.toma_medicacion} onChange={(v) => setForm({ ...form, toma_medicacion: v })} />
        </div>
        {form.toma_medicacion && (
          <div className="form-field" style={{ maxWidth: 420 }}>
            <label htmlFor="medicacionDetalle">¿Cuál?</label>
            <input id="medicacionDetalle" value={form.medicacion_detalle} onChange={(e) => setForm({ ...form, medicacion_detalle: e.target.value })} />
          </div>
        )}

        <h3>Tratamiento</h3>
        <div className="form-field">
          <label htmlFor="planTratamiento">Plan de tratamiento</label>
          <textarea id="planTratamiento" value={form.plan_tratamiento} onChange={(e) => setForm({ ...form, plan_tratamiento: e.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="observaciones">Observaciones</label>
          <textarea id="observaciones" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
        </div>

        <button className="btn btn--primary" type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar ficha'}
        </button>
      </form>

      <hr style={{ margin: '32px 0', border: 0, borderTop: '1px solid var(--line)' }} />

      <Odontograma
        titulo="Estado actual"
        marcas={marcas.estado_actual}
        onCambiar={(pieza, superficie, condicion) => handleCambiarSuperficie('estado_actual', pieza, superficie, condicion)}
      />
      <Odontograma
        titulo="Tratamientos realizados"
        marcas={marcas.tratamiento_realizado}
        onCambiar={(pieza, superficie, condicion) => handleCambiarSuperficie('tratamiento_realizado', pieza, superficie, condicion)}
      />

      <hr style={{ margin: '32px 0', border: 0, borderTop: '1px solid var(--line)' }} />

      <CuentaCorriente pacienteId={id} />
    </div>
  )
}
