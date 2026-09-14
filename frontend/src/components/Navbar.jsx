import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { buildWhatsappLink } from '../lib/whatsapp.js'
import logoDentarDevoto from '../assets/logo-dentar-devoto.png'

export default function Navbar() {
  const [abierto, setAbierto] = useState(false)
  const cerrar = () => setAbierto(false)

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__brand" onClick={cerrar}>
        <img className="navbar__logo" src={logoDentarDevoto} alt="Dentar Devoto" />
      </NavLink>

      <button
        type="button"
        className="navbar__toggle"
        aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        <span /><span /><span />
      </button>

      <div className={`navbar__links${abierto ? ' is-open' : ''}`}>
        <NavLink to="/servicios" onClick={cerrar}>Servicios</NavLink>
        <NavLink to="/profesionales" onClick={cerrar}>Profesionales</NavLink>
        <NavLink to="/contacto" onClick={cerrar}>Contacto</NavLink>
        <NavLink to="/login" onClick={cerrar}>Ingresar</NavLink>
        <a
          className="btn btn--primary"
          href={buildWhatsappLink('Hola! Quiero consultar por un turno en Dentar Devoto')}
          target="_blank"
          rel="noreferrer"
          onClick={cerrar}
        >
          Pedir turno
        </a>
      </div>
    </nav>
  )
}
