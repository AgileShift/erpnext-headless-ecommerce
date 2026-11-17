import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

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

import ProductAttributeChip from '@/features/catalog/components/ProductAttributeChip.vue'

describe('ProductAttributeChip', () => {
  it('keeps size options circular with a stable minimum width', () => {
    const wrapper = mount(ProductAttributeChip, {
      props: { attributeName: 'Talla', value: 'L', label: 'L', modelValue: false },
    })

    expect(wrapper.get('label').classes()).toContain('min-w-10')
    expect(wrapper.get('input').attributes('value')).toBe('L')
  })

  it('renders unavailable options as disabled', () => {
    const wrapper = mount(ProductAttributeChip, {
      props: {
        attributeName: 'Color',
        value: 'Rojo',
        label: 'Rojo',
        modelValue: false,
        available: false,
      },
    })

    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
  })

  it('allows an active filter option to be deselected explicitly', async () => {
    const wrapper = mount(ProductAttributeChip, {
      props: {
        attributeName: 'Talla',
        value: 'M',
        label: 'M',
        modelValue: true,
        allowDeselect: true,
      },
    })

    await wrapper.get('input').setValue(false)

    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
  })
})
