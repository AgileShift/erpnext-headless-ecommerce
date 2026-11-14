<script setup lang="ts">
import { ref } from 'vue'
import { SfButton } from '@storefront-ui/vue'
import AccountLayout from '@/features/account/components/AccountLayout.vue'
import { previewOrders } from '../data/previewOrders'
const showExample = ref(false)
</script>
<template>
  <AccountLayout title="Mis pedidos">
    <div v-if="!showExample" class="rounded-xl border border-neutral-200 px-6 py-12 text-center">
      <h2 class="text-xl font-semibold">Todavía no hay pedidos para mostrar</h2>
      <p class="mt-2 text-neutral-600">Aquí podrás consultar tus compras y su estado.</p>
      <SfButton tag="router-link" to="/" class="mt-6 !text-neutral-950">Explorar catálogo</SfButton>
    </div>
    <ul v-else class="space-y-4">
      <li
        v-for="order in previewOrders"
        :key="order.id"
        class="rounded-xl border border-neutral-200 p-6"
      >
        <div class="flex flex-wrap justify-between gap-3">
          <h2 class="font-semibold">{{ order.date }}</h2>
          <span class="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-900">{{
            order.status
          }}</span>
        </div>
        <p class="my-4 text-neutral-600">{{ order.lines[0]?.name }}</p>
        <SfButton tag="router-link" :to="`/account/orders/${order.id}`" variant="secondary"
          >Ver detalle</SfButton
        >
      </li>
    </ul>
    <button class="mt-5 underline underline-offset-4" @click="showExample = !showExample">
      {{ showExample ? 'Ver estado vacío' : 'Ver un pedido de ejemplo' }}
    </button>
  </AccountLayout>
</template>
