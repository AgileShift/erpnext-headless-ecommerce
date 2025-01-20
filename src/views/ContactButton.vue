<template>
  <SfButton tag="a"
            :size="size"
            :href="`https://wa.me/50577020233?text=Tengo interés en el producto: ${item_name}`">
    <template #prefix>
      <SfIconShoppingCart size="sm" />
    </template>
    <template #suffix>
      {{suffix}}
    </template>
  </SfButton>
</template>

<script setup lang="ts">
import { SfButton, SfIconShoppingCart } from '@storefront-ui/vue'

defineProps<{
  size: "base" | "sm" | "lg" | undefined
  suffix: string
  item_name: string
}>()
</script>
