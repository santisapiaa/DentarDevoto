import { buildWhatsappLink } from '../lib/whatsapp.js'

export default function Contacto() {
  return (
    <section className="section container">
      <h1>Contacto</h1>
      <p>Escribinos por WhatsApp para coordinar tu turno o hacer una consulta.</p>
      <div className="grid" style={{ marginTop: 32 }}>
        <div className="card">
          <h3>Dirección</h3>
          <p>Sanabria 3116, Piso 2, Depto C<br />Villa Devoto, Capital Federal</p>
        </div>
        <div className="card">
          <h3>Teléfono</h3>
          <p>011-3970-5956</p>
        </div>
        <div className="card">
          <h3>Mail</h3>
          <p>dentardevoto@gmail.com</p>
        </div>
      </div>
      <a
        className="btn btn--primary"
        style={{ marginTop: 32 }}
        href={buildWhatsappLink('Hola! Quiero hacer una consulta')}
        target="_blank"
        rel="noreferrer"
      >
        Escribir por WhatsApp
      </a>

      <div style={{ marginTop: 40, border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
        <iframe
          title="Ubicación Dentar Devoto"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.8390397012936!2d-58.51142828558589!3d-34.60823148045835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb7d34929df69%3A0x452166e1f8db14c2!2sSanabria%203116%2C%20C1417%20CABA!5e0!3m2!1ses!2sar!4v1586699095819!5m2!1ses!2sar"
          width="100%"
          height="320"
          style={{ border: 0, display: 'block' }}
          loading="lazy"
        />
      </div>
    </section>
  )
}
