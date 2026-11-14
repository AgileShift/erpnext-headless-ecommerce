export const COLOR_SWATCHES: Record<string, string> = {
  amarillo: '#facc15',
  'aqua blue': '#22d3ee',
  azul: '#2563eb',
  'azul navy': '#111827',
  'azul oscuro': '#1e3a8a',
  beige: '#e7d6b6',
  blanco: '#ffffff',
  cafe: '#7c2d12',
  camel: '#c19a6b',
  celeste: '#7dd3fc',
  champagne: '#ead7aa',
  chocolate: '#5f2d1d',
  coral: '#fb7185',
  crema: '#f5e9d4',
  dorado: '#d4af37',
  fucsia: '#d946ef',
  gris: '#9ca3af',
  'hunter green': '#355e3b',
  jaguar: '#8b5e34',
  khaki: '#b8a77a',
  kiwi: '#84cc16',
  lila: '#c4b5fd',
  mocha: '#8b6f5a',
  morado: '#7e22ce',
  mostaza: '#ca8a04',
  naranja: '#fb923c',
  negro: '#171717',
  'olivo pastel': '#b8b98f',
  plateado: '#c0c0c0',
  rojo: '#dc2626',
  'rojo vino': '#7f1230',
  rosa: '#f9a8d4',
  'rosa viejo': '#c47f8d',
  rosado: '#f9a8d4',
  'rosado pastel': '#fbcfe8',
  'rose gold': '#b76e79',
  salmon: '#fb8f7a',
  terracota: '#c65d3a',
  turquesa: '#14b8a6',
  verde: '#16a34a',
  'verde menta': '#86efac',
  'verde olivo': '#708238',
  'verde oscuro': '#166534',
  'verde pastel': '#bbf7d0',
}

export const normalizeColorName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')

export const getColorSwatch = (value: string) =>
  COLOR_SWATCHES[normalizeColorName(value)] || '#e5e7eb'
