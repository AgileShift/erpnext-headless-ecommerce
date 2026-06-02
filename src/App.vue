<template>
  <main>
    <TheNavbar />
    <div class="w-10/12 mx-auto py-8">
      <RouterView />
    </div>
  </main>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import TheNavbar from '@/components/TheNavbar.vue'
import siteConfig from '@/config'

document.title = siteConfig.siteName;

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
