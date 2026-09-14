// Teléfono de Dentar Devoto: 011-3970-5956.
// TODO: confirmar si este número tiene WhatsApp activo o si conviene usar otro dedicado.
export const WHATSAPP_NUMBER = '5491139705956'

export function buildWhatsappLink(mensaje) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`
}
