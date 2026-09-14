import { Link } from 'react-router-dom'
import { buildWhatsappLink, MENSAJE_PEDIR_TURNO } from '../lib/whatsapp.js'

export default function Home() {
  return (
    <>
      <section className="container hero">
        <div>
          <div className="hero__eyebrow">Dentar Devoto · Odontología Integral</div>
          <h1>Tu sonrisa, en manos de confianza.</h1>
          <p>
            Atención odontológica integral en Villa Devoto, parte de la red
            Dentar. Diagnóstico claro, tratamientos a tu ritmo y un equipo
            que te acompaña en cada etapa.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 28 }}>
            <a
              className="btn btn--primary"
              href={buildWhatsappLink(MENSAJE_PEDIR_TURNO)}
              target="_blank"
              rel="noreferrer"
            >
              Pedir turno
            </a>
            <Link className="btn btn--ghost" to="/servicios">Ver servicios</Link>
          </div>
        </div>
        <div className="hero__image" />
      </section>

      <section className="section container">
        <h2>Por qué elegirnos</h2>
        <div className="grid" style={{ marginTop: 32 }}>
          <div className="card">
            <h3>Equipo especializado</h3>
            <p>Profesionales matriculados en cada área de la odontología moderna.</p>
          </div>
          <div className="card">
            <h3>Tecnología actualizada</h3>
            <p>Equipamiento digital para diagnósticos más precisos y menos molestos.</p>
          </div>
          <div className="card">
            <h3>Trato cercano</h3>
            <p>Te explicamos cada paso del tratamiento antes de empezar.</p>
          </div>
        </div>
      </section>
    </>
  )
}
