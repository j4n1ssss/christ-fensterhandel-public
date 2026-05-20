/**
 * Unit tests for cart store operations and format helpers.
 */
import { useCartStore } from '@/lib/cart/store'
import { formatEUR, calculateMwSt } from '@/lib/cart/format'
import type { CartItem } from '@/lib/cart/types'
import type { KonfiguratorSelections } from '@/lib/konfigurator/types'

// Helper: create a minimal CartItem for testing
function createTestItem(overrides: Partial<CartItem> = {}): CartItem {
  const defaultSelections: KonfiguratorSelections = {
    produkttyp: 'pt-1',
    material: 'mat-1',
    profil: 'prof-1',
    fluegelanzahl: 'fl-1',
    zusatzlichter: [],
    oeffnungsarten: [],
    fensterform: 'ff-1',
    masse: { breite: 1000, hoehe: 1200 },
    farbeAussen: 'fa-1',
    farbeInnen: 'fi-1',
    dichtungsfarbe: 'df-1',
    gleichWieAussen: false,
    verglasung: 'vg-1',
    schallschutz: null,
    sicherheitsglas: null,
    glasdekor: null,
    sprossen: null,
    extras: [],
  }

  return {
    id: overrides.id ?? 'test-item-' + Math.random().toString(36).slice(2, 8),
    selections: overrides.selections ?? defaultSelections,
    resolvedNames: overrides.resolvedNames ?? {
      produkttyp: 'Fenster',
      material: 'Kunststoff',
      profil: 'Standard',
      fluegelanzahl: '2-flügelig',
      fensterform: 'Rechteck',
      farbeAussen: 'Weiß',
      farbeInnen: 'Weiß',
      dichtungsfarbe: 'Schwarz',
      verglasung: '3-fach',
      schallschutz: '',
      sicherheitsglas: '',
      glasdekor: '',
      sprossen: '',
      extras: [],
      masse: { breite: 1000, hoehe: 1200 },
    },
    previewPrice: overrides.previewPrice ?? 450.0,
    quantity: overrides.quantity ?? 1,
    addedAt: overrides.addedAt ?? new Date().toISOString(),
  }
}

// Reset cart state before each test
beforeEach(() => {
  useCartStore.setState({
    items: [],
    discountCode: null,
    discountResult: null,
    editingCartItemId: null,
  })
})

