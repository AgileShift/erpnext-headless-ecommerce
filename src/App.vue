<template>
  <main class="flex min-h-screen flex-col">
    <TheNavbar />
    <div class="w-10/12 mx-auto flex-1 py-8">
      <RouterView />
    </div>
    <TheFooter />
    <FloatingHelpButton />
    <CookieConsentBanner />
  </main>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import CookieConsentBanner from '@/components/CookieConsentBanner.vue'
import FloatingHelpButton from '@/components/FloatingHelpButton.vue'
import TheNavbar from '@/components/TheNavbar.vue'
import TheFooter from '@/components/TheFooter.vue'
import siteConfig from '@/config'
import { DEFAULT_META_DESCRIPTION, setPageMeta } from '@/utils/pageMeta'

const route = useRoute()

watchEffect(() => {
  if (!route.meta.legalDocument) {
    setPageMeta({
      title: siteConfig.siteName,
      description: DEFAULT_META_DESCRIPTION,
      canonicalPath: route.path,
    })
  }
})

const favicon = document.querySelector("link[rel~='icon']");
if (favicon) {
  favicon.setAttribute('href', siteConfig.siteFavicon);
}
</script>

<style scoped>
main {
  --color-primary-100: rgb(v-bind(siteConfig.colors.primary) / 0.18);
  --color-primary-200: rgb(v-bind(siteConfig.colors.primary) / 0.32);
  --color-primary-300: rgb(v-bind(siteConfig.colors.primary) / 0.48);
  --color-primary-500: rgb(v-bind(siteConfig.colors.primary));
  --color-primary-700: rgb(v-bind(siteConfig.colors.primary));
  --color-primary-800: rgb(v-bind(siteConfig.colors.secondary));
  --color-primary-900: rgb(v-bind(siteConfig.colors.secondary));

  --color-secondary-100: rgb(v-bind(siteConfig.colors.secondary) / 0.18);
  --color-secondary-600: rgb(v-bind(siteConfig.colors.secondary));
  --color-secondary-700: rgb(v-bind(siteConfig.colors.secondary));

  --colors-primary-700: v-bind(siteConfig.colors.primary);
  --colors-primary-800: v-bind(siteConfig.colors.secondary);

  --colors-secondary-600: v-bind(siteConfig.colors.secondary);
  --colors-secondary-700: v-bind(siteConfig.colors.secondary);
}
</style>
