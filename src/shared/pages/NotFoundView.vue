<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'
</script>
<template>
  <section class="mx-auto max-w-xl py-16 text-center">
    <p class="text-sm font-semibold text-neutral-500">404</p>
    <h1 class="mt-3 text-3xl font-bold">No encontramos esta página</h1>
    <p class="mt-4 text-neutral-600">
      El enlace puede haber cambiado. Podés seguir explorando el catálogo.
    </p>
    <SfButton tag="router-link" to="/" class="mt-6 !text-neutral-950">Volver al catálogo</SfButton>
  </section>
</template>
