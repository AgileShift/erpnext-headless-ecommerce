<script setup lang="ts">
import PreviewNotice from '@/shared/components/PreviewNotice.vue'
defineProps<{ title: string }>()
const links = [
  ['/account/profile', 'Mi perfil'],
  ['/account/addresses', 'Direcciones'],
  ['/account/orders', 'Mis pedidos'],
  ['/account', 'Acceso por correo'],
]
</script>
<template>
  <section class="mx-auto max-w-6xl">
    <p class="text-sm text-neutral-500">Mi cuenta</p>
    <h1 class="mt-2 text-3xl font-bold text-neutral-950">{{ title }}</h1>
    <PreviewNotice />
    <div class="mt-6 grid gap-8 md:grid-cols-[200px_1fr]">
      <nav aria-label="Mi cuenta" class="flex flex-wrap gap-2 md:flex-col md:items-stretch">
        <RouterLink
          v-for="[to, label] in links"
          :key="to"
          :to="to!"
          class="rounded-lg px-4 py-3 text-neutral-700 hover:bg-neutral-100"
          active-class="bg-neutral-100 font-semibold text-neutral-950"
          >{{ label }}</RouterLink
        >
      </nav>
      <div class="min-w-0"><slot /></div>
    </div>
  </section>
</template>
