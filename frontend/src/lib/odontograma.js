// Referencia: ficha odontológica real de Dentar Devoto. Numeración FDI.
export const PIEZAS_PERMANENTES_SUPERIORES = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
export const PIEZAS_PERMANENTES_INFERIORES = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
export const PIEZAS_LECHE_SUPERIORES = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65]
export const PIEZAS_LECHE_INFERIORES = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75]

// Cada pieza se marca por superficie, como el cuadrado dividido en 4 de la ficha de papel.
export const SUPERFICIES = [
  { key: 'vestibular', label: 'Vestibular' },
  { key: 'palatino_lingual', label: 'Palatino / lingual' },
  { key: 'mesial', label: 'Mesial' },
  { key: 'distal', label: 'Distal' },
]

export const CONDICIONES = [
  { key: 'ausente', label: 'Diente ausente', abrev: 'X', color: '#9AA5AD' },
  { key: 'extraccion', label: 'Extracción', abrev: 'Ext', color: '#B3413A' },
  { key: 'conducto_terminado', label: 'Conducto terminado', abrev: 'TC', color: '#0A5A96' },
  { key: 'obturacion_composite', label: 'Obturación composite', abrev: 'OC', color: '#14A8DA' },
  { key: 'obturacion_amalgama', label: 'Obturación amalgama', abrev: 'OA', color: '#5C6B73' },
  { key: 'pendiente', label: 'Pendiente', abrev: 'Pdte', color: '#D9A441' },
  { key: 'corona', label: 'Corona', abrev: 'Cor', color: '#8E6C3A' },
  { key: 'protesis_provisoria', label: 'Prótesis provisoria', abrev: 'PP', color: '#A87CA0' },
  { key: 'incrustacion', label: 'Incrustación', abrev: 'Inc', color: '#5C8A72' },
  { key: 'puente', label: 'Puente', abrev: 'Pte', color: '#3A7D8C' },
  { key: 'protesis_removible', label: 'Prótesis removible', abrev: 'PR', color: '#7A5C99' },
  { key: 'implante', label: 'Implante', abrev: 'Imp', color: '#2D6A4F' },
  { key: 'ortodoncia', label: 'Ortodoncia', abrev: 'Ort', color: '#BF7E2B' },
  { key: 'caries_curable', label: 'Caries curable', abrev: 'CC', color: '#E0B84B' },
  { key: 'caries_incurable', label: 'Caries incurable', abrev: 'CI', color: '#8A2E26' },
  { key: 'sellador', label: 'Sellador de silicona', abrev: 'Sel', color: '#6FA8B5' },
  { key: 'protesis_esqueletica', label: 'Prótesis esquelética', abrev: 'PE', color: '#9C6B4E' },
  { key: 'protesis_total', label: 'Prótesis total', abrev: 'PT', color: '#5E4B8C' },
]

export function condicionPorKey(key) {
  return CONDICIONES.find((c) => c.key === key)
}
