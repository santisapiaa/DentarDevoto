import iconoDentar from '../assets/icono-dentar-blanco.png'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__brand">
          <img className="footer__logo" src={iconoDentar} alt="Dentar" />
          <span className="navbar__brand-text">Dentar Devoto</span>
        </div>
        <p>Dentar Odontología Integral — Sucursal Devoto</p>
        <p>Sanabria 3116, Piso 2, Depto C, Villa Devoto, CABA · Tel: 011-3970-5956</p>
      </div>
    </footer>
  )
}
