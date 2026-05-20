'use client'

import React from 'react'

export interface WingProps {
  x: number
  y: number
  width: number
  height: number
  frameColor?: string
}

/**
 * SVG wing component.
 * Renders a lighter inner rectangle representing a window wing.
 */
export function Wing({
  x,
  y,
  width,
  height,
  frameColor = '#888',
}: WingProps) {
  const inset = 3
  return (
    <rect
      x={x + inset}
      y={y + inset}
      width={width - inset * 2}
      height={height - inset * 2}
      rx="0.5"
      fill="none"
      stroke={frameColor}
      strokeWidth="0.8"
      opacity={0.6}
    />
  )
}
