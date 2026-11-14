import { clothingCenterConfig } from './sites/clothing-center/config'
import { createFortechConfig } from './sites/fortech/config'

export function resolveSite({ hostname, origin }: Pick<Location, 'hostname' | 'origin'>) {
  return hostname.toLowerCase().replace(/^www\./, '') === 'fortechni.com'
    ? createFortechConfig(origin)
    : clothingCenterConfig
}

export default resolveSite(window.location)
