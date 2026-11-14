import { clothingCenterConfig } from './sites/clothing-center/config'
import { fortechConfig } from './sites/fortech/config'

const sites = [clothingCenterConfig, fortechConfig]

export function resolveSite(hostname: string) {
  const domain = hostname.toLowerCase().replace(/^www\./, '')
  return sites.find((site) => new URL(site.contact.website).hostname === domain) ?? clothingCenterConfig
}

export default resolveSite(window.location.hostname)
