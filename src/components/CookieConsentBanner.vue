<template>
  <div
    v-if="visible"
    class="fixed bottom-4 left-4 right-4 z-40 rounded-lg border border-neutral-200 bg-white p-4 shadow-2xl md:left-auto md:max-w-xl"
  >
    <div class="flex flex-col gap-3 md:flex-row md:items-start">
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-neutral-950">Privacidad y cookies</p>
        <p class="mt-1 text-sm leading-5 text-neutral-600">
          Usamos almacenamiento necesario para Mi selección y, con tu permiso, analíticas para
          mejorar el catálogo. Podés aceptar o rechazar las analíticas.
        </p>
        <router-link class="mt-2 inline-block text-sm font-semibold text-secondary-700" to="/cookies">
          Ver política de cookies
        </router-link>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row md:flex-col">
        <SfButton size="sm" variant="tertiary" class="border border-neutral-300" @click="reject">
          Rechazar
        </SfButton>
        <SfButton size="sm" class="justify-center" @click="accept">
          Aceptar
        </SfButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { SfButton } from '@storefront-ui/vue'
import { acceptAnalyticsConsent, getConsentPreference, rejectAnalyticsConsent } from '@/utils/consentMode'

const visible = ref(false)

const accept = () => {
  visible.value = false
  void acceptAnalyticsConsent()
}

const reject = () => {
  visible.value = false
  rejectAnalyticsConsent()
}

const openPreferences = () => {
  visible.value = true
}

onMounted(() => {
  visible.value = !getConsentPreference()
  window.addEventListener('cookie-consent:open', openPreferences)
})

onBeforeUnmount(() => {
  window.removeEventListener('cookie-consent:open', openPreferences)
})
</script>
