import { buildWhatsappLink, MENSAJE_PEDIR_TURNO } from '../lib/whatsapp.js'
import iconoWhatsapp from '../assets/whatsapp.png'

export default function WhatsappFloat({ mensaje = MENSAJE_PEDIR_TURNO }) {
  return (
    <a className="wa-float" href={buildWhatsappLink(mensaje)} target="_blank" rel="noreferrer" aria-label="Escribinos por WhatsApp">
      <img src={iconoWhatsapp} alt="WhatsApp" />
    </a>
  )
}
