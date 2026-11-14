import { addGtag, consentDeniedAll, consentGrantedAll } from 'vue-gtag'

export type ConsentPreference = 'accepted' | 'rejected'

const CONSENT_COOKIE_NAME = 'cookie-consent-preference'
const CONSENT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180

const getCookieValue = (name: string) =>
  document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=')

const hasGoogleTagScript = () => Boolean(document.querySelector('script[src*="googletagmanager.com/gtag/js"]'))

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`
  document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${window.location.hostname}; SameSite=Lax`
}

const deleteAnalyticsCookies = () => {
  document.cookie
    .split(';')
    .map((cookie) => cookie.trim().split('=')[0])
    .filter((name) => name.startsWith('_ga'))
    .forEach(deleteCookie)
}

export const getConsentPreference = (): ConsentPreference | null => {
  const preference = getCookieValue(CONSENT_COOKIE_NAME)

  return preference === 'accepted' || preference === 'rejected' ? preference : null
}

export const saveConsentPreference = (preference: ConsentPreference) => {
  const secureAttribute = window.location.protocol === 'https:' ? '; Secure' : ''

  document.cookie = `${CONSENT_COOKIE_NAME}=${preference}; Max-Age=${CONSENT_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secureAttribute}`
}

export const acceptAnalyticsConsent = async () => {
  saveConsentPreference('accepted')

  if (!hasGoogleTagScript()) {
    await addGtag()
  }

  consentGrantedAll('update')
}

export const rejectAnalyticsConsent = () => {
  saveConsentPreference('rejected')
  consentDeniedAll('update')
  deleteAnalyticsCookies()
}

export const applyStoredConsentPreference = async () => {
  const preference = getConsentPreference()

  if (preference === 'accepted') {
    await acceptAnalyticsConsent()
  }

  if (preference === 'rejected') {
    rejectAnalyticsConsent()
  }

  return preference
}
