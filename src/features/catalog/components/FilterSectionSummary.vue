<template>
  <div class="flex min-h-12 items-center justify-between gap-3 p-2 hover:bg-neutral-50">
    <div class="min-w-0">
      <p class="font-semibold text-neutral-900">{{ label }}</p>
      <p v-if="selectedValues.length" class="truncate text-sm text-neutral-600">
        ({{ selectedValues.length }}): {{ selectedValues.join(', ') }}
      </p>
    </div>
    <SfIconExpandMore
      class="shrink-0 text-neutral-500 transition-transform"
      :class="{ 'rotate-180': open }"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { SfIconExpandMore } from '@storefront-ui/vue'

defineProps<{ label: string; selectedValues: string[]; open: boolean }>()
</script>
