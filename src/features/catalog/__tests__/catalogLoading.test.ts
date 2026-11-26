import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
vi.hoisted(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    }),
  })
})
import CatalogView from '../pages/CatalogView.vue'
import { useProductStore } from '../stores/productStore'
import { fortechConfig } from '@/sites/fortech/config'
import { useItemAttributeStore } from '../stores/itemAttributeStore'
import { useCategoryStore } from '../stores/categoryStore'

const response = (data: unknown, ok = true) =>
  ({ ok, status: ok ? 200 : 500, json: async () => ({ data }) }) as Response
const item = { item_code: 'shirt', item_name: 'Camisa', variants: [] }

beforeEach(() => {
  setActivePinia(createPinia())
  vi.restoreAllMocks()
})

describe('catalog loading', () => {
  it('sends all selected filters in one request using the new catalog parameters', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response([]))
    await useProductStore().loadProducts(true, ['Ropa', 'Calzado'], ['S', 'M'], ['Negro'])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = new URL(String(fetchMock.mock.calls[0]?.[0]))
    expect(url.origin).toBe('http://clothing.localhost:8000')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      item_group: 'Ropa,Calzado',
      attributes: JSON.stringify({ Talla: ['S', 'M'], Color: ['Negro'] }),
      sale: '1',
      sort: 'asc',
      start: '0',
      limit: '33',
    })
  })

  it('reads expanded API attributes without changing their names or values', () => {
    const product = useProductStore().formatProduct({
      ...item,
      variants: [{
        item_code: 'shirt-m',
        attributes: {
          Talla: { value: 'Medium', abbr: 'M' },
          ' Talla': { value: ' Medium', abbr: 'Other' },
          Color: 'Negro',
        },
      }],
    })
    expect(product.variants[0]?.attributes).toEqual({
      Talla: 'Medium',
      ' Talla': ' Medium',
      Color: 'Negro',
    })
    expect(product.variants[0]?.attributeAbbreviations).toEqual({ Talla: 'M', ' Talla': 'Other' })
  })

  it('keeps approved image attachments separate for the product and each variant', () => {
    const store = useProductStore()
    const product = store.formatProduct({
      item_code: 'shirt', item_name: 'Camisa', image: '/files/main.jpg',
      images: [{ url: '/files/front.jpg' }, { url: 'https://example.com/outside.jpg' }, { url: '/private/files/hidden.jpg' }],
      variants: [
        { item_code: 'red', attributes: { Color: 'Rojo' }, images: [{ url: '/files/red.jpg' }] },
        { item_code: 'blue', attributes: { Color: 'Azul' } },
      ],
    })
    expect(product.images).toHaveLength(1)
    expect(product.images?.[0]).toContain('/files/front.jpg')
    expect(product.variants[0]?.images?.[0]).toContain('/files/red.jpg')
    expect(product.variants[1]?.images).toEqual([])
    expect(store.formatProduct({ item_code: 'old', variants: [] }).images).toEqual([])
  })

  it('distinguishes an empty response from HTTP and invalid response errors', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response([], false))
      .mockResolvedValueOnce(response(null))
    const store = useProductStore()
    expect(store.formatProduct(item).item_code).toBe('shirt')
    await store.loadProducts()
    expect(store.catalogErrorPage).toBeNull()
    expect(store.hasMoreProducts).toBe(false)
    expect(fetchMock.mock.calls[0]?.[0]).toContain(
      '/api/v2/method/grupo_real_tools.ecommerce.api.item.get_items',
    )
    await store.loadProducts()
    expect(store.catalogErrorPage).toBe(1)
    expect(store.loading).toBe(false)
    await store.loadProducts()
    expect(store.catalogErrorPage).toBe(1)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('keeps loaded products and retries the failed next page', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(response([item]))
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(response([]))
    const store = useProductStore()
    await store.loadProducts()
    await store.loadProducts(false, null, null, null, 2)
    expect(store.products).toHaveLength(1)
    expect(store.currentPage).toBe(1)
    expect(store.catalogErrorPage).toBe(2)
    await store.loadProducts(false, null, null, null, 2)
    expect(fetchMock.mock.calls[2]?.[0]).toContain('start=33')
    expect(store.hasMoreProducts).toBe(false)
    expect(store.catalogErrorPage).toBeNull()
  })

  it('preserves the selected sort and loaded pages when the catalog remounts', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = new URL(String(input))
      if (!url.pathname.endsWith('.item.get_items')) return response([])
      const code = url.searchParams.get('start') === '0' ? 'shirt' : 'dress'
      return response([{ ...item, item_code: code }])
    })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: CatalogView }],
    })
    await router.push('/')
    await router.isReady()
    const mountCatalog = () => mount(CatalogView, {
      global: {
        plugins: [router],
        stubs: { ProductCard: true, ProductCardSkeleton: true, SfThumbnail: true },
      },
    })
    const wrapper = mountCatalog()
    await flushPromises()
    expect(fetchMock.mock.calls[0]?.[0]).toContain('sort=asc')
    await wrapper.get('select[aria-label="Ordenar productos"]').setValue('desc')
    await flushPromises()
    expect(fetchMock.mock.calls.at(-1)?.[0]).toContain('sort=desc')
    const store = useProductStore()
    await store.loadProducts(false, null, null, null, 2, 'desc')
    const requests = fetchMock.mock.calls.length
    wrapper.unmount()

    const returnedCatalog = mountCatalog()
    await flushPromises()
    expect(returnedCatalog.get('select[aria-label="Ordenar productos"]').element)
      .toHaveProperty('value', 'desc')
    expect(store.currentPage).toBe(2)
    expect(store.products.map((product) => product.item_code)).toEqual(['shirt', 'dress'])
    expect(fetchMock).toHaveBeenCalledTimes(requests)
    returnedCatalog.unmount()
  })

  it('ignores an older response after filters change', async () => {
    let resolveOld!: (value: Response) => void
    vi.spyOn(globalThis, 'fetch')
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOld = resolve
          }),
      )
      .mockResolvedValueOnce(response([]))
    const store = useProductStore()
    const old = store.loadProducts()
    await store.loadProducts(false, ['Ropa'])
    resolveOld(response([item]))
    await old
    expect(store.products).toHaveLength(0)
    expect(store.loading).toBe(false)
  })

  it('offers to clear filters for an empty result and retry a failed request', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response([]))
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: CatalogView }],
    })
    await router.push('/?size=M')
    await router.isReady()
    const wrapper = mount(CatalogView, {
      props: { size: ['M'] },
      global: {
        plugins: [router],
        stubs: {
          ProductCard: true,
          ProductCardSkeleton: true,
          SfChip: true,
          SfThumbnail: true,
          SfButton: { template: '<button><slot /></button>' },
        },
      },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('No encontramos productos con estos filtros')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Limpiar filtros')!
      .trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/')
    expect(
      wrapper
        .findAll('button')
        .find((button) => button.text() === 'Limpiar filtros')!
        .attributes('disabled'),
    ).toBeDefined()
    const store = useProductStore()
    store.catalogErrorPage = 1
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No pudimos cargar los productos')
    expect(wrapper.text()).toContain('Reintentar')
    wrapper.unmount()
  })

  it('shows selected filters in expandable sections without changing the route', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response([]))
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: CatalogView }],
    })
    await router.push('/?size=M&color=Azul')
    await router.isReady()
    const wrapper = mount(CatalogView, {
      props: { size: ['M'], color: ['Azul'] },
      attachTo: document.body,
      global: {
        plugins: [router],
        stubs: { ProductCard: true, ProductCardSkeleton: true, SfChip: true, SfThumbnail: true },
      },
    })
    await flushPromises()
    expect(wrapper.find('summary').text()).toContain('Tallas (1): M')
    expect(wrapper.findAll('summary')[2]?.text()).toContain('Colores (1): Azul')
    expect(
      wrapper.findAll('details').map((details) => details.attributes('open') !== undefined),
    ).toEqual([true, false, false])
    expect(fortechConfig.catalog.filters.initiallyOpen).toEqual(['size', 'category', 'color'])
    await wrapper.find('summary').trigger('click')
    expect(wrapper.findAll('details')[0]?.attributes('open')).toBeUndefined()
    await wrapper.findAll('summary')[1]?.trigger('click')
    expect(wrapper.findAll('details')[1]?.attributes('open')).toBe('')
    expect(router.currentRoute.value.fullPath).toBe('/?size=M&color=Azul')
    await wrapper
      .findAll('button')
      .find((button) => button.text().startsWith('Filtros'))!
      .trigger('click')
    await flushPromises()
    const drawer = wrapper.get('[data-testid="drawer"]')
    expect(drawer.attributes('role')).toBe('dialog')
    expect(drawer.attributes('aria-modal')).toBe('true')
    expect(document.body.style.overflow).toBe('hidden')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Ver productos')!
      .trigger('click')
    expect(wrapper.find('[data-testid="drawer"]').exists()).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')
    wrapper.unmount()
  })

  it('searches color labels locally while preserving the selected color and route', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response([]))
    const attributes = useItemAttributeStore()
    attributes.attributes.Color = [
      { value: 'Rojo', abbr: null },
      { value: 'Rojo vino', abbr: null },
      { value: 'Azul', abbr: null },
    ]
    attributes.loaded = true
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: CatalogView }],
    })
    await router.push('/?color=Azul')
    await router.isReady()
    const wrapper = mount(CatalogView, {
      props: { color: ['Azul'] },
      global: {
        plugins: [router],
        stubs: { ProductCard: true, ProductCardSkeleton: true, SfThumbnail: true },
      },
    })
    await flushPromises()
    const calls = fetchMock.mock.calls.length
    const search = wrapper.get('input[aria-label="Buscar color"]')
    await search.setValue('ROJO')
    expect(wrapper.find('input[value="Rojo"]').exists()).toBe(true)
    expect(wrapper.find('input[value="Rojo vino"]').exists()).toBe(true)
    expect(wrapper.find('input[value="Azul"]').exists()).toBe(false)
    expect(wrapper.findAll('summary')[2]?.text()).toContain('Azul')
    await search.setValue('inexistente')
    expect(wrapper.text()).toContain('No encontramos colores con ese nombre.')
    expect(fetchMock).toHaveBeenCalledTimes(calls)
    expect(router.currentRoute.value.fullPath).toBe('/?color=Azul')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Limpiar búsqueda')!
      .trigger('click')
    expect(wrapper.find('input[value="Azul"]').exists()).toBe(true)
    expect((wrapper.get('input[value="Azul"]').element as HTMLInputElement).checked).toBe(true)
    wrapper.unmount()
  })

  it('searches categories locally without changing the selected category or route', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response([]))
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: CatalogView }],
    })
    await router.push('/category/Blusas')
    await router.isReady()
    const categories = useCategoryStore()
    categories.loaded = true
    categories.categoryTree.children = [
      { name: 'Blusas', parent_item_group: null, is_group: false, children: [] },
      { name: 'Maxi Vestidos', parent_item_group: null, is_group: false, children: [] },
      { name: 'Jumpsuits - Largos', parent_item_group: null, is_group: false, children: [] },
    ]
    const wrapper = mount(CatalogView, {
      props: { category: ['Blusas'] },
      global: {
        plugins: [router],
        stubs: { ProductCard: true, ProductCardSkeleton: true, SfThumbnail: true },
      },
    })
    await flushPromises()
    const calls = fetchMock.mock.calls.length
    const search = wrapper.get('input[aria-label="Buscar categoría"]')
    await search.setValue('jumpsuits')
    expect(wrapper.find('input[value="Jumpsuits - Largos"]').exists()).toBe(true)
    expect(wrapper.find('input[value="Maxi Vestidos"]').exists()).toBe(false)
    expect(wrapper.findAll('summary')[1]?.text()).toContain('Blusas')
    expect(fetchMock).toHaveBeenCalledTimes(calls)
    expect(router.currentRoute.value.fullPath).toBe('/category/Blusas')
    await wrapper
      .get('input[value="Jumpsuits - Largos"]')
      .element.closest('label')!
      .click()
    await wrapper.vm.$nextTick()
    expect(
      (wrapper.get('input[value="Jumpsuits - Largos"]').element as HTMLInputElement).checked,
    ).toBe(true)
    await search.setValue('inexistente')
    expect(wrapper.text()).toContain('No encontramos categorías con ese nombre.')
    wrapper.unmount()
  })
})
