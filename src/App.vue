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

const primary_color = siteConfig.colors.primary;
</script>

<style scoped>
main {
  --colors-primary-700: v-bind(primary_color);
}
</style>
