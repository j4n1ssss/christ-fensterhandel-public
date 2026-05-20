'use client'

import React from 'react'

export interface OpeningIndicatorProps {
  /** X position of the wing's left edge */
  wingX: number
  /** Y position of the wing's top edge */
  wingY: number
  /** Width of the wing */
  wingWidth: number
  /** Height of the wing */
  wingHeight: number
  /** Opening type slug */
  oeffnungsartSlug?: string | null
  /** Handle side for Dreh/Dreh-Kipp (determines hinge side) */
  griffSeite?: 'links' | 'rechts' | null
  color?: string
}

/**
 * SVG opening type indicator.
 * Shows a visual symbol inside the wing:
 * - Fest: X mark (diagonal lines)
 * - Kipp: small triangle at bottom (pointing up)
 * - Dreh: curved arrow from hinge side
 * - Dreh-Kipp: both triangle + curved arrow
 */
export function OpeningIndicator({
  wingX,
  wingY,
  wingWidth,
  wingHeight,
  oeffnungsartSlug,
  griffSeite,
  color = '#666',
}: OpeningIndicatorProps) {
  if (!oeffnungsartSlug) return null

  const cx = wingX + wingWidth / 2
  const cy = wingY + wingHeight / 2
  const inset = 8

  switch (oeffnungsartSlug) {
    case 'fest': {
      // X mark (diagonal lines)
      return (
        <g stroke={color} strokeWidth="0.8" opacity={0.5}>
          <line
            x1={wingX + inset}
            y1={wingY + inset}
            x2={wingX + wingWidth - inset}
            y2={wingY + wingHeight - inset}
          />
          <line
            x1={wingX + wingWidth - inset}
            y1={wingY + inset}
            x2={wingX + inset}
            y2={wingY + wingHeight - inset}
          />
        </g>
      )
    }

    case 'kipp': {
      // Triangle at bottom edge pointing up
      const triBase = wingWidth * 0.3
      const triHeight = wingHeight * 0.15
      const bottom = wingY + wingHeight - inset
      return (
        <polygon
          points={`${cx},${bottom - triHeight} ${cx - triBase / 2},${bottom} ${cx + triBase / 2},${bottom}`}
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          opacity={0.5}
        />
      )
    }

    case 'dreh': {
      // Curved line from hinge side to opposite side
      const isHingeLeft = griffSeite === 'rechts'
      const startX = isHingeLeft ? wingX + inset : wingX + wingWidth - inset
      const endX = isHingeLeft ? wingX + wingWidth - inset : wingX + inset
      const topY = wingY + inset

      return (
        <g stroke={color} strokeWidth="0.8" opacity={0.5} fill="none">
          {/* Line from bottom hinge to top center */}
          <line x1={startX} y1={wingY + wingHeight - inset} x2={startX} y2={topY} />
          <line x1={startX} y1={topY} x2={endX} y2={topY} />
          {/* Small arrow at end */}
          <line
            x1={endX}
            y1={topY}
            x2={isHingeLeft ? endX - 4 : endX + 4}
            y2={topY + 4}
          />
        </g>
      )
    }

    case 'dreh-kipp': {
      // Both: triangle at bottom + curved arrow from hinge
      const isHingeLeft = griffSeite === 'rechts'
      const startX = isHingeLeft ? wingX + inset : wingX + wingWidth - inset
      const endX = isHingeLeft ? wingX + wingWidth - inset : wingX + inset
      const topY = wingY + inset

      const triBase = wingWidth * 0.3
      const triHeight = wingHeight * 0.12
      const bottom = wingY + wingHeight - inset

      return (
        <g stroke={color} strokeWidth="0.8" opacity={0.5} fill="none">
          {/* Dreh indicator */}
          <line x1={startX} y1={bottom} x2={startX} y2={topY} />
          <line x1={startX} y1={topY} x2={endX} y2={topY} />
          <line
            x1={endX}
            y1={topY}
            x2={isHingeLeft ? endX - 4 : endX + 4}
            y2={topY + 4}
          />
          {/* Kipp indicator (triangle at bottom) */}
          <polygon
            points={`${cx},${bottom - triHeight} ${cx - triBase / 2},${bottom} ${cx + triBase / 2},${bottom}`}
          />
        </g>
      )
    }

    default:
      return null
  }
}
