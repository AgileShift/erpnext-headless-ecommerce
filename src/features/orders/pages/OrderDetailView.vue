<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { SfButton } from '@storefront-ui/vue'
import AccountLayout from '@/features/account/components/AccountLayout.vue'
import { previewOrders } from '../data/previewOrders'
const route = useRoute()
const order = computed(() => previewOrders.find((order) => order.id === route.params.id))
</script>
<template>
  <AccountLayout :title="order ? 'Detalle del pedido' : 'Pedido no encontrado'">
    <template v-if="order">
      <div class="rounded-xl border border-neutral-200 p-6">
        <div class="flex flex-wrap justify-between gap-3">
          <h2 class="font-semibold">{{ order.id }}</h2>
          <span class="text-amber-900">{{ order.status }}</span>
        </div>
        <ul class="my-6 divide-y divide-neutral-200">
          <li v-for="line in order.lines" :key="line.name" class="py-4">
            <p>{{ line.name }}</p>
            <p class="mt-2 text-sm">
              {{ line.quantity }} unidades · C$ {{ (line.nio * line.quantity).toFixed(2) }} | US$
              {{ (line.usd * line.quantity).toFixed(2) }}
            </p>
          </li>
        </ul>
        <h3 class="font-semibold">Entrega</h3>
        <p class="mt-2">{{ order.delivery }}</p>
        <p class="mt-5 text-sm text-neutral-600">
          Este ejemplo no tiene pagos ni documentos descargables.
        </p>
      </div>
    </template>
    <p v-else class="mb-5 text-neutral-600">No encontramos este pedido en la vista de prueba.</p>
    <SfButton tag="router-link" to="/account/orders" variant="tertiary" class="mt-5"
      >Volver a mis pedidos</SfButton
    >
  </AccountLayout>
</template>
