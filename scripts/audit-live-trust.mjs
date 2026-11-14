const requiredHeaders = [
  'content-security-policy',
  'strict-transport-security',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
  'x-frame-options',
  'cross-origin-opener-policy',
  'x-permitted-cross-domain-policies',
]

const args = process.argv.slice(2)
const urlArgIndex = args.findIndex((arg) => arg === '--url')
const baseUrl =
  urlArgIndex > -1 && args[urlArgIndex + 1]
    ? args[urlArgIndex + 1]
    : process.env.TRUST_AUDIT_BASE_URL || 'https://clothingcenterni.com'
const base = new URL(baseUrl)
const legalDocumentRoutes = [
  ['terms', 'terms'],
  ['privacy', 'privacy'],
  ['cookies', 'cookies'],
  ['shipping', 'shipping'],
  ['returns', 'returns'],
  ['payments', 'payments'],
  ['safeShopping', 'safe-shopping'],
]
const contactRoute = 'contact'
const wikiConfigs = {
  'fortechni.com': {
    baseUrl: 'https://erp.gruporeal.org',
    routePrefix: 'fortech',
    documents: {
      terms: 'terminos-y-condiciones',
      privacy: 'politica-de-privacidad',
      cookies: 'cookies',
      shipping: 'envios',
      returns: 'cambios-y-devoluciones',
      payments: 'pagos',
      safeShopping: 'compra-segura',
    },
  },
  'clothingcenterni.com': {
    baseUrl: 'https://erp.gruporeal.org',
    routePrefix: 'clothing-ecommerce',
    documents: {
      terms: 'legal/terminos-y-condiciones',
      privacy: 'legal/politica-de-privacidad',
      cookies: 'legal/politica-de-cookies',
      shipping: 'politica-de-envios',
      returns: 'cambios-y-devoluciones',
      payments: 'formas-de-pago',
      safeShopping: 'compra-segura',
    },
  },
}
const hostname = base.hostname.replace('www.', '')
const wikiConfig = wikiConfigs[hostname] || wikiConfigs['clothingcenterni.com']
const legalRoutes = legalDocumentRoutes
  .filter(([key]) => wikiConfig.documents[key])
  .map(([, route]) => route)
const wikiRoutes = Object.values(wikiConfig.documents).map((documentSlug) =>
  [wikiConfig.routePrefix, documentSlug].filter(Boolean).join('/'),
)
const checks = []

const addCheck = (name, passed, details = '') => {
  checks.push({ name, passed, details })
}

const getUrl = (path = '/') => new URL(path, base).toString()

const safeFetch = async (path, options = {}) => {
  try {
    const response = await fetch(getUrl(path), {
      redirect: 'follow',
      headers: {
        'User-Agent': 'trust-readiness-audit/1.0',
        ...options.headers,
      },
      ...options,
    })

    return {
      response,
      text: options.method === 'HEAD' ? '' : await response.text(),
      error: '',
    }
  } catch (error) {
    return {
      response: null,
      text: '',
      error: error instanceof Error ? error.message : 'fetch failed',
    }
  }
}

const fetchText = async (path) => {
  return safeFetch(path)
}

const includesAll = (text, snippets) => snippets.every((snippet) => text.includes(snippet))

const checkHomeHeaders = async () => {
  const result = await safeFetch('/', {
    method: 'HEAD',
  })
  const response = result.response

  addCheck(
    'home responds 2xx/3xx',
    Boolean(response && response.status >= 200 && response.status < 400),
    response ? `${response.status}` : result.error,
  )

  if (!response) {
    for (const header of requiredHeaders) {
      addCheck(`live header ${header}`, false, result.error)
    }
    addCheck('live CSP contains frame-ancestors none', false, result.error)
    addCheck('live X-Frame-Options is DENY', false, result.error)
    addCheck('live X-Content-Type-Options is nosniff', false, result.error)
    return
  }

  for (const header of requiredHeaders) {
    addCheck(`live header ${header}`, response.headers.has(header))
  }

  const csp = response.headers.get('content-security-policy') || ''
  addCheck('live CSP contains frame-ancestors none', csp.includes("frame-ancestors 'none'"))
  addCheck('live X-Frame-Options is DENY', response.headers.get('x-frame-options') === 'DENY')
  addCheck('live X-Content-Type-Options is nosniff', response.headers.get('x-content-type-options') === 'nosniff')
}

