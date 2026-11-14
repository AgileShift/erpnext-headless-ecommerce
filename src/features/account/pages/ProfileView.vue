<script setup lang="ts">
import { ref } from 'vue'
import { SfButton, SfInput } from '@storefront-ui/vue'
import AccountLayout from '../components/AccountLayout.vue'
import { useAccountPreview } from '../previewStore'
const account = useAccountPreview()
const name = ref(account.name)
const email = ref(account.email)
const phone = ref(account.phone)
const saved = ref(false)
function save() {
  account.$patch({ name: name.value, email: email.value, phone: phone.value })
  saved.value = true
}
</script>
<template>
  <AccountLayout title="Mi perfil">
    <form
      class="max-w-xl space-y-5 rounded-xl border border-neutral-200 p-6"
      @submit.prevent="save"
      @input="saved = false"
    >
      <h2 class="text-lg font-semibold">Tus datos</h2>
      <label class="block"
        >Nombre completo<SfInput v-model="name" autocomplete="name" required
      /></label>
      <label class="block"
        >Correo electrónico<SfInput v-model="email" type="email" autocomplete="email" required
      /></label>
      <label class="block"
        >Teléfono<SfInput v-model="phone" type="tel" autocomplete="tel" required
      /></label>
      <SfButton type="submit" class="!text-neutral-950">Guardar en esta vista</SfButton>
      <p v-if="saved" role="status">Datos guardados durante esta prueba.</p>
    </form>
  </AccountLayout>
</template>
