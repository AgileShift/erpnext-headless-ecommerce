import type { RouteRecordRaw } from 'vue-router'
// These pages have no production authentication or commerce backend yet.
export const previewRoutes: RouteRecordRaw[] =
  import.meta.env.DEV
    ? [
        {
          path: '/account',
          name: 'AccountAccess',
          component: () => import('@/features/account/pages/AccountAccessView.vue'),
        },
        {
          path: '/account/profile',
          name: 'Profile',
          component: () => import('@/features/account/pages/ProfileView.vue'),
        },
        {
          path: '/account/addresses',
          name: 'Addresses',
          component: () => import('@/features/account/pages/AddressesView.vue'),
        },
        {
          path: '/account/orders',
          name: 'Orders',
          component: () => import('@/features/orders/pages/OrdersView.vue'),
        },
        {
          path: '/account/orders/:id',
          name: 'OrderDetail',
          component: () => import('@/features/orders/pages/OrderDetailView.vue'),
        },
        {
          path: '/checkout',
          name: 'Checkout',
          component: () => import('@/features/checkout/pages/CheckoutView.vue'),
        },
      ]
    : []
