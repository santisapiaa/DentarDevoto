// Referencia: ficha odontológica real de Dentar Devoto. Numeración FDI.
export const TIPOS = ['estado_actual', 'tratamiento_realizado']

// Cada pieza se marca por superficie, como en la ficha de papel (el cuadrado dividido en 4).
export const SUPERFICIES = ['vestibular', 'palatino_lingual', 'mesial', 'distal']

export const PIEZAS_PERMANENTES_SUPERIORES = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
export const PIEZAS_PERMANENTES_INFERIORES = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
export const PIEZAS_LECHE_SUPERIORES = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65]
export const PIEZAS_LECHE_INFERIORES = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75]

export const PIEZAS_VALIDAS = [
  ...PIEZAS_PERMANENTES_SUPERIORES, ...PIEZAS_PERMANENTES_INFERIORES,
  ...PIEZAS_LECHE_SUPERIORES, ...PIEZAS_LECHE_INFERIORES,
]

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
