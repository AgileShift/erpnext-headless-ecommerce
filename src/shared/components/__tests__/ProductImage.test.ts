import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProductImage from '@/shared/components/ProductImage.vue'
import { PRODUCT_IMAGE_PLACEHOLDER } from '@/shared/utils/productImages'

describe('ProductImage', () => {
  it('uses responsive Imgur variants and settles on the local fallback after one error', async () => {
    const wrapper = mount(ProductImage, {
      props: {
        src: 'https://i.imgur.com/example.jpg',
        alt: 'Producto',
        responsive: true,
      },
    })
    const image = wrapper.get('img')

    expect(image.attributes('src')).toBe('https://i.imgur.com/examplel.jpg')
    expect(image.attributes('srcset')).toContain('https://i.imgur.com/exampleh.jpg 1024w')

    await image.trigger('error')

    expect(image.attributes('src')).toBe(PRODUCT_IMAGE_PLACEHOLDER)
    expect(image.element.srcset).toBe('')
  })

  it('can handle a new failed image after the source changes', async () => {
    const wrapper = mount(ProductImage, {
      props: { src: 'https://example.com/first.jpg', alt: 'Producto' },
    })

    await wrapper.get('img').trigger('error')
    await wrapper.setProps({ src: 'https://example.com/second.jpg' })
    await wrapper.get('img').trigger('error')

    expect(wrapper.get('img').attributes('src')).toBe(PRODUCT_IMAGE_PLACEHOLDER)
  })
})
