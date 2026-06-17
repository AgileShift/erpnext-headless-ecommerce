import siteConfig from '@/config'

export const legalDocumentRoutes = [
  { key: 'safeShopping', path: '/safe-shopping', label: 'Compra Segura', showInHelpButton: true },
  { key: 'shipping', path: '/shipping', label: 'Envíos', showInHelpButton: true },
  { key: 'payments', path: '/payments', label: 'Formas de Pago', showInHelpButton: true },
  { key: 'returns', path: '/returns', label: 'Cambios y Devoluciones', showInHelpButton: true },
  { key: 'terms', path: '/terms', label: 'Términos y Condiciones', showInHelpButton: true },
  { key: 'privacy', path: '/privacy', label: 'Política de Privacidad', showInHelpButton: false },
  { key: 'cookies', path: '/cookies', label: 'Política de Cookies', showInHelpButton: false },
] as const

export type LegalDocumentKey = (typeof legalDocumentRoutes)[number]['key']

export const getEnabledLegalDocumentRoutes = () =>
  legalDocumentRoutes.filter((documentRoute) => siteConfig.wiki.documents[documentRoute.key])

export const getHelpLegalDocumentRoutes = () =>
  getEnabledLegalDocumentRoutes().filter((documentRoute) => documentRoute.showInHelpButton)

export const getLegalDocumentLabel = (key: LegalDocumentKey) =>
  legalDocumentRoutes.find((documentRoute) => documentRoute.key === key)?.label || key
