import type { ComponentConfig } from '@puckeditor/core'
import React from 'react'

export type HeroBlockProps = {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  backgroundImage: string
}

export const HeroBlock: ComponentConfig<HeroBlockProps> = {
  label: 'Hero',
  fields: {
    title: { type: 'text', label: 'Titel' },
    subtitle: { type: 'textarea', label: 'Untertitel' },
    ctaText: { type: 'text', label: 'Button Text' },
    ctaLink: { type: 'text', label: 'Button Link' },
    backgroundImage: { type: 'text', label: 'Hintergrundbild URL (aus Media)' },
  },
  defaultProps: {
    title: 'Willkommen bei Muster Fenster',
    subtitle: 'Qualitätsfenster nach Maß — konfigurieren Sie Ihr Wunschfenster einfach online.',
    ctaText: 'Jetzt konfigurieren',
    ctaLink: '/konfigurator',
    backgroundImage: '',
  },
  render: ({ title, subtitle, ctaText, ctaLink, backgroundImage }) => (
    <section
      className="relative flex min-h-[60vh] items-center justify-center bg-cover bg-center px-4"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-background/70" />
      )}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          {subtitle}
        </p>
        {ctaText && (
          <a
            href={ctaLink}
            className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  ),
}
