<template>
  <img
    :key="src"
    :src="imageUrl"
    :srcset="imageSrcset"
    :alt="alt"
    @error.once="showFallback"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  getProductImageSrcset,
  getProductImageUrl,
  PRODUCT_IMAGE_PLACEHOLDER,
} from '@/utils/productImages'

const props = withDefaults(
  defineProps<{
    src?: string
    alt: string
    responsive?: boolean
  }>(),
  { responsive: false },
)

const imageUrl = computed(() => {
  if (!props.src) return PRODUCT_IMAGE_PLACEHOLDER
  return props.responsive ? getProductImageUrl(props.src) : props.src
})

const imageSrcset = computed(() =>
  props.src && props.responsive ? getProductImageSrcset(props.src) : undefined,
)

const showFallback = (event: Event) => {
  const image = event.currentTarget as HTMLImageElement
  image.srcset = ''
  image.src = PRODUCT_IMAGE_PLACEHOLDER
}
</script>
