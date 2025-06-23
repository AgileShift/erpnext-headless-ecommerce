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
  --colors-primary-700: v-bind(siteConfig.colors.primary);
  --colors-primary-800: v-bind(siteConfig.colors.secondary);

  --colors-secondary-600: v-bind(siteConfig.colors.secondary);
  --colors-secondary-700: v-bind(siteConfig.colors.secondary);
}
</style>
