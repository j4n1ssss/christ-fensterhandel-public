'use client'

import React from 'react'

export interface DimensionsLabelProps {
  /** Total SVG viewBox width */
  viewWidth: number
  /** Total SVG viewBox height */
  viewHeight: number
  /** Frame padding from edges */
  padding: number
  /** Frame width (viewWidth - 2*padding) */
  frameWidth: number
  /** Frame height (viewHeight - 2*padding) */
  frameHeight: number
  /** Display width in mm */
  widthMm: number
  /** Display height in mm */
  heightMm: number
}

/**
 * SVG dimensions labels for the window preview.
 * Shows width below the frame and height to the right.
 * Uses small arrow lines for measurement indication.
 */
export function DimensionsLabel({
  viewWidth,
  viewHeight,
  padding,
  frameWidth,
  frameHeight,
  widthMm,
  heightMm,
}: DimensionsLabelProps) {
  const labelColor = '#888'
  const fontSize = 5
  const arrowOffset = 6

  // Width label: below the frame
  const widthY = padding + frameHeight + arrowOffset
  const widthStartX = padding
  const widthEndX = padding + frameWidth

  // Height label: to the right of the frame
  const heightX = padding + frameWidth + arrowOffset
  const heightStartY = padding
  const heightEndY = padding + frameHeight

  return (
    <g className="dimensions-labels">
      {/* Width measurement line */}
      <line
        x1={widthStartX}
        y1={widthY}
        x2={widthEndX}
        y2={widthY}
        stroke={labelColor}
        strokeWidth="0.5"
      />
      {/* Width arrow caps */}
      <line
        x1={widthStartX}
        y1={widthY - 1.5}
        x2={widthStartX}
        y2={widthY + 1.5}
        stroke={labelColor}
        strokeWidth="0.5"
      />
      <line
        x1={widthEndX}
        y1={widthY - 1.5}
        x2={widthEndX}
        y2={widthY + 1.5}
        stroke={labelColor}
        strokeWidth="0.5"
      />
      {/* Width text */}
      <text
        x={(widthStartX + widthEndX) / 2}
        y={widthY + fontSize + 1}
        textAnchor="middle"
        fill={labelColor}
        fontSize={fontSize}
      >
        {widthMm} mm
      </text>

      {/* Height measurement line */}
      <line
        x1={heightX}
        y1={heightStartY}
        x2={heightX}
        y2={heightEndY}
        stroke={labelColor}
        strokeWidth="0.5"
      />
      {/* Height arrow caps */}
      <line
        x1={heightX - 1.5}
        y1={heightStartY}
        x2={heightX + 1.5}
        y2={heightStartY}
        stroke={labelColor}
        strokeWidth="0.5"
      />
      <line
        x1={heightX - 1.5}
        y1={heightEndY}
        x2={heightX + 1.5}
        y2={heightEndY}
        stroke={labelColor}
        strokeWidth="0.5"
      />
      {/* Height text (rotated) */}
      <text
        x={heightX + fontSize + 1}
        y={(heightStartY + heightEndY) / 2}
        textAnchor="middle"
        fill={labelColor}
        fontSize={fontSize}
        transform={`rotate(90, ${heightX + fontSize + 1}, ${(heightStartY + heightEndY) / 2})`}
      >
        {heightMm} mm
      </text>
    </g>
  )
}
