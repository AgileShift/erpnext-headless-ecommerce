import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from 'vue-router'

import CatalogView from '@/views/CatalogView.vue'
import ProductView from '@/views/ProductView.vue'
import SelectionView from '@/views/SelectionView.vue'
import URLBuilderView from '@/views/URLBuilderView.vue'

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
  routes: [
    { path: '/', name: 'Home', component: CatalogView, props: getFilterProps },
    { path: '/sale', name: 'Sale', component: CatalogView, props: getFilterProps },
    { path: '/category/:category', name: 'Category', component: CatalogView, props: getFilterProps },
    { path: '/product/:id(.*)', name: 'Product', component: ProductView, props: false },
    { path: '/selection', name: 'Selection', component: SelectionView },
    { path: '/url-builder', name: 'URLBuilder', component: URLBuilderView },
  ],
})

export default router
