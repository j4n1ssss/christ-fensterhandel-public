import type { ComponentConfig } from '@puckeditor/core'
import React from 'react'
import Image from 'next/image'

export type ImageTextBlockProps = {
  heading: string
  text: string
  imageUrl: string
  imagePosition: 'left' | 'right'
}

export const ImageTextBlock: ComponentConfig<ImageTextBlockProps> = {
  label: 'Bild + Text',
  fields: {
    heading: { type: 'text', label: 'Überschrift' },
    text: { type: 'textarea', label: 'Text' },
    imageUrl: { type: 'text', label: 'Bild URL (aus Media)' },
    imagePosition: {
      type: 'radio',
      label: 'Bildposition',
      options: [
        { label: 'Links', value: 'left' },
        { label: 'Rechts', value: 'right' },
      ],
    },
  },
  defaultProps: {
    heading: 'Über uns',
    text: 'Muster Fenster steht für Qualität und Zuverlässigkeit im Bereich Fenster und Türen.',
    imageUrl: '',
    imagePosition: 'left',
  },
  render: ({ heading, text, imageUrl, imagePosition }) => {
    const imageEl = (
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={heading}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Kein Bild ausgewählt
          </div>
        )}
      </div>
    )

    const textEl = (
      <div className="flex flex-col justify-center">
        {heading && (
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{heading}</h2>
        )}
        <p className="mt-4 whitespace-pre-line text-muted-foreground">{text}</p>
      </div>
    )

    return (
      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
          {imagePosition === 'left' ? (
            <>
              {imageEl}
              {textEl}
            </>
          ) : (
            <>
              {textEl}
              {imageEl}
            </>
          )}
        </div>
      </section>
    )
  },
}
