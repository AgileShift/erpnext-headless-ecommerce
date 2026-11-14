import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
vi.hoisted(() => {
  Object.defineProperty(window, 'matchMedia', { writable: true, value: () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }) })
})
import QuickAddModal from '../components/QuickAddModal.vue'
import { useProductStore } from '../stores/productStore'
import { useSelectionStore } from '@/features/cart/stores/selectionStore'
import type { Product } from '../types/Product'

const price = { price_list_rate: 10, local_price_list_rate: 366, formatted_price: '$10', local_formatted_price: 'C$366' }
const variant = (code: string, color: string, size: string) => ({
  item_code: code, item_name: 'Prenda', item_group: 'Ropa', image: '', variant_of: 'p', actual_qty: 1,
  attributes: { Color: color, Talla: size }, price,
})
const product: Product = {
  catalog_key: 'p', item_code: 'p', item_name: 'Prenda', item_group: 'Ropa', image: '', price,
  price_summary: { type: 'single', min_price: 10, max_price: 10, formatted_price: '$10', local_formatted_price: 'C$366' },
  variants: [variant('red-s', 'Rojo', 'S'), variant('red-m', 'Rojo', 'M'), variant('blue-s', 'Azul', 'S')],
  available_attributes: { Color: ['Rojo', 'Azul'], Talla: ['S', 'M'] }, actual_qty: 3,
}

beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })

const create = () => mount(QuickAddModal, {
  props: { modelValue: false, card: product, color: 'Rojo', productUrl: { path: '/product/p', query: { color: 'Rojo' } } },
  global: { stubs: { Teleport: true, SfModal: { template: '<section><slot /></section>' }, SfButton: { template: '<button><slot /></button>' }, RouterLink: true } },
})

describe('quick add', () => {
  it('loads full variants, preserves the card color and adds the selected size once', async () => {
    vi.spyOn(useProductStore(), 'fetchProduct').mockResolvedValue(product)
    const wrapper = create()
    await wrapper.setProps({ modelValue: true }); await flushPromises()
    expect((wrapper.find('input[value="Rojo"]').element as HTMLInputElement).checked).toBe(true)
    await wrapper.find('input[value="M"]').setValue()
    await wrapper.findAll('button').find((button) => button.text() === 'Agregar al carrito')!.trigger('click')
    expect(useSelectionStore().items[0]).toMatchObject({ item_code: 'red-m', qty: 1 })
    expect(wrapper.emitted('added')).toHaveLength(1)
    await wrapper.setProps({ modelValue: false }); await wrapper.setProps({ modelValue: true }); await flushPromises()
    await wrapper.find('input[value="M"]').setValue()
    expect(wrapper.text()).toContain('Ya agregaste la cantidad disponible')
  })

  it('shows a safe fallback when loading fails', async () => {
    vi.spyOn(useProductStore(), 'fetchProduct').mockRejectedValue(new Error('offline'))
    const wrapper = create()
    await wrapper.setProps({ modelValue: true }); await flushPromises()
    expect(wrapper.text()).toContain('No pudimos cargar las opciones')
    expect(useSelectionStore().items).toHaveLength(0)
  })

  it('adds a unique product without attributes directly', async () => {
    const single = { ...variant('single', 'Rojo', 'S'), attributes: {} }
    vi.spyOn(useProductStore(), 'fetchProduct').mockResolvedValue({ ...product, variants: [single], available_attributes: {} })
    const wrapper = create()
    await wrapper.setProps({ modelValue: true }); await flushPromises()
    expect(useSelectionStore().items[0]).toMatchObject({ item_code: 'single', qty: 1 })
    expect(wrapper.emitted('added')).toHaveLength(1)
  })
})
