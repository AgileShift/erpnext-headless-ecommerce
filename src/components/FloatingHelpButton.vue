<template>
  <div v-if="visible" class="fixed bottom-5 left-4 z-30 md:left-6">
    <div
      v-if="open"
      class="mb-3 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-neutral-200 bg-white p-2 shadow-2xl"
    >
      <nav class="grid gap-1 text-sm text-neutral-700">
        <router-link
          v-for="link in helpLinks"
          :key="link.to"
          class="rounded-md px-3 py-2 hover:bg-neutral-100 hover:text-neutral-950"
          :to="link.to"
          @click="open = false"
        >
          {{ link.label }}
        </router-link>
      </nav>
    </div>

    <SfButton
      class="flex shadow-lg"
      size="sm"
      :aria-expanded="open"
      :aria-label="open ? 'Cerrar info' : 'Abrir info'"
      @click="open = !open"
    >
      <template #prefix>
        <SfIconCloseSm v-if="open" />
        <SfIconHelp v-else />
      </template>
      <template v-if="!open" #suffix>Info</template>
    </SfButton>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { SfButton, SfIconCloseSm, SfIconHelp } from '@storefront-ui/vue'

const route = useRoute()
const open = ref(false)
const hiddenRoutes = new Set([
  'Contact',
  'Terms',
  'Privacy',
  'Cookies',
  'Shipping',
  'Returns',
  'Payments',
  'SafeShopping',
])

const visible = computed(() => !hiddenRoutes.has(String(route.name || '')))

const helpLinks = [
  { to: '/contact', label: 'Contacto' },
  { to: '/safe-shopping', label: 'Compra segura' },
  { to: '/shipping', label: 'Envíos' },
  { to: '/payments', label: 'Formas de pago' },
  { to: '/returns', label: 'Cambios y devoluciones' },
  { to: '/terms', label: 'Términos y condiciones' },
]
</script>
