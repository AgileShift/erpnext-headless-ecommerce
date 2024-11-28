<template>
  <div class="w-full h-full">
    <header ref="referenceRef" class="relative">
      <div class="flex justify-between items-center flex-wrap md:flex-nowrap px-4 md:px-10 py-2 md:py-5 w-full h-full border-0 bg-primary-700 border-neutral-200 md:h-20">
        <div class="flex items-center">
          <SfButton variant="tertiary" square aria-label="Close menu"
            class="block md:hidden mr-5 bg-transparent hover:bg-primary-800 hover:text-white active:bg-primary-900 active:text-white"
            @click="openMenu([])">
            <SfIconMenu class="text-white" />
          </SfButton>
          <router-link to="/" aria-label="Home" class="flex shrink-0 w-8 h-8 lg:w-[12.5rem] lg:h-[1.75rem] items-center mr-auto text-white md:mr-10 focus-visible:outline focus-visible:outline-offset focus-visible:rounded-sm">
            <picture>
              <source :srcset="LogoClothing" media="(min-width: 1024px)" />
              <img :src="LogoClothing" alt="Logo" />
            </picture>
          </router-link>
        </div>

        <form role="search" class="hidden md:flex flex-[100%] ml-10" @submit.prevent="search">
          <SfInput v-model="inputValue" type="search" class="[&::-webkit-search-cancel-button]:appearance-none" placeholder="Buscar" wrapper-class="flex-1 h-10 pr-0" size="base">
            <template #suffix>
              <span class="flex items-center">
                <SfButton variant="tertiary" square aria-label="search" type="submit" class="rounded-l-none hover:bg-transparent active:bg-transparent">
                  <SfIconSearch />
                </SfButton>
              </span>
            </template>
          </SfInput>
        </form>

        <nav class="flex flex-nowrap justify-end items-center md:ml-10 gap-x-1">
          <SfButton v-for="actionItem in actionItems" :key="actionItem.ariaLabel" :aria-label="actionItem.ariaLabel"
            class="text-white bg-transparent hover:bg-primary-800 hover:text-white active:bg-primary-900 active:text-white" variant="tertiary" square>
            <template #prefix>
              <Component :is="actionItem.icon" />
            </template>
          </SfButton>
        </nav>

        <form role="search" class="flex md:hidden flex-[100%] my-2" @submit.prevent="search">
          <SfInput v-model="inputValue" type="search" class="[&::-webkit-search-cancel-button]:appearance-none" placeholder="Search" wrapper-class="flex-1 h-10 pr-0" size="base">
            <template #suffix>
              <span class="flex items-center">
                <SfButton variant="tertiary" square aria-label="search" type="submit" class="rounded-l-none hover:bg-transparent active:bg-transparent">
                  <SfIconSearch />
                </SfButton>
              </span>
            </template>
          </SfInput>
        </form>
      </div>

      <!-- Desktop dropdown -->
      <nav ref="floatingRef">
        <ul class="hidden md:flex place-content-center px-6 py-2 bg-white border-b border-b-neutral-200 border-b-solid"
          @blur="
            (event) => {
              if (!(event.currentTarget as Element).contains(event.relatedTarget as Element)) {
                close();
              }
            }">
          <li v-for="(menuNode, index) in content.children" :key="menuNode.key">
            <SfButton
              ref="triggerRefs" variant="tertiary"
              class="group mr-2 !text-neutral-900 hover:!bg-neutral-200 hover:!text-neutral-700 active:!bg-neutral-300 active:!text-neutral-900"
              @mouseenter="openMenu([menuNode.key])"
              @click="openMenu([menuNode.key])">
              <span>{{ menuNode.value.label }}</span>
              <SfIconChevronRight class="rotate-90 text-neutral-500 group-hover:text-neutral-700 group-active:text-neutral-900" />
            </SfButton>

            <div v-if="isOpen && activeNode.length === 1 && activeNode[0] === menuNode.key"
              :key="activeMenu.key" ref="megaMenuRef" :style="style" tabindex="0"
              class="hidden md:grid gap-x-6 bg-white shadow-lg p-6 left-0 right-0 outline-none  place-items-center"
              @mouseleave="close()"
              @keydown.esc="focusTrigger(index)">
              <template v-for="node in activeMenu.children" :key="node.key">
                <template v-if="node.isLeaf">
                  <SfListItem tag="router-link" :to="node.value.link" size="sm" class="typography-text-sm mb-2 text-center">
                    {{ node.value.label }}
                  </SfListItem>
                </template>
                <div v-else>
                  <p class="typography-text-base font-medium text-neutral-900 whitespace-nowrap px-4 py-1.5 border-b border-b-neutral-200 border-b-solid">
                    {{ node.value.label }}
                  </p>
                  <ul class="mt-2">
                    <li v-for="child in node.children" :key="child.key">
                      <SfListItem tag="router-link" :to="child.value.link" size="sm" class="typography-text-sm py-1.5">
                        {{ child.value.label }}
                      </SfListItem>
                    </li>
                  </ul>
                </div>
              </template>
            </div>
          </li>
        </ul>
      </nav>

      <!-- Mobile drawer -->
      <div v-if="isOpen" class="md:hidden fixed inset-0 bg-neutral-500 bg-opacity-50" />
      <SfDrawer ref="drawerRef" v-model="isOpen" placement="left" class="md:hidden right-[50px] max-w-[376px] bg-white overflow-y-auto">
        <nav>
        <div class="flex items-center justify-between p-4 border-b border-b-neutral-200 border-b-solid">
          <p class="typography-text-base font-medium">Ver por Categorias</p>
          <SfButton variant="tertiary" square aria-label="Close menu" class="ml-2" @click="close()">
            <SfIconClose class="text-neutral-500" />
          </SfButton>
        </div>
        <ul class="mt-2 mb-6">
          <li v-if="activeMenu.key !== 'root'">
            <SfListItem size="lg" tag="button" type="button"
              class="border-b border-b-neutral-200 border-b-solid"
              @click="goBack()">
              <div class="flex items-center">
                <SfIconArrowBack class="text-neutral-500" />
                <p class="ml-5 font-medium">{{ activeMenu.value.label }}</p>
              </div>
            </SfListItem>
          </li>
          <template v-for="node in activeMenu.children" :key="node.value.label">
            <li v-if="node.isLeaf">
              <SfListItem size="lg" tag="a" :href="node.value.link" class="first-of-type:mt-2">
                <div class="flex items-center">
                  <p class="text-left">{{ node.value.label }}</p>
                </div>
              </SfListItem>
            </li>
            <li v-else>
              <SfListItem size="lg" tag="button" type="button" @click="goNext(node.key)">
                <div class="flex justify-between items-center">
                  <div class="flex items-center">
                    <p class="text-left">{{ node.value.label }}</p>
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
  SfIconShoppingCart,
  SfIconFavorite,
  SfIconClose,
  SfButton,
  SfDrawer,
  SfListItem,
  SfIconChevronRight,
  SfIconMenu,
  SfIconArrowBack,
  useDisclosure,
  useTrapFocus,
  useDropdown,
  SfInput,
  SfIconSearch,
} from '@storefront-ui/vue';
import { ref, computed, onMounted } from 'vue'
import { unrefElement } from '@vueuse/core';
import type { Category } from '@/types/category'
// import { useCategoryStore } from '@/stores/categoryStore'
import LogoClothing from '@/assets/LogoClothing.svg'

