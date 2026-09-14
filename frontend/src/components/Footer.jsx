import logoDentarDevoto from '../assets/logo-dentar-devoto-2.png'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <img className="footer__logo" src={logoDentarDevoto} alt="Dentar Devoto" />
        <p>Dentar Odontología Integral — Sucursal Devoto</p>
        <p>Sanabria 3116, Piso 2, Depto C, Villa Devoto, CABA · Tel: 011-3970-5956</p>
      </div>
    </footer>
  )
}
