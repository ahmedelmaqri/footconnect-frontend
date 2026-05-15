import { create } from 'zustand'
import { cartService } from '../services/shopService'

export const useCartStore = create((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true })
    try {
      const res = await cartService.getAll()
      set({ items: res.data })
    } catch (err) {
      console.error(err)
    } finally {
      set({ loading: false })
    }
  },

  addToCart: async (productId, quantity = 1, size = null, color = null) => {
    try {
      await cartService.add({ product_id: productId, quantity, size, color })
      await get().fetchCart()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  },

  updateQuantity: async (id, quantity) => {
    try {
      await cartService.update(id, quantity)
      await get().fetchCart()
    } catch (err) {
      console.error(err)
    }
  },

  removeItem: async (id) => {
    try {
      await cartService.remove(id)
      await get().fetchCart()
    } catch (err) {
      console.error(err)
    }
  },

  clearCart: async () => {
    try {
      await cartService.clear()
      set({ items: [] })
    } catch (err) {
      console.error(err)
    }
  },

  totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
  totalPrice: () => get().items.reduce((acc, item) => {
    const price = item.product?.sale_price || item.product?.price || 0
    return acc + price * item.quantity
  }, 0),
}))