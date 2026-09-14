import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section container">
      <h1>Página no encontrada</h1>
      <p>La página que buscás no existe o cambió de dirección.</p>
      <Link className="btn btn--primary" to="/">Volver al inicio</Link>
    </section>
  )
}
