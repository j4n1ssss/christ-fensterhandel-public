import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, DiscountResult } from './types'

interface CartState {
  items: CartItem[]
  discountCode: string | null
  discountResult: DiscountResult | null
  editingCartItemId: string | null
}

interface CartActions {
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateItem: (id: string, item: CartItem) => void
  getSubtotal: () => number
  clearCart: () => void
  setEditingItemId: (id: string | null) => void
  setDiscount: (result: DiscountResult) => void
  clearDiscount: () => void
}

type CartStore = CartState & CartActions

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // State
      items: [],
      discountCode: null,
      discountResult: null,
      editingCartItemId: null,

      // Actions
      addItem: (item: CartItem) => {
        set((state) => ({
          items: [...state.items, item],
        }))
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      updateQuantity: (id: string, quantity: number) => {
        const clampedQty = Math.max(1, quantity)
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: clampedQty } : item,
          ),
        }))
      },

      updateItem: (id: string, updatedItem: CartItem) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...updatedItem, id } : item,
          ),
        }))
      },

      getSubtotal: () => {
        const { items } = get()
        return items.reduce(
          (sum, item) => sum + item.previewPrice * item.quantity,
          0,
        )
      },

      clearCart: () => {
        set({
          items: [],
          discountCode: null,
          discountResult: null,
        })
      },

      setEditingItemId: (id: string | null) => {
        set({ editingCartItemId: id })
      },

      setDiscount: (result: DiscountResult) => {
        set({
          discountCode: result.code,
          discountResult: result,
        })
      },

      clearDiscount: () => {
        set({
          discountCode: null,
          discountResult: null,
        })
      },
    }),
    {
      name: 'warenkorb',
      skipHydration: true,
    },
  ),
)
