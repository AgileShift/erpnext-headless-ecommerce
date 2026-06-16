import siteConfig from '@/config'

export const legalDocumentRoutes = [
  { key: 'terms', path: '/terms', name: 'Terms', label: 'Términos y condiciones' },
  { key: 'privacy', path: '/privacy', name: 'Privacy', label: 'Política de privacidad' },
  { key: 'cookies', path: '/cookies', name: 'Cookies', label: 'Política de cookies' },
  { key: 'shipping', path: '/shipping', name: 'Shipping', label: 'Política de envíos' },
  { key: 'returns', path: '/returns', name: 'Returns', label: 'Cambios y devoluciones' },
  { key: 'payments', path: '/payments', name: 'Payments', label: 'Formas de pago' },
  { key: 'safeShopping', path: '/safe-shopping', name: 'SafeShopping', label: 'Compra segura' },
] as const

export type LegalDocumentKey = (typeof legalDocumentRoutes)[number]['key']

export const getEnabledLegalDocumentRoutes = () =>
  legalDocumentRoutes.filter((documentRoute) => siteConfig.wiki.documents[documentRoute.key])

export const getLegalDocumentLabel = (key: LegalDocumentKey) =>
  legalDocumentRoutes.find((documentRoute) => documentRoute.key === key)?.label || key
