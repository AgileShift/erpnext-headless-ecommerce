<template>
  <main class="flex min-h-screen flex-col">
    <header v-if="isCheckout" class="bg-primary-700 text-(--site-on-accent)">
      <div class="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2">
        <img :src="'/' + siteConfig.siteLogo" alt="" width="48" height="48" class="size-12 object-contain" />
        <span class="font-semibold">{{ siteConfig.siteName }}</span>
      </div>
    </header>
    <TheNavbar v-else />
    <div class="mx-auto flex-1" :class="isCheckout ? 'w-full px-4 py-5 sm:px-6 sm:py-8' : 'w-10/12 py-8'">
      <slot />
    </div>
    <TheFooter />
    <FloatingHelpButton v-if="!isCheckout" />
    <CookieConsentBanner />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import siteConfig from '@/config'
import CookieConsentBanner from '@/shared/components/CookieConsentBanner.vue'
import FloatingHelpButton from '@/shared/components/FloatingHelpButton.vue'
import TheNavbar from '@/shared/components/TheNavbar.vue'
import TheFooter from '@/shared/components/TheFooter.vue'

const route = useRoute()
const isCheckout = computed(() => route.name === 'Checkout')
</script>
