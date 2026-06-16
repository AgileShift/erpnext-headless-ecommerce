<template>
  <div v-if="loading" class="text-center">
    <h1 class="font-headings">Cargando Producto</h1>
    <SfLoaderCircular size="4xl" />
  </div>
  <div
    v-else-if="product"
    class="mx-auto grid w-full max-w-7xl grid-cols-1 gap-y-4 px-4 md:grid-cols-2 md:items-start md:gap-x-[60px] md:px-8"
  >
    <section class="w-full min-w-0">
      <div class="overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 shadow-sm">
        <img
          class="h-auto w-full"
          :src="displayedImage"
          :alt="displayedItemName"
          width="176"
          height="176"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
      </div>
    </section>

    <section class="w-full min-w-0 md:max-w-xl">
      <div v-if="displayedPrice?.discount_percent">
        <div
          class="mb-2 inline-flex items-center justify-center bg-secondary-700 px-3 py-1.5 text-xs font-semibold text-white"
        >
          <SfIconSell size="sm" class="mr-1.5" /> SALE
        </div>
      </div>

      <SfLink
        tag="router-link"
        :to="`/category/${product.item_group}`"
        variant="secondary"
        class="block no-underline pt-0.5 pb-1 font-light leading-5 text-neutral-700"
      >
        {{ product.item_group }}
      </SfLink>

      <p class="mb-2 text-lg font-bold leading-snug text-neutral-950 md:text-xl">
        {{ displayedItemName }}
      </p>

      <span class="block font-bold text-xl text-neutral-950">
        <a>{{ displayedLocalPrice }}</a>
        <a class="font-thin"> | </a>
        <a>{{ displayedUsdPrice }}</a>
      </span>

      <span v-if="displayedPrice?.discount_percent" class="max-sm:block block font-bold">
        <del class="text-sm text-neutral-400 md:text-base">{{ displayedPrice?.formatted_mrp }}</del>
        <a class="pl-2 text-sm md:text-base text-secondary-700"
          >{{ displayedPrice?.formatted_discount_percent }} OFF</a
        >
      </span>

      <span
        v-if="displayedQty"
        class="mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium"
        :class="stockBadgeClass"
      >
        {{ stockBadgeLabel }}
      </span>

      <div v-if="attributeGroups.length" class="mt-5 space-y-4">
        <div v-for="group in attributeGroups" :key="group.name" class="min-w-0">
          <div class="mb-2 flex items-center gap-2 text-sm">
            <span class="font-semibold text-neutral-900">{{ group.name }}</span>
          </div>

          <div class="flex min-w-0 flex-wrap gap-2">
            <SfChip
              v-for="option in group.options"
              :key="option.value"
              :model-value="option.selected"
              :square="isSizeAttribute(group.name)"
              :class="getAttributeOptionClass(group.name)"
              :input-props="{ value: option.value, disabled: !option.available }"
              @click="option.selected && $event.preventDefault()"
              @update:model-value="$event === true && selectAttribute(group.name, option.value)"
            >
              <template v-if="isColorAttribute(group.name)" #prefix>
                <SfThumbnail
                  size="sm"
                  class="border border-neutral-300"
                  :style="{ backgroundColor: getColorSwatch(option.value) }"
                />
              </template>
              <span>{{ option.label }}</span>
            </SfChip>
          </div>
        </div>
      </div>

      <SfButton
        class="mt-5 w-full justify-center border border-neutral-900 bg-neutral-50 !text-neutral-950 hover:bg-neutral-100 hover:!text-neutral-950 disabled:border-neutral-200 disabled:bg-neutral-50 disabled:!text-neutral-400"
        variant="tertiary"
        :disabled="!canAddSelection"
        @click="addSelectedVariant"
      >
        <template #prefix>
          <SfIconFavorite size="sm" />
        </template>
        <template #suffix>{{ selectionButtonLabel }}</template>
      </SfButton>

      <div class="mb-4 mt-4 border-y border-neutral-200 py-4">
        <div class="justify-center items-start xs:flex">
          <ContactButton
            class="w-full"
            size="lg"
            suffix="Enviar a WhatsApp"
            :item_name="displayedItemName"
            :message="whatsappMessage"
          />
        </div>
      </div>

      <div
        v-if="!displayedPrice?.discount_percent"
        class="flex rounded-md bg-neutral-50 p-3 text-neutral-700"
      >
        <SfIconPackage size="sm" class="flex-shrink-0 mr-2 text-neutral-500" />
        <p class="text-sm">Envio Gratis en Managua Centro</p>
      </div>
      <div v-if="displayedPrice?.discount_percent" class="grid gap-3 rounded-md bg-neutral-50 p-3">
        <div class="flex text-neutral-700">
          <SfIconSafetyCheck size="sm" class="flex-shrink-0 mr-2 text-neutral-500" />
          <p class="text-sm">
            Prendas en descuento <strong>no aplican</strong> a Cambios o Devoluciones.
          </p>
        </div>
        <div class="flex text-neutral-700">
          <SfIconPackage size="sm" class="flex-shrink-0 mr-2 text-neutral-500" />
          <p class="text-sm">Prendas en descuento <strong>no se envian a tallar</strong>.</p>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="text-center">
    <h1 class="font-headings text-black">Producto no encontrado</h1>
  </div>

  <div class="mx-auto mt-8 flex w-full max-w-7xl justify-end px-4 md:mt-12 md:px-8">
    <SfButton size="lg" class="text-center" tag="a" @click="$router.go(-1)">
      <template #prefix>
        <SfIconArrowBack size="sm" />
      </template>
      <template #suffix>Volver a la lista</template>
    </SfButton>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import {
  SfButton,
  SfChip,
  SfLink,
  SfLoaderCircular,
  SfIconPackage,
  SfIconSafetyCheck,
  SfIconSell,
  SfIconArrowBack,
  SfIconFavorite,
  SfThumbnail,
} from '@storefront-ui/vue'
import ContactButton from '@/components/ContactButton.vue'
import type { ProductVariant } from '@/types/Product'
import { useSelectionStore } from '@/stores/selectionStore'
import { getColorSwatch } from '@/utils/colorSwatches'
import { formatAttributeValue, normalizeAttributeName } from '@/utils/attributeFormatting'
import { getProductMetaDescription, setPageMeta } from '@/utils/pageMeta'

