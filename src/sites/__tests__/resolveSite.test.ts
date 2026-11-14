import { describe, expect, it } from 'vitest'
import { resolveSite } from '../resolveSite'

describe('site selection', () => {
  it.each(['fortechni.com', 'www.fortechni.com', 'WWW.FORTECHNI.COM'])(
    'keeps the ForTech selection flow for %s',
    (hostname) => {
      const origin = `https://${hostname}`
      const site = resolveSite({ hostname, origin })

      expect(site.id).toBe('fortech')
      expect(site.shoppingMode).toBe('selection')
      expect(site.apiBaseUrl).toBe('https://erp.fortechni.com')
      expect(site.contact.website).toBe(origin)
    },
  )

  it.each(['clothingcenterni.com', 'www.clothingcenterni.com', 'localhost', 'unknown.test'])(
    'uses the Clothing Center cart for %s',
    (hostname) => {
      const site = resolveSite({ hostname, origin: `https://${hostname}` })

      expect(site.id).toBe('clothing-center')
      expect(site.shoppingMode).toBe('cart')
    },
  )
})
