<template>
  <div class="w-full h-full">
    <header ref="referenceRef" class="relative">
      <div
        class="flex justify-between items-center flex-wrap md:flex-nowrap px-4 md:px-36 py-2 md:py-5 w-full h-full border-0 bg-primary-700 border-neutral-200 md:h-20"
      >
        <SfButton
          variant="tertiary"
          square
          aria-label="Abrir menú"
          class="block md:hidden mr-10 bg-transparent hover:bg-primary-800 hover:text-white active:bg-primary-900 active:text-white"
          @click="openMenu([])"
        >
          <SfIconMenu class="text-white" />
        </SfButton>

        <router-link
          to="/"
          aria-label="Home"
          class="inline-block focus-visible:outline focus-visible:outline-offset focus-visible:rounded-sm shrink-0 mx-10"
        >
          <picture>
            <source :srcset="siteLogo" media="(min-width: 1024px)" />
            <img
              :src="siteLogo"
              alt="Logo"
              width="57"
              height="57"
              class="h-14 w-14 md:h-[70px] md:w-[70px]"
            />
          </picture>
        </router-link>

        <div
          v-if="siteConfig.siteName === 'Clothing Center'"
          class="hidden md:flex flex-col items-stretch"
        >
          <a class="text-3xl font-bold text-white">CLOTHING CENTER</a>
        </div>

        <nav class="flex flex-nowrap justify-end items-center md:ml-10 gap-x-1 px-6">
          <SfButton
            tag="router-link"
            to="/selection"
            aria-label="Mi selección"
            class="relative bg-transparent text-white hover:bg-primary-800 hover:text-white active:bg-primary-900 active:text-white"
            variant="tertiary"
            square
          >
            <SfIconFavorite />
            <span
              v-if="selection.count"
              class="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1 text-xs font-bold text-white"
            >
              {{ selection.count }}
            </span>
          </SfButton>
        </nav>

      </div>

      <!-- Desktop dropdown -->
      <nav ref="floatingRef">
        <ul
          class="hidden md:flex place-content-center px-6 py-2 bg-white border-b border-b-neutral-200 border-b-solid"
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
              class="group mr-2 !text-neutral-900 hover:!bg-neutral-200 hover:!text-neutral-700 active:!bg-neutral-300 active:!text-neutral-900"
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
              class="group mr-2 !text-neutral-900 hover:!bg-neutral-200 hover:!text-neutral-700 active:!bg-neutral-300 active:!text-neutral-900"
            >
              <span>{{ menuNode.name }}</span>
            </SfButton>

            <div
              v-if="isOpen && activeNode.length === 1 && activeNode[0] === menuNode.name"
              :key="activeMenu.name"
              ref="megaMenuRef"
              :style="style"
              tabindex="0"
              class="hidden md:grid gap-x-6 bg-white shadow-lg p-6 left-0 right-0 outline-none place-items-center z-10"
              @mouseleave="close()"
              @keydown.esc="focusTrigger(index)"
            >
              <SfListItem
                v-if="!isRootCategory(activeMenu)"
                tag="router-link"
                :to="getCategoryLink(activeMenu)"
                size="sm"
                class="typography-text-sm mb-2 text-center"
              >
                Todo en {{ activeMenu.name }}
              </SfListItem>
              <template v-for="node in activeMenu.children" :key="node.name">
                <template v-if="!hasCategoryChildren(node)">
                  <SfListItem
                    tag="router-link"
                    :to="getCategoryLink(node)"
                    size="sm"
                    class="typography-text-sm mb-2 text-center"
                  >
                    {{ node.name }}
                  </SfListItem>
                </template>
                <div v-else>
                  <p
                    class="typography-text-base font-medium text-neutral-900 whitespace-nowrap px-4 py-1.5 border-b border-b-neutral-200 border-b-solid"
                  >
                    {{ node.name }}
                  </p>
                  <ul class="mt-2">
                    <li>
                      <SfListItem
                        tag="router-link"
                        :to="getCategoryLink(node)"
                        size="sm"
                        class="typography-text-sm py-1.5"
                      >
                        Todo en {{ node.name }}
                      </SfListItem>
                    </li>
                    <li v-for="child in node.children" :key="child.name">
                      <SfListItem
                        tag="router-link"
                        :to="getCategoryLink(child)"
                        size="sm"
                        class="typography-text-sm py-1.5"
                      >
                        {{ child.name }}
                      </SfListItem>
                    </li>
                  </ul>
                </div>
              </template>
            </div>
          </li>
          <li>
            <SfButton
              @mouseenter="close()"
              tag="router-link"
              to="/sale"
              class="group mr-2 !text-neutral-900 hover:!text-neutral-700 active:!bg-neutral-300 active:!text-neutral-900"
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
            <p class="typography-text-base font-medium">Ver por Categorias</p>
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
                  <p class="ml-5 font-medium">{{ activeMenu.name }}</p>
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
                  <p class="text-left">Todo en {{ activeMenu.name }}</p>
                </div>
              </SfListItem>
            </li>
            <li v-if="isRootCategory(activeMenu)">
              <router-link to="/sale" class="block px-4 py-3 text-left" @click="close()">
                Sale
              </router-link>
            </li>
            <li v-if="isRootCategory(activeMenu)">
              <router-link to="/selection" class="block px-4 py-3 text-left" @click="close()">
                Mi selección
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
  SfIconFavorite,
  useDisclosure,
  useTrapFocus,
  useDropdown,
} from '@storefront-ui/vue'
import { ref, computed, onMounted } from 'vue'
import { unrefElement } from '@vueuse/core'
import type { Category } from '@/types/Category'
import siteConfig from '@/config'
import { ROOT_CATEGORY_NAME, useCategoryStore } from '@/stores/categoryStore'
import { useSelectionStore } from '@/stores/selectionStore'

const siteLogo = `/${siteConfig.siteLogo}`
const categoryStore = useCategoryStore()
const selection = useSelectionStore()
const content = computed<Category>(() => categoryStore.categoryTree)

onMounted(() => {
  categoryStore.loadCategories()
})

const getCategoryLink = (category: Category) => `/category/${encodeURIComponent(category.name)}`
const hasCategoryChildren = (category: Category) => category.children.length > 0
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
