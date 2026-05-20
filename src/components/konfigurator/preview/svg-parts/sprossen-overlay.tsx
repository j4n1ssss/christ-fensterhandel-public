'use client'

import React from 'react'

export interface SprossenOverlayProps {
  x: number
  y: number
  width: number
  height: number
  typ: 'wiener' | 'helima' | 'aufgesetzt'
  color?: string
}

/**
 * SVG sprossen (glazing bars) overlay within a wing.
 * Renders different line patterns based on sprossen type:
 * - Wiener: horizontal + vertical cross lines (standard width)
 * - Helima: similar cross but thinner lines
 * - Aufgesetzt: slightly offset/shadowed lines
 */
export function SprossenOverlay({
  x,
  y,
  width,
  height,
  typ,
  color = '#888',
}: SprossenOverlayProps) {
  const centerX = x + width / 2
  const centerY = y + height / 2

  const strokeWidth = typ === 'helima' ? 0.5 : typ === 'aufgesetzt' ? 1.2 : 0.8
  const opacity = typ === 'aufgesetzt' ? 0.6 : 0.5

  return (
    <g opacity={opacity}>
      {/* Horizontal bar */}
      <line
        x1={x}
        y1={centerY}
        x2={x + width}
        y2={centerY}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Vertical bar */}
      <line
        x1={centerX}
        y1={y}
        x2={centerX}
        y2={y + height}
        stroke={color}
        strokeWidth={strokeWidth}
      />

      {/* Aufgesetzt: shadow offset lines */}
      {typ === 'aufgesetzt' && (
        <>
          <line
            x1={x}
            y1={centerY + 1}
            x2={x + width}
            y2={centerY + 1}
            stroke={color}
            strokeWidth={0.3}
            opacity={0.3}
          />
          <line
            x1={centerX + 1}
            y1={y}
            x2={centerX + 1}
            y2={y + height}
            stroke={color}
            strokeWidth={0.3}
            opacity={0.3}
          />
        </>
      )}
    </g>
  )
}
