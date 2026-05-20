'use client'

import React from 'react'

export interface HandleProps {
  /** X position of the wing's left edge */
  wingX: number
  /** Width of the wing */
  wingWidth: number
  /** Y center position for the handle */
  centerY: number
  /** Handle side: 'links' or 'rechts' */
  griffSeite?: 'links' | 'rechts' | null
  frameColor?: string
}

/**
 * SVG handle component.
 * Small vertical line on the wing edge representing the window handle.
 */
export function Handle({
  wingX,
  wingWidth,
  centerY,
  griffSeite = 'rechts',
  frameColor = '#888',
}: HandleProps) {
  if (!griffSeite) return null

  const handleLength = 10
  const handleX = griffSeite === 'links'
    ? wingX + 5
    : wingX + wingWidth - 5

  return (
    <rect
      x={handleX - 1.5}
      y={centerY - handleLength / 2}
      width="3"
      height={handleLength}
      rx="1"
      fill={frameColor}
    />
  )
}