const route = useRoute()
const productStore = useProductStore()
const selectionStore = useSelectionStore()

const product = computed(() => productStore.currentProduct)
const loading = computed(() => productStore.loading)
const selectedAttributes = ref<Record<string, string>>({})

const isColorAttribute = (attributeName: string) =>
  normalizeAttributeName(attributeName) === 'color'
const isSizeAttribute = (attributeName: string) => normalizeAttributeName(attributeName) === 'talla'

const getAttributeOptionClass = (attributeName: string) => {
  const selectedStateClass =
    'peer-next-checked:bg-primary-100 peer-next-checked:text-neutral-950 peer-next-checked:shadow-sm'

  if (isSizeAttribute(attributeName)) {
    return `min-w-10 ${selectedStateClass} disabled:cursor-not-allowed disabled:opacity-35 disabled:line-through`
  }

  if (isColorAttribute(attributeName)) {
    return `${selectedStateClass} disabled:cursor-not-allowed disabled:opacity-35 disabled:line-through`
  }

  return `${selectedStateClass} disabled:cursor-not-allowed disabled:opacity-35 disabled:line-through`
}

const getQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : null
  }

  return typeof value === 'string' ? value : null
}

const getVariantAttribute = (variant: ProductVariant, attributeName: string) => {
  const attribute = Object.entries(variant.attributes).find(
    ([name]) => normalizeAttributeName(name) === normalizeAttributeName(attributeName),
  )

  return attribute?.[1] || null
}

const baseAttributeGroups = computed(() => {
  if (!product.value) {
    return []
  }

  return Object.entries(product.value.available_attributes)
    .filter(([, values]) => values.length > 0)
    .map(([name, values]) => ({ name, values }))
    .sort((firstGroup, secondGroup) => {
      const priority = (attributeName: string) => {
        if (isColorAttribute(attributeName)) return 0
        if (isSizeAttribute(attributeName)) return 1
        return 2
      }

      return priority(firstGroup.name) - priority(secondGroup.name)
    })
})

const variantMatchesSelection = (variant: ProductVariant, selection: Record<string, string>) =>
  Object.entries(selection).every(([attributeName, selectedValue]) => {
    if (!selectedValue) {
      return true
    }

    return getVariantAttribute(variant, attributeName) === selectedValue
  })

const getVariantsForSelection = (selection: Record<string, string>) =>
  product.value?.variants.filter((variant) => variantMatchesSelection(variant, selection)) || []

const getAttributeOptions = (
  attributeName: string,
  values: string[],
  selection: Record<string, string> = selectedAttributes.value,
) =>
  values.map((value) => {
    const optionSelection = isColorAttribute(attributeName)
      ? { [attributeName]: value }
      : { ...selection, [attributeName]: value }
    const variants = getVariantsForSelection(optionSelection)
    const stock = variants.reduce((total, variant) => total + variant.actual_qty, 0)

    return {
      value,
      label: isSizeAttribute(attributeName) ? formatAttributeValue(value) : value,
      available: stock > 0,
      selected: selectedAttributes.value[attributeName] === value,
    }
  })

const getAvailableOptions = (
  attributeName: string,
  values: string[],
  selection: Record<string, string>,
) => getAttributeOptions(attributeName, values, selection).filter((option) => option.available)

