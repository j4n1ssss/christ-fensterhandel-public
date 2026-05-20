import type { ComponentConfig } from '@puckeditor/core'
import React from 'react'

export type FeatureGridBlockProps = {
  heading: string
  features: Array<{
    title: string
    description: string
    icon: string
  }>
}

export const FeatureGridBlock: ComponentConfig<FeatureGridBlockProps> = {
  label: 'Feature Grid',
  fields: {
    heading: { type: 'text', label: 'Überschrift' },
    features: {
      type: 'array',
      label: 'Features',
      arrayFields: {
        title: { type: 'text', label: 'Titel' },
        description: { type: 'textarea', label: 'Beschreibung' },
        icon: { type: 'text', label: 'Icon (Emoji oder Text)' },
      },
      defaultItemProps: {
        title: 'Feature',
        description: 'Beschreibung des Features.',
        icon: '⭐',
      },
    },
  },
  defaultProps: {
    heading: 'Unsere Vorteile',
    features: [
      {
        title: 'Qualität',
        description: 'Hochwertige Fenster und Türen aus besten Materialien.',
        icon: '🏗️',
      },
      {
        title: 'Beratung',
        description: 'Individuelle Beratung für Ihr Bauprojekt.',
        icon: '💬',
      },
      {
        title: 'Lieferung',
        description: 'Zuverlässige Lieferung direkt zu Ihnen.',
        icon: '🚚',
      },
    ],
  },
  render: ({ heading, features }) => (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {heading && (
          <h2 className="mb-8 text-center text-3xl font-bold text-foreground">{heading}</h2>
        )}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features?.map((feature, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 text-3xl">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-card-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
}
