import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPaciente, updatePaciente, getOdontograma, setPiezaOdontograma, borrarPiezaOdontograma } from '../lib/api.js'
import Odontograma from './Odontograma.jsx'

const FORM_VACIO = {
  nombre: '', telefono: '', email: '', ultima_visita: '',
  domicilio: '', localidad: '', ocupacion: '', fecha_nacimiento: '',
  obra_social: '', nro_afiliado: '', plan_tratamiento: '',
  dientes_existentes: '', color: '', observaciones: '',
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
          nombre: paciente.nombre || '',
          telefono: paciente.telefono || '',
          email: paciente.email || '',
          ultima_visita: paciente.ultima_visita ? paciente.ultima_visita.slice(0, 10) : '',
          domicilio: paciente.domicilio || '',
          localidad: paciente.localidad || '',
          ocupacion: paciente.ocupacion || '',
          fecha_nacimiento: paciente.fecha_nacimiento ? paciente.fecha_nacimiento.slice(0, 10) : '',
          obra_social: paciente.obra_social || '',
          nro_afiliado: paciente.nro_afiliado || '',
          plan_tratamiento: paciente.plan_tratamiento || '',
          dientes_existentes: paciente.dientes_existentes || '',
          color: paciente.color || '',
          observaciones: paciente.observaciones || '',
        })
        const nuevasMarcas = { estado_actual: {}, tratamiento_realizado: {} }
        odonto.forEach((m) => { nuevasMarcas[m.tipo][m.pieza] = m.condicion })
        setMarcas(nuevasMarcas)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(cargar, [id])

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

  async function handleCambiarPieza(tipo, pieza, condicion) {
    setMarcas((prev) => {
      const copia = { ...prev, [tipo]: { ...prev[tipo] } }
      if (condicion) copia[tipo][pieza] = condicion
      else delete copia[tipo][pieza]
      return copia
    })
    try {
      if (condicion) await setPiezaOdontograma(id, tipo, pieza, condicion)
      else await borrarPiezaOdontograma(id, tipo, pieza)
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
      <h2>Ficha odontológica {form.nombre && `— ${form.nombre}`}</h2>

      {error && <p style={{ color: '#B3413A' }}>{error}</p>}
      {mensaje && <p style={{ color: 'var(--accent-dark)' }}>{mensaje}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 24px' }}>
          <div className="form-field">
            <label htmlFor="nombre">Apellido y nombre</label>
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
            <label htmlFor="ocupacion">Ocupación</label>
            <input id="ocupacion" value={form.ocupacion} onChange={(e) => setForm({ ...form, ocupacion: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="fechaNacimiento">Fecha de nacimiento {edad !== null && `(${edad} años)`}</label>
            <input id="fechaNacimiento" type="date" value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} />
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
        onCambiar={(pieza, condicion) => handleCambiarPieza('estado_actual', pieza, condicion)}
      />
      <Odontograma
        titulo="Tratamientos realizados"
        marcas={marcas.tratamiento_realizado}
        onCambiar={(pieza, condicion) => handleCambiarPieza('tratamiento_realizado', pieza, condicion)}
      />
    </div>
  )
}
