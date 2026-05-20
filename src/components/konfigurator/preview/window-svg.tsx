'use client'

import React from 'react'
import { Frame } from './svg-parts/frame'
import { Wing } from './svg-parts/wing'
import { Handle } from './svg-parts/handle'
import { OpeningIndicator } from './svg-parts/opening-indicator'
import { DimensionsLabel } from './svg-parts/dimensions-label'
import { SprossenOverlay } from './svg-parts/sprossen-overlay'
import type { WingOpening } from '@/lib/konfigurator/types'

export interface WindowSVGProps {
  wingCount?: number
  frameColor?: string
  width?: number
  height?: number
  form?: 'rechteck' | 'rundbogen' | 'dreieck'
  wingOpenings?: WingOpening[]
  hasOberlicht?: boolean
  hasUnterlicht?: boolean
  /** Actual dimensions in mm (for label display) */
  masseMm?: { breite: number; hoehe: number } | null
  /** Sprossen type slug for overlay rendering */
  sprossenTyp?: 'wiener' | 'helima' | 'aufgesetzt' | null
  /** Optional: resolve oeffnungsart ID to slug for indicator rendering */
  resolveOaSlug?: (id: string) => string | undefined
}

/**
 * SVG window silhouette for the preview panel.
 * Composed from Frame, Wing, Handle, OpeningIndicator, DimensionsLabel, and SprossenOverlay parts.
 * ViewBox proportions adjust based on actual dimensions (wider windows = wider ratio).
 */
export function WindowSVG({
  wingCount = 1,
  frameColor = '#888',
  width = 100,
  height = 120,
  form = 'rechteck',
  wingOpenings = [],
  hasOberlicht = false,
  hasUnterlicht = false,
  masseMm = null,
  sprossenTyp = null,
  resolveOaSlug,
}: WindowSVGProps) {
  // Use masse to determine aspect ratio of viewBox
  const aspectWidth = masseMm ? masseMm.breite : width
  const aspectHeight = masseMm ? masseMm.hoehe : height

  // Normalize to a reasonable viewBox size (max 140 for labels)
  const scale = Math.min(100 / aspectWidth, 120 / aspectHeight)
  const vbWidth = aspectWidth * scale + 30 // extra space for height label
  const vbHeight = aspectHeight * scale + 20 // extra space for width label

  const padding = 4
  const frameWidth = aspectWidth * scale - padding * 2
  const frameHeight = aspectHeight * scale - padding * 2

  // Calculate vertical space for Oberlicht/Unterlicht
  const lichtHeight = 15
  const topOffset = hasOberlicht ? lichtHeight : 0
  const bottomOffset = hasUnterlicht ? lichtHeight : 0
  const wingAreaHeight = frameHeight - topOffset - bottomOffset
  const wingAreaY = padding + topOffset

  const wingWidth = frameWidth / wingCount

  return (
    <svg
      viewBox={`0 0 ${vbWidth} ${vbHeight}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      role="img"
      aria-label={`Fenstervorschau mit ${wingCount} Flügel`}
    >
      {/* Outer frame */}
      <Frame
        x={padding}
        y={padding}
        width={frameWidth}
        height={frameHeight}
        frameColor={frameColor}
        form={form}
      />

      {/* Oberlicht divider */}
      {hasOberlicht && (
        <line
          x1={padding + 2}
          y1={padding + lichtHeight}
          x2={padding + frameWidth - 2}
          y2={padding + lichtHeight}
          stroke={frameColor}
          strokeWidth="1"
          opacity={0.6}
        />
      )}

      {/* Unterlicht divider */}
      {hasUnterlicht && (
        <line
          x1={padding + 2}
          y1={padding + frameHeight - lichtHeight}
          x2={padding + frameWidth - 2}
          y2={padding + frameHeight - lichtHeight}
          stroke={frameColor}
          strokeWidth="1"
          opacity={0.6}
        />
      )}

      {/* Wing dividers */}
      {Array.from({ length: wingCount - 1 }, (_, i) => {
        const x = padding + wingWidth * (i + 1)
        return (
          <line
            key={`divider-${i}`}
            x1={x}
            y1={wingAreaY + 2}
            x2={x}
            y2={wingAreaY + wingAreaHeight - 2}
            stroke={frameColor}
            strokeWidth="1.5"
          />
        )
      })}

      {/* Wings with handles, opening indicators, and sprossen */}
      {Array.from({ length: wingCount }, (_, i) => {
        const wX = padding + wingWidth * i
        const wY = wingAreaY
        const wW = wingWidth
        const wH = wingAreaHeight

        const wingOpening = wingOpenings.find((w) => w.wingIndex === i)
        const griffSeite = wingOpening?.griffSeite ?? null
        const oaId = wingOpening?.oeffnungsart ?? null
        const oaSlug = oaId && resolveOaSlug ? resolveOaSlug(oaId) : undefined

        return (
          <g key={`wing-group-${i}`}>
            <Wing
              x={wX}
              y={wY}
              width={wW}
              height={wH}
              frameColor={frameColor}
            />

            <Handle
              wingX={wX}
              wingWidth={wW}
              centerY={wY + wH / 2}
              griffSeite={griffSeite}
              frameColor={frameColor}
            />

            <OpeningIndicator
              wingX={wX}
              wingY={wY}
              wingWidth={wW}
              wingHeight={wH}
              oeffnungsartSlug={oaSlug}
              griffSeite={griffSeite}
              color={frameColor}
            />

            {/* Sprossen overlay per wing */}
            {sprossenTyp && (
              <SprossenOverlay
                x={wX + 3}
                y={wY + 3}
                width={wW - 6}
                height={wH - 6}
                typ={sprossenTyp}
                color={frameColor}
              />
            )}
          </g>
        )
      })}

      {/* Dimension labels (only when masse is set) */}
      {masseMm && (
        <DimensionsLabel
          viewWidth={vbWidth}
          viewHeight={vbHeight}
          padding={padding}
          frameWidth={frameWidth}
          frameHeight={frameHeight}
          widthMm={masseMm.breite}
          heightMm={masseMm.hoehe}
        />
      )}
    </svg>
  )
}
