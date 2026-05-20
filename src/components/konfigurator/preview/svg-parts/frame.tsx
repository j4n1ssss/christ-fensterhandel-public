'use client'

import React from 'react'

export interface FrameProps {
  x: number
  y: number
  width: number
  height: number
  frameColor?: string
  form?: 'rechteck' | 'rundbogen' | 'dreieck'
}

/**
 * SVG outer frame component.
 * Renders the window frame shape (rectangle, arch, or triangle).
 */
export function Frame({
  x,
  y,
  width,
  height,
  frameColor = '#888',
  form = 'rechteck',
}: FrameProps) {
  if (form === 'rundbogen') {
    return (
      <path
        d={`M ${x} ${y + height} V ${y + height * 0.3} Q ${x + width / 2} ${y - height * 0.1} ${x + width} ${y + height * 0.3} V ${y + height} Z`}
        fill="none"
        stroke={frameColor}
        strokeWidth="2.5"
      />
    )
  }

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx="1"
      fill="none"
      stroke={frameColor}
      strokeWidth="2.5"
    />
  )
}
