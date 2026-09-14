// WhatsApp dedicado de Dentar Devoto para turnos y consultas: 11 2789-0856.
// El teléfono de línea (011-3970-5956) es otro número, se muestra aparte en /contacto.
export const WHATSAPP_NUMBER = '5491127890856'

export function buildWhatsappLink(mensaje) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`
}