const findNode = (keys: string[], node: Category): Category => {
  if (keys.length > 1) {
    const [currentKey, ...restKeys] = keys;
    return findNode(restKeys, node.children?.find((child) => child.key === currentKey) || node);
  } else {
    return node.children?.find((child) => child.key === keys[0]) || node;
  }
};

const { close, open, isOpen } = useDisclosure();
const { referenceRef, floatingRef, style } = useDropdown({
  isOpen,
  onClose: close,
  placement: 'bottom-start',
  middleware: [],
});

const drawerRef = ref();
const megaMenuRef = ref();
const triggerRefs = ref();
const activeNode = ref<string[]>([]);

const activeMenu = computed(() => findNode(activeNode.value, content));

const trapFocusOptions = {
  activeState: isOpen,
  arrowKeysUpDown: true,
  initialFocus: 'container',
} as const;
useTrapFocus(
  computed(() => megaMenuRef.value?.[0]),
  trapFocusOptions,
);
useTrapFocus(drawerRef, trapFocusOptions);

const openMenu = (menuType: string[]) => {
  activeNode.value = menuType;
  open();
};

const goBack = () => {
  activeNode.value = activeNode.value.slice(0, activeNode.value.length - 1);
};

const goNext = (key: string) => {
  activeNode.value = [...activeNode.value, key];
};

