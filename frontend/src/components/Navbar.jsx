import { NavLink } from 'react-router-dom'
import { buildWhatsappLink } from '../lib/whatsapp.js'
import logoDentar from '../assets/logo-dentar.png'

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__brand">
        <img className="navbar__logo" src={logoDentar} alt="Dentar" />
        <span className="navbar__brand-text">Devoto</span>
      </NavLink>
      <div className="navbar__links">
        <NavLink to="/servicios">Servicios</NavLink>
        <NavLink to="/profesionales">Profesionales</NavLink>
        <NavLink to="/contacto">Contacto</NavLink>
        <NavLink to="/login">Ingresar</NavLink>
        <a
          className="btn btn--primary"
          href={buildWhatsappLink('Hola! Quiero consultar por un turno en Dentar Devoto')}
          target="_blank"
          rel="noreferrer"
        >
          Pedir turno
        </a>
      </div>
    </nav>
  )
}
