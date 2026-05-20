'use client'

import React, { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/cart/store'

/**
 * Cart icon with item count badge for the navigation header.
 * Uses hydration guard to avoid SSR mismatch — shows badge only after mount.
 */
export function CartBadge() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setMounted(true)
  }, [])

  const itemCount = useCartStore((s) => s.items.length)

  return (
    <div className="relative inline-flex items-center">
      <ShoppingCart className="size-5 text-black-950" aria-hidden />
      {mounted && itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 font-mono text-[10px] font-bold leading-none tabular-nums text-black-950">
          {itemCount}
        </span>
      )}
    </div>
  )
}
