<template>
  <SfButton
    tag="a"
    :size="size"
    :href="whatsappHref"
    :variant="secondary ? 'secondary' : 'primary'"
    :class="secondary ? '!text-neutral-950' : 'site-primary-label'"
  >
    <template #prefix>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.7-.8L3 21l1.8-5.8a8.5 8.5 0 1 1 16.2-3.7Z" />
      </svg>
    </template>
    <template #suffix>
      {{ suffix }}
    </template>
  </SfButton>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SfButton } from '@storefront-ui/vue'
import siteConfig from '@/config'

const whatsappNumber = siteConfig.contact.whatsApp

const props = defineProps<{
  size: 'base' | 'sm' | 'lg' | undefined
  suffix: string
  item_name: string
  message?: string
  secondary?: boolean
}>()

const whatsappMessage = computed(
  () => props.message || `Tengo interés en el producto: ${props.item_name}`,
)

const whatsappHref = computed(
  () => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage.value)}`,
)
</script>
