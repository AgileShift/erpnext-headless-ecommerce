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
</script>
