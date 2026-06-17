<template>
  <SfButton
    tag="a"
    :size="size"
    :href="whatsappHref"
    class="border border-primary-300 !bg-primary-700 !text-neutral-950 hover:!bg-primary-100 active:!bg-primary-200"
  >
    <template #prefix>
      <SfIconShoppingCart size="sm" />
    </template>
    <template #suffix>
      {{ suffix }}
    </template>
  </SfButton>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SfButton, SfIconShoppingCart } from '@storefront-ui/vue'
import siteConfig from '@/config'

const whatsappNumber = siteConfig.contact.whatsApp

const props = defineProps<{
  size: 'base' | 'sm' | 'lg' | undefined
  suffix: string
  item_name: string
  message?: string
}>()

const whatsappMessage = computed(
  () => props.message || `Tengo interés en el producto: ${props.item_name}`,
)

const whatsappHref = computed(
  () => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage.value)}`,
)
</script>
