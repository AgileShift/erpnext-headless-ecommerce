<template>
  <div class="w-full h-full">
    <header ref="referenceRef" class="relative bg-primary-700">
      <div
        class="relative mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 md:flex md:h-[4.75rem] md:px-8"
      >
        <SfButton
          variant="tertiary"
          square
          aria-label="Abrir menú"
          class="justify-self-start bg-transparent !text-white hover:bg-primary-800 active:bg-primary-900 md:hidden"
          @click="openMenu([])"
        >
          <SfIconMenu aria-hidden="true" />
        </SfButton>

        <router-link
          to="/"
          :aria-label="`Ir al inicio de ${siteConfig.siteName}`"
          class="inline-block shrink-0 justify-self-center rounded-sm focus-visible:outline focus-visible:outline-offset"
        >
          <picture>
            <source :srcset="siteLogo" media="(min-width: 1024px)" />
            <img
              :src="siteLogo"
              alt=""
              width="57"
              height="57"
              class="h-12 w-12 object-contain md:h-16 md:w-16"
            />
          </picture>
        </router-link>

        <div
          v-if="siteConfig.showHeaderTitle"
          class="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block"
        >
          <span class="whitespace-nowrap text-2xl font-bold tracking-tight text-white lg:text-3xl">
            {{ siteConfig.siteName.toUpperCase() }}
          </span>
        </div>

        <nav class="flex flex-nowrap items-center justify-self-end gap-1 md:ml-auto">
          <SfButton
            v-if="showAccountPreview"
            tag="router-link"
            :to="{ name: 'AccountAccess', query: route.path === '/cart' ? { from: 'cart' } : {} }"
            aria-label="Mi cuenta"
            title="Mi cuenta"
            class="bg-transparent !text-white hover:bg-primary-800 active:bg-primary-900"
            variant="tertiary"
            square
          >
            <SfIconPerson aria-hidden="true" />
          </SfButton>
          <SfButton
            tag="router-link"
            to="/cart"
            :aria-label="selection.count ? `Carrito, ${selection.count} ${selection.count === 1 ? 'unidad' : 'unidades'}` : 'Carrito'"
            title="Carrito"
            class="relative bg-transparent !text-white hover:bg-primary-800 active:bg-primary-900"
            variant="tertiary"
            square
          >
            <SfIconShoppingCart aria-hidden="true" />
            <span
              v-if="selection.count"
              aria-hidden="true"
              class="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1 text-xs font-bold text-white"
            >
              {{ selection.count }}
            </span>
          </SfButton>
        </nav>

      </div>

      <!-- Desktop dropdown -->
      <nav ref="floatingRef" class="border-b border-(--site-border) bg-(--site-surface)">
        <ul
          class="mx-auto hidden max-w-7xl items-center justify-center gap-1 overflow-x-auto px-6 py-2 md:flex"
          @blur="
            (event) => {
              if (!(event.currentTarget as Element).contains(event.relatedTarget as Element)) {
                close()
              }
            }
          "
        >
          <li v-for="(menuNode, index) in content.children" :key="menuNode.name">
            <SfButton
              v-if="hasCategoryChildren(menuNode)"
              ref="triggerRefs"
              variant="tertiary"
              size="sm"
              :aria-expanded="isOpen && activeNode[0] === menuNode.name"
              aria-haspopup="true"
              class="group !text-(--site-ink) hover:!bg-(--site-surface-soft) hover:!text-(--site-ink) active:!bg-primary-200"
              @mouseenter="openMenu([menuNode.name])"
              @click="openMenu([menuNode.name])"
            >
              <span>{{ menuNode.name }}</span>
              <SfIconChevronRight
                class="rotate-90 text-neutral-500 group-hover:text-neutral-700 group-active:text-neutral-900"
              />
            </SfButton>

            <SfButton
              v-else
              @mouseenter="close()"
              tag="router-link"
              :to="getCategoryLink(menuNode)"
              variant="tertiary"
              size="sm"
              class="group !text-(--site-ink) hover:!bg-(--site-surface-soft) hover:!text-(--site-ink) active:!bg-primary-200"
            >
              <span>{{ menuNode.name }}</span>
            </SfButton>

            <div
              v-if="isOpen && activeNode.length === 1 && activeNode[0] === menuNode.name"
              :key="activeMenu.name"
              ref="megaMenuRef"
              :style="[
                style,
                {
                  left: '50%',
                  right: 'auto',
                  width: getMegaMenuWidth(activeMenu),
                  transform: 'translateX(-50%)',
                },
              ]"
              tabindex="0"
              class="z-10 hidden overflow-hidden rounded-b-xl border border-t-0 border-(--site-border) bg-(--site-surface) shadow-lg outline-none md:block"
              @mouseleave="close()"
              @keydown.esc="focusTrigger(index)"
            >
              <div class="mx-auto max-w-7xl px-8 py-4">
                <div class="mb-3 flex items-center justify-between border-b border-(--site-border) pb-3">
                  <p class="typography-headline-5 font-semibold text-(--site-ink)">
                    {{ activeMenu.name }}
                  </p>
                  <SfListItem
                    tag="router-link"
                    :to="getCategoryLink(activeMenu)"
                    size="sm"
                    class="font-medium !text-(--site-accent-strong)"
                    @click="close()"
                  >
                    Ver todo
                  </SfListItem>
                </div>

                <div
                  class="grid gap-x-8 gap-y-4"
                  :style="{
                    gridTemplateColumns: `repeat(${getMenuSectionCount(activeMenu)}, minmax(0, 1fr))`,
                  }"
                >
                  <div v-if="getLeafChildren(activeMenu).length">
                    <p class="typography-text-sm mb-1 font-semibold text-(--site-muted)">
                      Explorar
                    </p>
                    <ul
                      class="grid gap-x-6"
                      :class="
                        getMenuSectionCount(activeMenu) >= 3
                          ? 'grid-cols-1'
                          : 'grid-cols-2 lg:grid-cols-3'
                      "
                    >
                      <li v-for="node in getLeafChildren(activeMenu)" :key="node.name">
                        <SfListItem
                          tag="router-link"
                          :to="getCategoryLink(node)"
                          size="sm"
                          class="typography-text-sm rounded-md py-1.5 !text-(--site-ink) hover:!bg-(--site-surface-soft)"
                          @click="close()"
                        >
                          {{ node.name }}
                        </SfListItem>
                      </li>
                    </ul>
                  </div>

                  <div v-for="node in getGroupChildren(activeMenu)" :key="node.name">
                    <SfListItem
                      tag="router-link"
                      :to="getCategoryLink(node)"
                      size="sm"
                      class="typography-text-sm mb-2 rounded-md py-2 font-semibold !text-(--site-ink) hover:!bg-(--site-surface-soft)"
                      @click="close()"
                    >
                      {{ node.name }}
                    </SfListItem>
                    <ul class="border-l border-(--site-border) pl-3">
                      <li v-for="child in node.children" :key="child.name">
                        <SfListItem
                          tag="router-link"
                          :to="getCategoryLink(child)"
                          size="sm"
                          class="typography-text-sm rounded-md py-1.5 !text-(--site-ink) hover:!bg-(--site-surface-soft)"
                          @click="close()"
                        >
                          {{ child.name }}
                        </SfListItem>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </li>
          <li>
            <SfButton
              @mouseenter="close()"
              tag="router-link"
              to="/sale"
              variant="tertiary"
              size="sm"
              class="group font-semibold !text-(--site-accent-strong) hover:!bg-(--site-surface-soft) active:!bg-primary-200"
            >
              <span>SALE</span>
            </SfButton>
          </li>
        </ul>
      </nav>

      <!-- Mobile drawer -->
      <div v-if="isOpen" class="md:hidden fixed inset-0 bg-neutral-500 bg-opacity-50 z-10" />
      <SfDrawer
        ref="drawerRef"
        v-model="isOpen"
        placement="left"
        class="md:hidden right-[165px] max-w-[376px] bg-white overflow-y-auto z-10"
      >
        <nav>
          <div
            class="flex items-center justify-between p-4 border-b border-b-neutral-200 border-b-solid"
          >
            <div>
              <p class="typography-text-xs font-medium text-(--site-muted)">Categorías</p>
              <p class="typography-text-base font-semibold text-(--site-ink)">
                {{ isRootCategory(activeMenu) ? 'Explorar productos' : activeMenu.name }}
              </p>
            </div>
            <SfButton
              variant="tertiary"
              square
              aria-label="Cerrar Menu"
              class="ml-2"
              @click="close()"
            >
              <SfIconClose class="text-neutral-500" />
            </SfButton>
          </div>
          <ul class="mt-2 mb-6">
            <li v-if="!isRootCategory(activeMenu)">
              <SfListItem
                size="lg"
                tag="button"
                type="button"
                class="border-b border-b-neutral-200 border-b-solid"
                @click="goBack()"
              >
                <div class="flex items-center">
                  <SfIconArrowBack class="text-neutral-500" />
                  <p class="ml-3 font-medium">Volver</p>
                </div>
              </SfListItem>
            </li>
            <li v-if="!isRootCategory(activeMenu)">
              <SfListItem
                size="lg"
                tag="router-link"
                :to="getCategoryLink(activeMenu)"
                class="border-b border-b-neutral-200 border-b-solid"
                @click="close()"
              >
                <div class="flex items-center">
                  <p class="text-left font-medium">Ver todo en {{ activeMenu.name }}</p>
                </div>
              </SfListItem>
            </li>
            <li v-if="isRootCategory(activeMenu)">
              <router-link to="/sale" class="block px-4 py-3 text-left" @click="close()">
                Sale
              </router-link>
            </li>
            <li v-if="isRootCategory(activeMenu)">
              <router-link to="/cart" class="block px-4 py-3 text-left" @click="close()">
                Carrito
                <span v-if="selection.count" class="font-semibold">({{ selection.count }})</span>
              </router-link>
            </li>
            <template v-for="node in activeMenu.children" :key="node.name">
              <li v-if="!hasCategoryChildren(node)">
                <SfListItem
                  size="lg"
                  tag="router-link"
                  :to="getCategoryLink(node)"
                  class="first-of-type:mt-2"
                  @click="close()"
                >
                  <div class="flex items-center">
                    <p class="text-left">{{ node.name }}</p>
                  </div>
                </SfListItem>
              </li>
              <li v-else>
                <SfListItem size="lg" tag="button" type="button" @click="goNext(node.name)">
                  <div class="flex justify-between items-center">
                    <div class="flex items-center">
                      <p class="text-left">{{ node.name }}</p>
                    </div>
                    <SfIconChevronRight class="text-neutral-500" />
                  </div>
                </SfListItem>
              </li>
            </template>
          </ul>
        </nav>
      </SfDrawer>
    </header>
  </div>
