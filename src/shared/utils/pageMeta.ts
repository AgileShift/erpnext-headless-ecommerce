import siteConfig from '@/config'

type PageMeta = {
  title: string
  description: string
  canonicalPath?: string
  imagePath?: string
  noIndex?: boolean
}

export const DEFAULT_META_DESCRIPTION = 'Catálogo en línea con precios y disponibilidad en tiempo real. Consultas y compras por canales autorizados.'

export const getProductMetaDescription = (itemName: string, price?: string) =>
  `${itemName} ${price ? `(${price}). ` : ''}Precios y disponibilidad en tiempo real. Consultas y compras por canales autorizados.`

export const getLegalDocumentMetaDescription = (title: string) =>
  `${title}. Información oficial sobre compras, atención y políticas de ${siteConfig.siteName}.`

const getAbsoluteUrl = (path = '/') => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${window.location.origin}${normalizedPath}`
}

const upsertMeta = (attribute: 'name' | 'property', key: string, content: string) => {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, key)
    document.head.appendChild(meta)
  }

  meta.content = content
}

const upsertCanonical = (href: string) => {
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }

  canonical.href = href
}

const upsertJsonLd = (data: unknown) => {
  let script = document.head.querySelector<HTMLScriptElement>('script[data-trust-jsonld="site"]')

  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-trust-jsonld', 'site')
    document.head.appendChild(script)
  }

  script.text = JSON.stringify(data).replace(/</g, '\\u003c')
}

const getSiteStructuredData = (canonicalUrl: string, imageUrl: string) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${window.location.origin}/#website`,
      name: siteConfig.siteName,
      url: window.location.origin,
      inLanguage: 'es',
    },
    {
      '@type': 'Store',
      '@id': `${window.location.origin}/#store`,
      name: siteConfig.siteName,
      url: window.location.origin,
      image: imageUrl,
      logo: imageUrl,
      email: siteConfig.contact.email,
      telephone: `+${siteConfig.contact.whatsApp}`,
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: siteConfig.contact.address,
        addressCountry: 'NI',
      },
      sameAs: [siteConfig.contact.socialLinks.instagram, siteConfig.contact.socialLinks.facebook],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: siteConfig.contact.email,
        telephone: `+${siteConfig.contact.whatsApp}`,
        availableLanguage: ['es'],
      },
    },
    {
      '@type': 'WebPage',
      '@id': canonicalUrl,
      url: canonicalUrl,
      name: document.title,
      isPartOf: {
        '@id': `${window.location.origin}/#website`,
      },
      about: {
        '@id': `${window.location.origin}/#store`,
      },
      inLanguage: 'es',
    },
  ],
})

export const setPageMeta = ({
  title,
  description,
  canonicalPath = window.location.pathname,
  imagePath,
  noIndex = false,
}: PageMeta) => {
  const fullTitle = title.includes(siteConfig.siteName) ? title : `${title} - ${siteConfig.siteName}`
  const canonicalUrl = getAbsoluteUrl(canonicalPath)
  const imageUrl = imagePath ? getAbsoluteUrl(imagePath) : getAbsoluteUrl(`/${siteConfig.siteLogo}`)

  document.title = fullTitle
  upsertCanonical(canonicalUrl)
  upsertMeta('name', 'description', description)
  upsertMeta('name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow')
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:locale', 'es_NI')
  upsertMeta('property', 'og:site_name', siteConfig.siteName)
  upsertMeta('property', 'og:title', fullTitle)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:url', canonicalUrl)
  upsertMeta('property', 'og:image', imageUrl)
  upsertJsonLd(getSiteStructuredData(canonicalUrl, imageUrl))
}
