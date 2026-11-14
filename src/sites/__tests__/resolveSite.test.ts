import { describe, expect, it } from 'vitest'
import { resolveSite } from '../../config'

describe('site selection', () => {
  it.each(['fortechni.com', 'www.fortechni.com', 'WWW.FORTECHNI.COM'])(
    'resolves ForTech for %s',
    (hostname) => {
      const site = resolveSite(hostname)

      expect(site.id).toBe('fortech')
      expect(site.apiBaseUrl).toBe('https://erp.fortechni.com')
      expect(site.contact.website).toBe('https://fortechni.com')
    },
  )

  it.each(['clothingcenterni.com', 'www.clothingcenterni.com', 'localhost', 'unknown.test'])(
    'resolves Clothing Center for %s',
    (hostname) => {
      const site = resolveSite(hostname)

      expect(site.id).toBe('clothing-center')
    },
  )
})
