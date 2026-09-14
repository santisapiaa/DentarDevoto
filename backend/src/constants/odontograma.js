// Referencia: ficha odontológica en papel de Dentar. Numeración FDI de piezas permanentes.
export const TIPOS = ['estado_actual', 'tratamiento_realizado']

export const PIEZAS_SUPERIORES = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
export const PIEZAS_INFERIORES = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
export const PIEZAS_VALIDAS = [...PIEZAS_SUPERIORES, ...PIEZAS_INFERIORES]

export const CONDICIONES = [
  'ausente',
  'extraccion',
  'conducto_terminado',
  'obturacion_composite',
  'obturacion_amalgama',
  'pendiente',
  'corona',
  'protesis_provisoria',
  'incrustacion',
  'puente',
  'protesis_removible',
  'implante',
  'ortodoncia',
  'caries_curable',
  'caries_incurable',
  'sellador',
  'protesis_esqueletica',
  'protesis_total',
]