</template>

<script lang="ts" setup>
import {
  SfIconClose,
  SfButton,
  SfDrawer,
  SfListItem,
  SfIconChevronRight,
  SfIconMenu,
  SfIconArrowBack,
  SfIconPerson,
  SfIconShoppingCart,
  useDisclosure,
  useTrapFocus,
  useDropdown,
} from '@storefront-ui/vue'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { unrefElement } from '@vueuse/core'
import type { Category } from '@/features/catalog/types/Category'
import siteConfig from '@/config'
import { ROOT_CATEGORY_NAME, useCategoryStore } from '@/features/catalog/stores/categoryStore'
import { useSelectionStore } from '@/features/cart/stores/selectionStore'

const siteLogo = `/${siteConfig.siteLogo}`
const route = useRoute()
const showAccountPreview = import.meta.env.DEV
const categoryStore = useCategoryStore()
const selection = useSelectionStore()
const content = computed<Category>(() => categoryStore.categoryTree)

onMounted(() => {
  categoryStore.loadCategories()
})

const getCategoryLink = (category: Category) => `/category/${encodeURIComponent(category.name)}`
const hasCategoryChildren = (category: Category) => category.children.length > 0
const getLeafChildren = (category: Category) =>
  category.children.filter((child) => !hasCategoryChildren(child))
