import { resolveSite } from '@/sites/resolveSite'

const siteConfig = resolveSite(window.location)

export const usesCart = siteConfig.shoppingMode === 'cart'
export const selectionPath = usesCart ? '/cart' : '/selection'
export const selectionLabel = usesCart ? 'Carrito' : 'Mi selección'

export default siteConfig
