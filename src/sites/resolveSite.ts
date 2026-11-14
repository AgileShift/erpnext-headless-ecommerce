import { clothingCenterConfig } from './clothing-center/config'
import { createFortechConfig } from './fortech/config'

export function resolveSite({ hostname, origin }: Pick<Location, 'hostname' | 'origin'>) {
  return hostname.toLowerCase().replace(/^www\./, '') === 'fortechni.com'
    ? createFortechConfig(origin)
    : clothingCenterConfig
}