describe('Cart Store', () => {
  describe('addItem', () => {
    it('adds an item to an empty cart', () => {
      const item = createTestItem({ id: 'item-1', previewPrice: 500 })
      useCartStore.getState().addItem(item)

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].id).toBe('item-1')
      expect(items[0].previewPrice).toBe(500)
    })

    it('adds a second item to the cart (CART-05)', () => {
      const item1 = createTestItem({ id: 'item-1', previewPrice: 400 })
      const item2 = createTestItem({ id: 'item-2', previewPrice: 600 })
      useCartStore.getState().addItem(item1)
      useCartStore.getState().addItem(item2)

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(2)
      expect(items[0].id).toBe('item-1')
      expect(items[1].id).toBe('item-2')
    })
  })

  describe('removeItem', () => {
    it('removes the correct item by ID', () => {
      const item1 = createTestItem({ id: 'item-1' })
      const item2 = createTestItem({ id: 'item-2' })
      useCartStore.getState().addItem(item1)
      useCartStore.getState().addItem(item2)

      useCartStore.getState().removeItem('item-1')

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].id).toBe('item-2')
    })
  })

  describe('updateQuantity', () => {
    it('changes quantity for a given item', () => {
      const item = createTestItem({ id: 'item-1', quantity: 1 })
      useCartStore.getState().addItem(item)

      useCartStore.getState().updateQuantity('item-1', 5)

      const { items } = useCartStore.getState()
      expect(items[0].quantity).toBe(5)
    })

    it('enforces minimum quantity of 1', () => {
      const item = createTestItem({ id: 'item-1', quantity: 3 })
      useCartStore.getState().addItem(item)

      useCartStore.getState().updateQuantity('item-1', 0)

      const { items } = useCartStore.getState()
      expect(items[0].quantity).toBe(1)
    })
  })

  describe('updateItem', () => {
    it('replaces cart item data by ID', () => {
      const item = createTestItem({ id: 'item-1', previewPrice: 400 })
      useCartStore.getState().addItem(item)

      const updated = createTestItem({ id: 'item-1', previewPrice: 700 })
      useCartStore.getState().updateItem('item-1', updated)

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].previewPrice).toBe(700)
    })
  })

  describe('getSubtotal', () => {
    it('computes subtotal correctly with multiple items and quantities', () => {
      const item1 = createTestItem({ id: 'item-1', previewPrice: 100, quantity: 2 })
      const item2 = createTestItem({ id: 'item-2', previewPrice: 250, quantity: 3 })
      useCartStore.getState().addItem(item1)
      useCartStore.getState().addItem(item2)

      const subtotal = useCartStore.getState().getSubtotal()
      // 100*2 + 250*3 = 200 + 750 = 950
      expect(subtotal).toBe(950)
    })
  })

  describe('clearCart', () => {
    it('empties the cart and clears discount', () => {
      const item = createTestItem({ id: 'item-1' })
      useCartStore.getState().addItem(item)
      useCartStore.getState().setDiscount({
        valid: true,
        code: 'TEST10',
        typ: 'prozent',
        wert: 10,
      })

      useCartStore.getState().clearCart()

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
      expect(state.discountResult).toBeNull()
      expect(state.discountCode).toBeNull()
    })
  })

  describe('editingCartItemId', () => {
    it('stores and clears the editing item ID', () => {
      useCartStore.getState().setEditingItemId('item-42')
      expect(useCartStore.getState().editingCartItemId).toBe('item-42')

      useCartStore.getState().setEditingItemId(null)
      expect(useCartStore.getState().editingCartItemId).toBeNull()
    })
  })

  describe('setDiscount / clearDiscount', () => {
    it('stores discount result', () => {
      useCartStore.getState().setDiscount({
        valid: true,
        code: 'SOMMER2026',
        typ: 'prozent',
        wert: 15,
      })

      const state = useCartStore.getState()
      expect(state.discountResult?.valid).toBe(true)
      expect(state.discountResult?.code).toBe('SOMMER2026')
      expect(state.discountResult?.wert).toBe(15)
    })

    it('clears discount', () => {
      useCartStore.getState().setDiscount({
        valid: true,
        code: 'TEST',
        typ: 'festbetrag',
        wert: 50,
      })
      useCartStore.getState().clearDiscount()

      const state = useCartStore.getState()
      expect(state.discountResult).toBeNull()
      expect(state.discountCode).toBeNull()
    })
  })
})

describe('Format Helpers', () => {
  describe('formatEUR', () => {
    it('formats 1234.5 as German EUR currency', () => {
      const result = formatEUR(1234.5)
      // Intl.NumberFormat('de-DE') uses Euro symbol or EUR depending on locale
      expect(result).toMatch(/1\.234,50/)
      // Accept both EUR and Euro symbol
      expect(result).toMatch(/EUR|\u20AC/)
    })

    it('formats 0 correctly', () => {
      const result = formatEUR(0)
      expect(result).toMatch(/0,00/)
    })
  })

  describe('calculateMwSt', () => {
    it('calculates 19% MwSt correctly', () => {
      const result = calculateMwSt(100, 0.19)
      expect(result.mwst).toBe(19)
      expect(result.brutto).toBe(119)
    })

    it('uses 19% as default rate', () => {
      const result = calculateMwSt(200)
      expect(result.mwst).toBe(38)
      expect(result.brutto).toBe(238)
    })

    it('rounds to cents', () => {
      const result = calculateMwSt(99.99, 0.19)
      // 99.99 * 0.19 = 18.9981 -> rounded to 19.00
      expect(result.mwst).toBe(19)
      expect(result.brutto).toBe(118.99)
    })
  })
})