const attributeGroups = computed(() =>
  baseAttributeGroups.value.map((group) => ({
    ...group,
    options: getAttributeOptions(group.name, group.values),
  })),
)

const activeVariants = computed(() => getVariantsForSelection(selectedAttributes.value))

const selectedVariant = computed(() =>
  activeVariants.value.length === 1 ? activeVariants.value[0] : null,
)

const selectionIsComplete = computed(() =>
  baseAttributeGroups.value.every((group) => selectedAttributes.value[group.name]),
)

const activeVariantsSharePrice = computed(() => {
  if (activeVariants.value.length === 0) {
    return false
  }

  return new Set(activeVariants.value.map((variant) => variant.price.price_list_rate)).size === 1
})

const displayedPrice = computed(
  () =>
    selectedVariant.value?.price ||
    (activeVariantsSharePrice.value ? activeVariants.value[0]?.price : null) ||
    product.value?.price,
)

const displayedLocalPrice = computed(() => {
  if (selectedVariant.value || activeVariantsSharePrice.value) {
    return displayedPrice.value?.local_formatted_price
  }

  return (
    product.value?.price_summary.local_formatted_price ||
    displayedPrice.value?.local_formatted_price
  )
})

const displayedUsdPrice = computed(() => {
  if (selectedVariant.value || activeVariantsSharePrice.value) {
    return displayedPrice.value?.formatted_price
  }

  return product.value?.price_summary.formatted_price || displayedPrice.value?.formatted_price
})

const displayedImage = computed(
  () => selectedVariant.value?.image || activeVariants.value[0]?.image || product.value?.image,
)

const displayedItemName = computed(
  () =>
    (selectionIsComplete.value && selectedVariant.value?.item_name) ||
    product.value?.item_name ||
    '',
)

const displayedQty = computed(() => {
  if (selectionIsComplete.value && selectedVariant.value) {
    return selectedVariant.value.actual_qty
  }

  if (baseAttributeGroups.value.length === 0) {
    return product.value?.actual_qty || 0
  }

  return 0
})

const stockBadgeLabel = computed(() =>
  displayedQty.value === 1
    ? 'Última unidad disponible'
    : `Disponible: ${displayedQty.value} unidades`,
)

const stockBadgeClass = computed(() =>
  displayedQty.value === 1
    ? 'border-warning-500 bg-warning-500 text-neutral-950'
    : 'border-neutral-200 bg-neutral-50 text-neutral-700',
)

const selectionItemQty = computed(() => {
  if (!selectedVariant.value) {
    return 0
  }

  return (
    selectionStore.items.find((item) => item.item_code === selectedVariant.value?.item_code)?.qty ||
    0
  )
})

const selectedVariantStock = computed(() => selectedVariant.value?.actual_qty || 0)

const selectionReachedStock = computed(
  () =>
    selectionIsComplete.value &&
    Boolean(selectedVariant.value) &&
    selectionItemQty.value >= selectedVariantStock.value,
)

const canAddSelection = computed(
  () => selectionIsComplete.value && Boolean(selectedVariant.value) && !selectionReachedStock.value,
)

const selectionButtonLabel = computed(() => {
  if (!selectionIsComplete.value || !selectedVariant.value) {
    return 'Seleccioná las opciones para agregar'
  }

  if (selectionReachedStock.value) {
    return selectedVariantStock.value === 1
      ? 'Ya agregaste la unidad disponible'
      : `Ya agregaste ${selectedVariantStock.value} unidades disponibles`
  }

  return selectionItemQty.value
    ? `Agregar otra (${selectionItemQty.value} en selección)`
    : 'Agregar a mi selección'
})

const addSelectedVariant = () => {
  if (!canAddSelection.value || !selectedVariant.value) {
    return
  }

  selectionStore.addItem({
    item_code: selectedVariant.value.item_code,
    product_item_code: product.value?.item_code,
    item_name: selectedVariant.value.item_name,
    image: selectedVariant.value.image,
    attributes: selectedVariant.value.attributes,
    price: selectedVariant.value.price,
  }, selectedVariant.value.actual_qty)
}

const findAttributeValue = (attributeName: string, value: string | null) => {
  if (!value) {
    return null
  }

  const group = baseAttributeGroups.value.find(
    (attributeGroup) =>
      normalizeAttributeName(attributeGroup.name) === normalizeAttributeName(attributeName),
  )

  return (
    group?.values.find(
      (optionValue) => normalizeAttributeName(optionValue) === normalizeAttributeName(value),
    ) || null
  )
}

