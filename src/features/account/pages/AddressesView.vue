<script setup lang="ts">
import { ref } from 'vue'
import { SfButton, SfInput } from '@storefront-ui/vue'
import AccountLayout from '../components/AccountLayout.vue'
import { useAccountPreview } from '../previewStore'
const account = useAccountPreview()
const city = ref(account.city)
const address = ref(account.address)
const saved = ref(false)
function save() {
  account.$patch({ city: city.value, address: address.value })
  saved.value = true
}
</script>
<template>
  <AccountLayout title="Dirección de entrega">
    <form
      class="max-w-xl space-y-5 rounded-xl border border-neutral-200 p-6"
      @submit.prevent="save"
      @input="saved = false"
    >
      <h2 class="text-lg font-semibold">¿Dónde recibís tu compra?</h2>
      <p class="text-sm text-neutral-600">
        Agregá referencias que ayuden a encontrar tu dirección.
      </p>
      <label class="block"
        >Ciudad o municipio<SfInput v-model="city" autocomplete="address-level2" required
      /></label>
      <label class="block"
        >Dirección y referencias<SfInput v-model="address" autocomplete="street-address" required
      /></label>
      <SfButton type="submit" class="!text-neutral-950">Guardar en esta vista</SfButton>
      <p v-if="saved" role="status">Dirección guardada durante esta prueba.</p>
    </form>
  </AccountLayout>
</template>
