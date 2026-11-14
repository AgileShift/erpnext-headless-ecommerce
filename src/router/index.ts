import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from 'vue-router'

import CatalogView from '@/features/catalog/pages/CatalogView.vue'
import ContactView from '@/features/content/pages/ContactView.vue'
import LegalDocumentView from '@/features/content/pages/LegalDocumentView.vue'
import ProductView from '@/features/catalog/pages/ProductView.vue'
import SelectionView from '@/features/cart/pages/CartView.vue'
import URLBuilderView from '@/features/tools/pages/URLBuilderView.vue'
import { getEnabledLegalDocumentRoutes } from '@/router/legalRoutes'

const getQueryValues = (value: RouteLocationNormalizedLoaded['query'][string]) => {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
  }

  return typeof value === 'string' && value.length > 0 ? [value] : []
}

const getFilterProps = (route: RouteLocationNormalizedLoaded) => ({
  category:
    typeof route.params.category === 'string' ? [route.params.category] : getQueryValues(route.query.category),
  sale: route.path === '/sale' || route.query.sale === '1',
  size: getQueryValues(route.query.size),
  color: getQueryValues(route.query.color),
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 }
  },
  routes: [
    { path: '/', name: 'Home', component: CatalogView, props: getFilterProps },
    { path: '/sale', name: 'Sale', component: CatalogView, props: getFilterProps },
    { path: '/category/:category', name: 'Category', component: CatalogView, props: getFilterProps },
    { path: '/contact', alias: '/contacto', name: 'Contact', component: ContactView },
    ...getEnabledLegalDocumentRoutes().map((documentRoute) => ({
      path: documentRoute.path,
      name: documentRoute.path,
      component: LegalDocumentView,
      props: { docKey: documentRoute.key },
      meta: { legalDocument: true },
    })),
    { path: '/product/:id(.*)', name: 'Product', component: ProductView, props: false },
    {
      path: '/cart',
      alias: '/selection',
      name: 'Selection',
      component: SelectionView,
    },
    { path: '/url-builder', name: 'URLBuilder', component: URLBuilderView },
  ],
})

export default router
