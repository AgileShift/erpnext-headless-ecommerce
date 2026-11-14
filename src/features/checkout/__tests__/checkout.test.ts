import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
vi.hoisted(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    }),
  })
})
import CheckoutView from '../pages/CheckoutView.vue'
import { useSelectionStore } from '@/features/cart/stores/selectionStore'
import OrderDetailView from '@/features/orders/pages/OrderDetailView.vue'
import { createRouter, createMemoryHistory } from 'vue-router'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})
describe('checkout preview', () => {
  it('shows an empty state without presenting a checkout form', () => {
    const wrapper = mount(CheckoutView, { global: { stubs: { RouterLink: true } } })
    expect(wrapper.find('input[autocomplete="street-address"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Costo de envío por confirmar.')
    expect(wrapper.text()).toContain('Tu carrito está vacío')
    expect(wrapper.find('form').exists()).toBe(false)
  })
  it('reviews both currencies and completes a simulation without clearing the real cart', async () => {
    const cart = useSelectionStore()
    cart.items = [
      {
        item_code: 'test',
        item_name: 'Sandalia',
        image: '',
        attributes: {},
        qty: 2,
        price: {
          price_list_rate: 10,
          local_price_list_rate: 366.24,
          formatted_price: '$10',
          local_formatted_price: 'C$366.24',
        },
      },
    ]
    const wrapper = mount(CheckoutView, { global: { stubs: { RouterLink: true } } })
    await wrapper.find('input[autocomplete="name"]').setValue('Persona de prueba')
    await wrapper.find('input[type="tel"]').setValue('88888888')
    await wrapper.find('input[value="shipping"]').setValue()
    expect(
      wrapper.find('input[autocomplete="street-address"]').attributes('required'),
    ).toBeDefined()
    await wrapper.find('input[autocomplete="street-address"]').setValue('Dirección de prueba')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('C$732.48')
    expect(wrapper.text()).toContain('Referencia: $20.00 USD')
    expect(wrapper.text()).toContain('Costo de envío por confirmar.')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Editar datos')!
      .trigger('click')
    expect(wrapper.find('input[autocomplete="street-address"]').element).toHaveProperty(
      'value',
      'Dirección de prueba',
    )
    await wrapper.find('form').trigger('submit')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Simular confirmación')!
      .trigger('click')
    expect(wrapper.text()).toContain('No se ha creado ningún pedido')
    expect(cart.items).toHaveLength(1)
    expect(cart.count).toBe(2)
  })
  it('does not show another order for an unknown identifier', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/account/orders/:id', component: OrderDetailView }],
    })
    await router.push('/account/orders/unknown')
    await router.isReady()
    const wrapper = mount(OrderDetailView, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Pedido no encontrado')
    expect(wrapper.text()).not.toContain('Sandalia')
  })
})
