import type { ComponentConfig } from '@puckeditor/core'
import React from 'react'

export type CTABannerBlockProps = {
  heading: string
  description: string
  buttonText: string
  buttonLink: string
  variant: 'primary' | 'secondary'
}

export const CTABannerBlock: ComponentConfig<CTABannerBlockProps> = {
  label: 'CTA Banner',
  fields: {
    heading: { type: 'text', label: 'Überschrift' },
    description: { type: 'text', label: 'Beschreibung' },
    buttonText: { type: 'text', label: 'Button Text' },
    buttonLink: { type: 'text', label: 'Button Link' },
    variant: {
      type: 'radio',
      label: 'Variante',
      options: [
        { label: 'Primär', value: 'primary' },
        { label: 'Sekundär', value: 'secondary' },
      ],
    },
  },
  defaultProps: {
    heading: 'Bereit für Ihre neuen Fenster?',
    description: 'Starten Sie jetzt die Konfiguration und erhalten Sie ein unverbindliches Angebot.',
    buttonText: 'Konfigurator starten',
    buttonLink: '/konfigurator',
    variant: 'primary',
  },
  render: ({ heading, description, buttonText, buttonLink, variant }) => {
    const bgClass = variant === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
    const btnClass =
      variant === 'primary'
        ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
        : 'bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90'

    return (
      <section className={`px-4 py-16 ${bgClass}`}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">{heading}</h2>
          <p className="mt-4 text-lg opacity-90">{description}</p>
          {buttonText && (
            <a
              href={buttonLink}
              className={`mt-8 inline-block rounded-md px-6 py-3 text-sm font-medium transition-colors ${btnClass}`}
            >
              {buttonText}
            </a>
          )}
        </div>
      </section>
    )
  },
}