const checkPublicFiles = async () => {
  const robots = await fetchText('/robots.txt')
  addCheck(
    'live robots.txt responds 200',
    robots.response?.status === 200,
    robots.response ? `${robots.response.status}` : robots.error,
  )
  addCheck(
    'live robots.txt links sitemaps',
    includesAll(robots.text, ['sitemap-clothing.xml', 'sitemap-fortech.xml']),
  )

  const sitemap = await fetchText('/sitemap-clothing.xml')
  addCheck(
    'live clothing sitemap responds 200',
    sitemap.response?.status === 200,
    sitemap.response ? `${sitemap.response.status}` : sitemap.error,
  )
  addCheck('live clothing sitemap links legal pages', legalRoutes.every((route) => sitemap.text.includes(`/${route}`)))
  addCheck('live clothing sitemap links contact page', sitemap.text.includes(`/${contactRoute}`))

  const security = await fetchText('/.well-known/security.txt')
  addCheck(
    'live security.txt responds 200',
    security.response?.status === 200,
    security.response ? `${security.response.status}` : security.error,
  )
  addCheck(
    'live security.txt exposes contact and policy',
    includesAll(security.text, ['Contact: mailto:', 'Policy:', 'Expires:']),
  )
}

const checkLegalPages = async () => {
  for (const route of legalRoutes) {
    const page = await fetchText(`/${route}`)
    addCheck(
      `live /${route} responds 200`,
      page.response?.status === 200,
      page.response ? `${page.response.status}` : page.error,
    )
  }

  const contactPage = await fetchText(`/${contactRoute}`)
  addCheck(
    `live /${contactRoute} responds 200`,
    contactPage.response?.status === 200,
    contactPage.response ? `${contactPage.response.status}` : contactPage.error,
  )
}

const checkWikiEndpoint = async () => {
  for (const route of wikiRoutes) {
    const endpoint =
      `${wikiConfig.baseUrl}/api/method/wiki.frappe_wiki.doctype.wiki_document.wiki_document.get_page_data` +
      `?route=${encodeURIComponent(route)}`
    let response

    try {
      response = await fetch(endpoint, {
        headers: {
          'User-Agent': 'trust-readiness-audit/1.0',
        },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'fetch failed'
      addCheck(`Wiki ${route} responds 200`, false, message)
      continue
    }

    addCheck(`Wiki ${route} responds 200`, response.status === 200, `${response.status}`)

    if (!response.ok) {
      continue
    }

    const data = await response.json()
    const page = data.message
    addCheck(`Wiki ${route} is published`, page?.doc?.is_published === 1)
    addCheck(`Wiki ${route} is public`, page?.doc?.is_private !== 1)
    addCheck(`Wiki ${route} has rendered content`, Boolean(page?.rendered_content))
  }
}

await checkHomeHeaders()
await checkPublicFiles()
await checkLegalPages()
await checkWikiEndpoint()

const failures = checks.filter((check) => !check.passed)

console.log(`Trust live audit target: ${base.origin}`)
for (const check of checks) {
  const status = check.passed ? 'PASS' : 'FAIL'
  console.log(`${status} ${check.name}${check.details ? ` - ${check.details}` : ''}`)
}

if (failures.length) {
  console.error(`\nLive trust audit failed: ${failures.length} issue(s).`)
  process.exit(1)
}

console.log(`\nLive trust audit passed: ${checks.length} checks.`)