const focusTrigger = (index: number) => {
  unrefElement(triggerRefs.value[index]).focus();
};

const inputValue = ref('');

const search = () => {
  alert(`Successfully found 10 results for ${inputValue.value}`);
};

const actionItems = [
  {
    icon: SfIconShoppingCart,
    label: '',
    ariaLabel: 'Cart',
    role: 'button',
  },
  {
    icon: SfIconFavorite,
    label: '',
    ariaLabel: 'Wishlist',
    role: 'button',
  },
];


// CUSTOM CODE
// const categoryStore = useCategoryStore()
onMounted(() => {
  // categoryStore.loadCategories()
});

const content: Category = {
  key: 'root',
  value: { label: '' },
  isLeaf: false,
  children: [
    {
      key: 'TOPS',
      value: {
        label: 'Tops',
      },
      isLeaf: false,
      children: [
        {
          key: 'ALL_TOPS',
          value: { label: "Todo en Tops", link: '/category/Tops' },
          isLeaf: true,
        },
        {
          key: 'CATEGORIES',
          value: { label: '' },
          isLeaf: false,
          children: [
            {
              key: 'BLUSAS',
              value: { label: 'Blusas', link: '/category/Blusas' },
              isLeaf: true,
            },
            {
              key: 'TOP',
              value: { label: 'Tops', link: '/category/Top' },
              isLeaf: true,
            },
            {
              key: 'BODY_SUIT',
              value: { label: 'BodySuits', link: '/category/Bodysuit' },
              isLeaf: true,
            },
            {
              key: 'CHALECOS',
              value: { label: 'Chalecos', link: '/category/Chaleco' },
              isLeaf: true,
            },
          ],
        },
      ],
    },
    {
      key: 'VESTIDOS',
      value: {
        label: 'Vestidos',
      },
      isLeaf: false,
      children: [
        {
          key: 'ALL_VESTIDOS',
          value: { label: "Todos en Vestidos", link: '/category/Vestidos' },
          isLeaf: true,
        },
        {
          key: 'CATEGORIES',
          value: { label: '' },
          isLeaf: false,
          children: [
            {
              key: 'MAXI',
              value: { label: 'Maxi Vestidos', link: '/category/Maxi Vestidos' },
              isLeaf: true,
            },
            {
              key: 'MIDI',
              value: { label: 'Midi Vestidos', link: '/category/Midi Vestidos' },
              isLeaf: true,
            },
            {
              key: 'CORTOS',
              value: { label: 'Vestidos Cortos', link: '/category/Vestidos Cortos' },
              isLeaf: true,
            },
          ],
        }
      ],
    },
    {
      key: 'BOTTOMS',
      value: {
        label: 'Bottoms',
      },
      isLeaf: false,
      children: [
        {
          key: 'ALL_BOTTOMS',
          value: { label: 'Todos en Bottoms', link: '/category/Bottoms' },
          isLeaf: true,
        },
        {
          key: 'CATEGORIES',
          value: { label: '' },
          isLeaf: false,
          children: [
            {
              key: 'FALDAS',
              value: { label: 'Faldas', link: '/category/Faldas' },
              isLeaf: true,
            },
            {
              key: 'SHORTS',
              value: { label: 'Shorts', link: '/category/Shorts' },
              isLeaf: true,
            },
            {
              key: 'FALDA_SHORTS',
              value: { label: 'Falda Shorts', link: '/category/Falda-Shorts' },
              isLeaf: true,
            },
          ],
        },
      ],
    },
    {
      key: 'PANTALONES',
      value: {
        label: 'Pantalones',
      },
      isLeaf: false,
      children: [
        {
          key: 'ALL_PANTALONES',
          value: { label: 'Todos en Pantalones', link: '/category/Pantalones' },
          isLeaf: true,
        },
        {
          key: 'CATEGORIES',
          value: { label: '' },
          isLeaf: false,
          children: [
            {
              key: 'JEANS',
              value: { label: 'Jeans', link: '/category/Jeans' },
              isLeaf: true,
            },
            {
              key: 'PALAZZOS',
              value: { label: 'Palazzos', link: '/category/Palazzos' },
              isLeaf: true,
            }
          ],
        },
      ],
    },
    {
      key: 'ENTERIZOS',
      value: {
        label: 'Enterizos',
      },
      isLeaf: false,
      children: [
        {
          key: 'ALL_ENTERIZOS',
          value: { label: 'Todos en Enterizos', link: '/category/Enterizos' },
          isLeaf: true,
        },
        {
          key: 'CATEGORIES',
          value: { label: '' },
          isLeaf: false,
          children: [
            {
              key: 'JUMPSUITS',
              value: { label: 'Jumpsuits', link: '/category/Jumpsuits - Largos' },
              isLeaf: true,
            },
            {
              key: 'ROMPERS',
              value: { label: 'Rompers', link: '/category/Rompers - Cortos' },
              isLeaf: true,
            }
          ],
        },
      ],
    },
    {
      key: 'CHAQUETAS',
      value: {
        label: 'Chaquetas',
      },
      isLeaf: false,
      children: [
        {
          key: 'ALL_CHAQUETAS',
          value: { label: 'Todos en Chaquetas', link: '/category/Chaquetas' },
          isLeaf: true,
        },
        {
          key: 'CATEGORIES',
          value: { label: '' },
          isLeaf: false,
          children: [
            {
              key: 'BLAZERS',
              value: { label: 'Blazers', link: '/category/Blazers' },
              isLeaf: true,
            },
            {
              key: 'SUETER',
              value: { label: 'Sueter', link: '/category/Sueter' },
              isLeaf: true,
            },
            {
              key: 'KIMONOS',
              value: { label: 'Kimonos', link: '/category/Kimonos' },
              isLeaf: true,
            },
            {
              key: 'DENIM',
              value: { label: ' Chaquetas Denim', link: '/category/Chaquetas Denim' },
              isLeaf: true,
            }
          ],
        },
      ],
    },
    {
      key: 'ACCESORIOS',
      value: {
        label: 'Accesorios',
      },
      isLeaf: false,
      children: [
        {
          key: 'ALL_ACCESORIES',
          value: { label: 'Todos en Accesorios', link: '/category/Accesorios' },
          isLeaf: true,
        },
        {
          key: 'CATEGORIES',
          value: { label: '' },
          isLeaf: false,
          children: [
            {
              key: 'CARTERAS',
              value: { label: 'Carteras', link: '/category/Carteras' },
              isLeaf: true,
            },
            {
              key: 'BILLETERAS',
              value: { label: 'Billeteras', link: '/category/Billeteras' },
              isLeaf: true,
            },
          ],
        },
      ],
    },
  ],
};
</script>
