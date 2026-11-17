<template>
  <SfChip
    :model-value="modelValue"
    :square="isSize"
    :class="optionClass"
    :input-props="{ value, disabled: !available }"
    @click="modelValue && !allowDeselect && $event.preventDefault()"
    @update:model-value="emit('update:modelValue', $event === true)"
  >
    <template v-if="isColor" #prefix>
      <SfThumbnail
        size="sm"
        class="border border-neutral-300"
        :style="{ backgroundColor: getColorSwatch(value) }"
      />
    </template>
    <span class="whitespace-nowrap">{{ label }}</span>
    <span
      v-if="!available"
      class="pointer-events-none absolute inset-x-1 top-1/2 h-px -rotate-12 bg-neutral-500"
    />
  </SfChip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SfChip, SfThumbnail } from '@storefront-ui/vue'
import { normalizeAttributeName } from '@/features/catalog/utils/attributeFormatting'
import { getColorSwatch } from '@/features/catalog/utils/colorSwatches'

const props = withDefaults(
  defineProps<{
    attributeName: string
    value: string
    label: string
    modelValue: boolean
    available?: boolean
    allowDeselect?: boolean
  }>(),
  { available: true, allowDeselect: false },
)

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const normalizedAttributeName = computed(() => normalizeAttributeName(props.attributeName))
const isSize = computed(() => normalizedAttributeName.value === 'talla')
const isColor = computed(() => normalizedAttributeName.value === 'color')
const optionClass = computed(() => [
  'peer-next-checked:bg-primary-100 peer-next-checked:text-neutral-950 peer-next-checked:shadow-sm',
  'relative overflow-hidden peer-next-disabled:bg-neutral-200 peer-next-disabled:text-neutral-600 peer-next-disabled:opacity-100 peer-next-disabled:ring-neutral-400',
  { 'min-w-10': isSize.value },
])
</script>
