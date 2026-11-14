<template>
  <Teleport to="body">
  <div v-if="open" class="fixed inset-0 z-40 bg-black/40" aria-hidden="true" />
  <SfModal v-model="open" tag="section" role="dialog" aria-modal="true" :aria-labelledby="titleId"
    class="z-50 max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 :id="titleId" class="text-lg font-bold text-neutral-950">Elegí tus opciones</h2>
        <p class="mt-1 text-sm text-neutral-600">{{ card.item_name }}</p>
      </div>
      <SfButton variant="tertiary" square aria-label="Cerrar" @click="open = false">
        <SfIconClose aria-hidden="true" />
      </SfButton>
    </div>
    <p v-if="loading" role="status" class="mt-5 text-sm">Cargando opciones…</p>
    <div v-else-if="error" class="mt-5 text-sm" role="alert">
      <p>No pudimos cargar las opciones. Intentá de nuevo o revisá el producto.</p>
      <router-link :to="productUrl" class="mt-2 inline-block font-semibold underline">Ver producto</router-link>
    </div>
    <template v-else-if="product">
      <fieldset v-for="group in groups" :key="group.name" class="mt-5">
        <legend class="text-sm font-semibold">{{ group.name }}</legend>
        <div class="mt-2 flex flex-wrap gap-2">
          <SfChip
            v-for="value in group.values"
            :key="value"
            :model-value="selection[group.name] === value"
            :square="normalizeAttributeName(group.name) === 'talla'"
            class="peer-next-checked:bg-primary-100 peer-next-checked:text-neutral-950 peer-next-checked:shadow-sm"
            :input-props="{ value, disabled: !isAvailable(group.name, value) }"
            @click="selection[group.name] === value && $event.preventDefault()"
            @update:model-value="$event === true && (selection[group.name] = value)"
          >
            <template v-if="normalizeAttributeName(group.name) === 'color'" #prefix>
              <SfThumbnail size="sm" class="border border-neutral-300" :style="{ backgroundColor: getColorSwatch(value) }" />
            </template>
            {{ value }}
          </SfChip>
        </div>
      </fieldset>
      <p v-if="limitReached" class="mt-4 text-sm text-neutral-700" role="status">Ya agregaste la cantidad disponible al carrito.</p>
      <SfButton class="mt-6 w-full justify-center site-primary-label" :disabled="!canAdd" @click="add">Agregar al carrito</SfButton>
    </template>
  </SfModal>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SfButton, SfChip, SfIconClose, SfModal, SfThumbnail } from '@storefront-ui/vue'
import type { Product } from '@/features/catalog/types/Product'
import { useProductStore } from '@/features/catalog/stores/productStore'
import { useSelectionStore } from '@/features/cart/stores/selectionStore'
import { getAttributeGroups, variantMatchesSelection } from '@/features/catalog/utils/variantSelection'
import { normalizeAttributeName } from '@/features/catalog/utils/attributeFormatting'
import { getColorSwatch } from '@/features/catalog/utils/colorSwatches'

const props = defineProps<{ modelValue: boolean; card: Product; color: string | null; productUrl: { path: string; query: { color?: string } } }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; added: [] }>()
const open = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })
const titleId = `quick-add-${Math.random().toString(36).slice(2)}`
const productStore = useProductStore()
const cart = useSelectionStore()
const product = ref<Product | null>(null)
const loading = ref(false)
const error = ref(false)
const selection = ref<Record<string, string>>({})
const groups = computed(() => product.value ? getAttributeGroups(product.value) : [])
const matching = computed(() => product.value?.variants.filter((variant) => variantMatchesSelection(variant, selection.value)) || [])
const variant = computed(() => groups.value.every((group) => selection.value[group.name]) && matching.value.length === 1 ? matching.value[0] : null)
const limitReached = computed(() => !!variant.value && (cart.items.find((item) => item.item_code === variant.value?.item_code)?.qty || 0) >= variant.value.actual_qty)
const canAdd = computed(() => !!variant.value?.item_code && variant.value.actual_qty > 0 && !limitReached.value)

const isAvailable = (name: string, value: string) => {
  const candidate = { ...selection.value, [name]: value }
  return !!product.value?.variants.some((item) => item.actual_qty > 0 && variantMatchesSelection(item, candidate))
}

const add = () => {
  if (!canAdd.value || !variant.value || !product.value) return
  const item = variant.value
  cart.addItem({ item_code: item.item_code, product_item_code: product.value.item_code,
    product_name: product.value.item_name, item_name: item.item_name, image: item.image,
    attributes: item.attributes, price: item.price }, item.actual_qty)
  open.value = false
  emit('added')
}

let request = 0
watch(open, async (isOpen) => {
  const current = ++request
  if (!isOpen) return
  product.value = null
  selection.value = {}
  error.value = false
  loading.value = true
  try {
    const result = await productStore.fetchProduct(props.card.item_code)
    if (current !== request) return
    if (!result.variants.length) throw new Error('No variants available')
    product.value = result
    const colorGroup = groups.value.find((group) => normalizeAttributeName(group.name) === 'color')
    const matchingColor = colorGroup?.values.find((value) => normalizeAttributeName(value) === normalizeAttributeName(props.color || ''))
    if (colorGroup && matchingColor) selection.value[colorGroup.name] = matchingColor
    for (const group of groups.value) {
      const options = group.values.filter((value) => isAvailable(group.name, value))
      if (!selection.value[group.name] && options.length === 1 && normalizeAttributeName(group.name) !== 'talla') selection.value[group.name] = options[0]
    }
    if (!groups.value.length && canAdd.value) add()
  } catch {
    if (current === request) error.value = true
  } finally {
    if (current === request) loading.value = false
  }
})
</script>
