<template>
  <main class="flex min-h-screen flex-col">
    <TheNavbar />
    <div class="w-10/12 mx-auto flex-1 py-8">
      <slot />
    </div>
    <TheFooter />
    <FloatingHelpButton />
    <CookieConsentBanner />
  </main>
</template>

<script setup lang="ts">
import CookieConsentBanner from '@/components/CookieConsentBanner.vue'
import FloatingHelpButton from '@/components/FloatingHelpButton.vue'
import TheNavbar from '@/components/TheNavbar.vue'
import TheFooter from '@/components/TheFooter.vue'
</script>
