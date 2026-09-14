// WhatsApp dedicado de Dentar Devoto para turnos y consultas: 11 2789-0856.
// El teléfono de línea (011-3970-5956) es otro número, se muestra aparte en /contacto.
export const WHATSAPP_NUMBER = '5491127890856'

// El cliente completa los corchetes antes de enviar.
export const MENSAJE_PEDIR_TURNO = 'Hola! Mi nombre es [tu nombre] y quería consultar por un turno para [tratamiento o consulta].'

export function buildWhatsappLink(mensaje) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`
}