const selectOnlyAvailableOptions = (selection: Record<string, string>) => {
  const nextSelections = { ...selection }
  const colorGroup = baseAttributeGroups.value.find((group) => isColorAttribute(group.name))
  let changed = true

  while (changed) {
    changed = false

    for (const group of baseAttributeGroups.value) {
      if (nextSelections[group.name]) {
        continue
      }

      if (colorGroup && !nextSelections[colorGroup.name] && !isColorAttribute(group.name)) {
        continue
      }

      const availableOptions = getAvailableOptions(group.name, group.values, nextSelections)

      if (availableOptions.length === 1) {
        nextSelections[group.name] = availableOptions[0].value
        changed = true
      }
    }
  }

  return nextSelections
}

const initializeSelections = () => {
  if (!product.value) {
    selectedAttributes.value = {}
    return
  }

  const nextSelections: Record<string, string> = {}
  const colorGroup = baseAttributeGroups.value.find((group) => isColorAttribute(group.name))
  const sizeGroup = baseAttributeGroups.value.find((group) => isSizeAttribute(group.name))
  const queryColor = getQueryValue(route.query.color)
  const querySize = getQueryValue(route.query.size)

  if (colorGroup) {
    const selectedColor = findAttributeValue(colorGroup.name, queryColor)
    const selectedColorIsAvailable =
      selectedColor &&
      getAvailableOptions(colorGroup.name, colorGroup.values, nextSelections).some(
        (option) => option.value === selectedColor,
      )

    if (selectedColorIsAvailable) {
      nextSelections[colorGroup.name] = selectedColor
    }
  }

  if (sizeGroup && querySize) {
    const selectedSize = findAttributeValue(sizeGroup.name, querySize)

    if (selectedSize) {
      const sizeIsAvailable = getAttributeOptions(
        sizeGroup.name,
        sizeGroup.values,
        nextSelections,
      ).some((option) => option.value === selectedSize && option.available)

      if (sizeIsAvailable) {
        nextSelections[sizeGroup.name] = selectedSize
      }
    }
  }

  selectedAttributes.value = selectOnlyAvailableOptions(nextSelections)
}

const selectAttribute = (attributeName: string, value: string) => {
  const nextSelections = {
    ...selectedAttributes.value,
    [attributeName]: value,
  }

  for (const group of baseAttributeGroups.value) {
    const selectedValue = nextSelections[group.name]

    if (!selectedValue || group.name === attributeName) {
      continue
    }

    const isStillAvailable = getAttributeOptions(group.name, group.values, nextSelections).some(
      (option) => option.value === selectedValue && option.available,
    )

    if (!isStillAvailable) {
      delete nextSelections[group.name]
    }
  }

  selectedAttributes.value = selectOnlyAvailableOptions(nextSelections)
}

const selectedAttributesMessage = computed(() =>
  Object.entries(selectedAttributes.value)
    .filter(([, value]) => value)
    .map(([name, value]) => `${name}: ${value}`)
    .join(' | '),
)

const availableSizesMessage = computed(() => {
  const sizeGroup = baseAttributeGroups.value.find((group) => isSizeAttribute(group.name))

  if (!sizeGroup || selectedAttributes.value[sizeGroup.name]) {
    return ''
  }

  const availableSizes = getAttributeOptions(sizeGroup.name, sizeGroup.values)
    .filter((option) => option.available)
    .map((option) => option.label)
    .join(', ')

  return availableSizes ? ` Tallas disponibles: ${availableSizes}.` : ''
})

const whatsappMessage = computed(() => {
  if (!product.value) {
    return ''
  }

  const selectedMessage = selectedAttributesMessage.value
    ? ` Selección: ${selectedAttributesMessage.value}.`
    : ''
  const variantMessage = selectedVariant.value ? ` Código: ${selectedVariant.value.item_code}.` : ''

  return `Tengo interés en el producto: ${displayedItemName.value}.${selectedMessage}${variantMessage}${availableSizesMessage.value}`
})

const productMetaDescription = computed(() => {
  const price = [displayedLocalPrice.value, displayedUsdPrice.value].filter(Boolean).join(' | ')

  return product.value?.item_name ? getProductMetaDescription(product.value.item_name, price) : ''
})

watch(
  () => route.params.id,
  async (itemCode) => {
    if (typeof itemCode === 'string') {
      await productStore.loadProduct(itemCode)
    }
  },
  { immediate: true },
)

watch(() => [product.value?.item_code, route.fullPath], initializeSelections, {
  immediate: true,
})

watch(
  () => [
    displayedItemName.value,
    displayedImage.value,
    productMetaDescription.value,
    route.fullPath,
  ],
  () => {
    if (!product.value || !displayedItemName.value) {
      return
    }

    setPageMeta({
      title: product.value.item_name,
      description: productMetaDescription.value,
      canonicalPath: route.fullPath,
      imagePath: displayedImage.value,
    })
  },
  { immediate: true },
)
</script>
