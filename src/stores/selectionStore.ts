import { defineStore } from 'pinia'
import type { ProductPrice, ProductVariantAttributes } from '@/types/Product'

const STORAGE_KEY = 'local-selection'

export interface SelectionItem {
  item_code: string
  product_item_code?: string
  product_name?: string
  item_name: string
  image: string
  attributes: ProductVariantAttributes
  price: ProductPrice
  qty: number
  maxQty?: number
}

const loadItems = (): SelectionItem[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export const useSelectionStore = defineStore('selection', {
  state: () => ({
    items: loadItems(),
  }),

  getters: {
    count: (state) => state.items.reduce((total, item) => total + item.qty, 0),
    total: (state) =>
      state.items.reduce((total, item) => total + item.price.price_list_rate * item.qty, 0),
  },

  actions: {
    reloadFromStorage() {
      this.items = loadItems()
    },

    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
    },

    addItem(item: Omit<SelectionItem, 'qty'>, maxQty = Infinity) {
      if (maxQty < 1) {
        return
      }

      const availableQty = Number.isFinite(maxQty) ? Math.floor(maxQty) : undefined
      const existingItem = this.items.find(
        (selectionItem) => selectionItem.item_code === item.item_code,
      )

      if (existingItem) {
        existingItem.maxQty = availableQty
        if (existingItem.qty + 1 > maxQty) {
          this.persist()
          return
        }

        existingItem.qty += 1
      } else {
        this.items.push({ ...item, qty: 1, maxQty: availableQty })
      }

      this.persist()
    },

    setQuantity(itemCode: string, qty: number) {
      const item = this.items.find((entry) => entry.item_code === itemCode)
      if (!item || !Number.isSafeInteger(qty) || qty < 0) return
      if (qty === 0) {
        this.removeItem(itemCode)
        return
      }
      if (qty > item.qty && (item.maxQty === undefined || qty > item.maxQty)) return

      item.qty = qty
      this.persist()
    },

    removeItem(itemCode: string) {
      this.items = this.items.filter((item) => item.item_code !== itemCode)
      this.persist()
    },

    clear() {
      this.items = []
      this.persist()
    },
  },
})
