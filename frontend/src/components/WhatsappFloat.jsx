import { buildWhatsappLink } from '../lib/whatsapp.js'

export default function WhatsappFloat({ mensaje = 'Hola! Quiero consultar por un turno en Dentar Devoto' }) {
  return (
    <a className="wa-float" href={buildWhatsappLink(mensaje)} target="_blank" rel="noreferrer">
      Escribinos por WhatsApp
    </a>
  )
}
