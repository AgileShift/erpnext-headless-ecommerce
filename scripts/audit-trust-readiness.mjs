import { access, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))

const requiredHeaders = [
  'Content-Security-Policy',
  'Strict-Transport-Security',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'X-Frame-Options',
  'X-XSS-Protection',
  'Cross-Origin-Opener-Policy',
  'X-Permitted-Cross-Domain-Policies',
]

const checks = []

const addCheck = (name, passed, details = '') => {
  checks.push({ name, passed, details })
}

const fileExists = async (path) => {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

const readText = async (relativePath) => readFile(join(rootDir, relativePath), 'utf8')
const includesAll = (text, snippets) => snippets.every((snippet) => text.includes(snippet))

const checkPublicFiles = async () => {
  const files = [
    'public/robots.txt',
    'public/sitemap-clothing.xml',
    'public/sitemap-fortech.xml',
    'public/.well-known/security.txt',
    'staticwebapp.config.json',
  ]

  for (const file of files) {
    addCheck(`${file} exists`, await fileExists(join(rootDir, file)))
  }

  const robots = await readText('public/robots.txt')
  addCheck(
    'robots.txt points to both sitemaps',
    includesAll(robots, ['sitemap-clothing.xml', 'sitemap-fortech.xml']),
  )

  const securityTxt = await readText('public/.well-known/security.txt')
  addCheck(
    'security.txt exposes contact and policy',
    includesAll(securityTxt, ['Contact: mailto:', 'Policy:', 'Expires:']),
  )
  addCheck(
    'security.txt links each brand to its own policy',
    includesAll(securityTxt, [
      'Contact: mailto:contacto@clothingcenterni.com',
      'Policy: https://clothingcenterni.com/safe-shopping',
      'Contact: mailto:ventas@fortechni.com',
      'Policy: https://fortechni.com/safe-shopping',
    ]),
  )

  const expires = securityTxt.match(/^Expires:\s*(.+)$/m)?.[1]
  const expiresTime = expires ? Date.parse(expires) : Number.NaN
  const oneYearFromNow = Date.now() + 365 * 24 * 60 * 60 * 1000
  addCheck(
    'security.txt expires in less than one year',
    Number.isFinite(expiresTime) && expiresTime > Date.now() && expiresTime < oneYearFromNow,
    expires || 'missing Expires',
  )
}

const checkAzureConfig = async () => {
  const staticWebApp = JSON.parse(await readText('staticwebapp.config.json'))
  addCheck('staticwebapp uses SPA fallback only', staticWebApp.navigationFallback?.rewrite === '/index.html')

  for (const header of requiredHeaders) {
    addCheck(`staticwebapp header ${header}`, Boolean(staticWebApp.globalHeaders?.[header]))
  }

  const csp = staticWebApp.globalHeaders?.['Content-Security-Policy'] || ''
  addCheck(
    'CSP allows APIs, Wiki and Google tags',
    includesAll(csp, [
      "default-src 'self'",
      'https://erp.clothingcenterni.com',
      'https://erp.fortechni.com',
      'https://erp.gruporeal.org',
      'https://www.googletagmanager.com',
      "object-src 'none'",
      "frame-ancestors 'none'",
    ]),
  )
  addCheck('X-Frame-Options is DENY', staticWebApp.globalHeaders?.['X-Frame-Options'] === 'DENY')
  addCheck('X-XSS-Protection is disabled', staticWebApp.globalHeaders?.['X-XSS-Protection'] === '0')
}

const checkRuntimeTrustCode = async () => {
  const indexHtml = await readText('index.html')
  addCheck(
    'Static HTML exposes explicit Open Graph image',
    includesAll(indexHtml, ['property="og:image"', 'social-preview.svg', 'og:image:width', 'og:image:height']),
  )

  addCheck('No local legal document fallback file', !(await fileExists(join(rootDir, 'src/content/legalDocuments.ts'))))

  const main = await readText('src/main.ts')
  addCheck(
    'vue-gtag uses manual consent initialization',
    includesAll(main, ['createGtag({', "initMode: 'manual'", 'pageTracker:', 'router']) &&
      !main.includes('initializeConsentMode'),
  )

  const cookieBanner = await readText('src/shared/components/CookieConsentBanner.vue')
  addCheck(
    'Cookie banner updates vue-gtag consent without page reload',
    includesAll(cookieBanner, ['acceptAnalyticsConsent', 'rejectAnalyticsConsent']) &&
      !cookieBanner.includes('useConsent') &&
      !cookieBanner.includes('acceptAll') &&
      !cookieBanner.includes('rejectAll'),
  )

  const consentMode = await readText('src/shared/utils/consentMode.ts')
  addCheck(
    'Stored consent uses vue-gtag helpers and cookie preference',
    includesAll(consentMode, ['addGtag', 'consentGrantedAll', 'consentDeniedAll']) &&
      !consentMode.includes('window.gtag') &&
      !consentMode.includes('dataLayer') &&
      includesAll(consentMode, ['document.cookie', 'Max-Age', 'SameSite=Lax']) &&
      !consentMode.includes('localStorage') &&
      !consentMode.includes('window.location.reload'),
  )

  const legalView = await readText('src/features/content/pages/LegalDocumentView.vue')
  addCheck(
    'Wiki rendered content is sanitized',
    includesAll(legalView, ['DOMPurify.sanitize', 'rendered_content', 'v-html']),
  )
  addCheck(
    'Wiki privacy flags are enforced',
    includesAll(legalView, ['is_published !== 1', 'is_private === 1']),
  )
  addCheck(
    'Legal view has no local fallback content',
    !legalView.includes('fallbackDocument') &&
      !legalView.includes('versión local') &&
      !legalView.includes('respaldo'),
  )

  const legalDocuments = await readText('src/router/legalRoutes.ts')
  addCheck(
    'Legal routes are driven by configured Wiki documents',
    includesAll(legalDocuments, ['siteConfig.wiki.documents', 'getEnabledLegalDocumentRoutes']),
  )

  const pageMeta = await readText('src/shared/utils/pageMeta.ts')
  addCheck(
    'Runtime meta includes trust JSON-LD',
    includesAll(pageMeta, ['application/ld+json', 'data-trust-jsonld', 'https://schema.org', "'@type': 'Store'", "'@type': 'ContactPoint'"]),
  )

  const footer = await readText('src/shared/components/TheFooter.vue')
  addCheck(
    'Footer renders configured legal/trust routes',
    includesAll(footer, ['getEnabledLegalDocumentRoutes', 'v-for="documentRoute in legalLinks"', 'to="/contact"']),
  )

  const navbar = await readText('src/shared/components/TheNavbar.vue')
  addCheck(
    'Navbar keeps trust links out of main navigation',
    !includesAll(navbar, ['safeShoppingRoute', 'contactRoute', "path: '/contact'"]),
  )

  const floatingHelp = await readText('src/shared/components/FloatingHelpButton.vue')
  const helpRoutes = await readText('src/router/legalRoutes.ts')
  addCheck(
    'Floating info exposes buyer trust routes',
    includesAll(floatingHelp, ["to: '/contact'", 'getHelpLegalDocumentRoutes']) &&
      includesAll(helpRoutes, [
        "path: '/shipping'",
        "path: '/safe-shopping'",
        "path: '/payments'",
        "path: '/returns'",
        "path: '/terms'",
        'showInHelpButton: true',
        'showInHelpButton: false',
      ]),
  )

  const contactView = await readText('src/features/content/pages/ContactView.vue')
  const contactLinks = await readText('src/shared/utils/contactLinks.ts')
  addCheck(
    'Contact page renders site config contact data',
    includesAll(contactView, ['contactLinks', 'socialLinks', 'siteConfig.contact.whatsApp', 'siteConfig.contact.businessHours']) &&
      includesAll(contactLinks, ['siteConfig.contact.email', 'siteConfig.contact.whatsApp', 'siteConfig.contact.googleMaps', 'siteConfig.contact.socialLinks']),
  )

  const selectionView = await readText('src/features/cart/pages/CartView.vue')
  addCheck(
    'Cart limits checkout preview to development',
    includesAll(selectionView, [
      'import.meta.env.DEV',
      'v-if="showCheckoutPreview"',
      'Probar proceso de compra',
      'Confirmamos disponibilidad, entrega y pago por WhatsApp.',
    ]),
  )
}

const checkStaticBuild = async () => {
  const distExists = await fileExists(join(rootDir, 'dist/index.html'))
  addCheck('dist exists after build', distExists, 'Run npm run build before this audit.')

  if (!distExists) {
    return
  }
}

const checkPackageScripts = async () => {
  const pkg = JSON.parse(await readText('package.json'))
  addCheck('package has no postbuild-only fallback generator', !pkg.scripts?.['postbuild-only'])
  addCheck(
    'package has no static legal fallback generator file',
    !(await fileExists(join(rootDir, 'scripts/generate-static-legal-pages.mjs'))),
  )
  addCheck('package has audit:trust script', pkg.scripts?.['audit:trust'] === 'node scripts/audit-trust-readiness.mjs')
  addCheck('package has audit:trust:live script', pkg.scripts?.['audit:trust:live'] === 'node scripts/audit-live-trust.mjs')
  addCheck('dompurify dependency is installed', Boolean(pkg.dependencies?.dompurify))
}

await checkPackageScripts()
await checkPublicFiles()
await checkAzureConfig()
await checkRuntimeTrustCode()
await checkStaticBuild()

const failures = checks.filter((check) => !check.passed)

for (const check of checks) {
  const status = check.passed ? 'PASS' : 'FAIL'
  console.log(`${status} ${check.name}${check.details ? ` - ${check.details}` : ''}`)
}

if (failures.length) {
  console.error(`\nTrust audit failed: ${failures.length} issue(s).`)
  process.exit(1)
}

console.log(`\nTrust audit passed: ${checks.length} checks.`)