const getGroupChildren = (category: Category) =>
  category.children.filter((child) => hasCategoryChildren(child))
const getMenuSectionCount = (category: Category) =>
  Math.max(1, getGroupChildren(category).length + (getLeafChildren(category).length ? 1 : 0))
const getMegaMenuWidth = (category: Category) =>
  getMenuSectionCount(category) >= 3
    ? 'min(64rem, calc(100vw - 2rem))'
    : 'min(48rem, calc(100vw - 2rem))'
const isRootCategory = (category: Category) => category.name === ROOT_CATEGORY_NAME

const findNode = (names: string[], node: Category): Category => {
  if (names.length === 0) {
    return node
  }

  const [currentName, ...restNames] = names
  const child = node.children.find((childCategory) => childCategory.name === currentName)

  return child ? findNode(restNames, child) : node
}

const { close, open, isOpen } = useDisclosure()
const { referenceRef, floatingRef, style } = useDropdown({
  isOpen,
  onClose: close,
  placement: 'bottom-start',
  middleware: [],
})

const drawerRef = ref()
const megaMenuRef = ref()
const triggerRefs = ref()
const activeNode = ref<string[]>([])

const activeMenu = computed(() => findNode(activeNode.value, content.value))

const trapFocusOptions = {
  activeState: isOpen,
  arrowKeysUpDown: true,
  initialFocus: 'container',
} as const
useTrapFocus(
  computed(() => megaMenuRef.value?.[0]),
  trapFocusOptions,
)
useTrapFocus(drawerRef, trapFocusOptions)

const openMenu = (menuType: string[]) => {
  activeNode.value = menuType
  open()
}

const goBack = () => {
  activeNode.value = activeNode.value.slice(0, activeNode.value.length - 1)
}

const goNext = (name: string) => {
  activeNode.value = [...activeNode.value, name]
}

const focusTrigger = (index: number) => {
  unrefElement(triggerRefs.value[index]).focus()
}

</script>
