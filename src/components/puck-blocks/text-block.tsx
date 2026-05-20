import type { ComponentConfig } from '@puckeditor/core'
import React from 'react'

export type TextBlockProps = {
  heading: string
  content: string
  alignment: 'left' | 'center'
}

export const TextBlock: ComponentConfig<TextBlockProps> = {
  label: 'Textblock',
  fields: {
    heading: { type: 'text', label: 'Überschrift (optional)' },
    content: { type: 'textarea', label: 'Textinhalt' },
    alignment: {
      type: 'radio',
      label: 'Ausrichtung',
      options: [
        { label: 'Links', value: 'left' },
        { label: 'Zentriert', value: 'center' },
      ],
    },
  },
  defaultProps: {
    heading: '',
    content: 'Hier steht Ihr Text. Bearbeiten Sie diesen Inhalt im Puck Editor.',
    alignment: 'left',
  },
  render: ({ heading, content, alignment }) => (
    <section className="px-4 py-12">
      <div
        className={`prose prose-neutral mx-auto max-w-3xl ${
          alignment === 'center' ? 'text-center' : ''
        }`}
      >
        {heading && <h2 className="text-2xl font-semibold text-foreground">{heading}</h2>}
        <div className="mt-4 whitespace-pre-line text-muted-foreground">{content}</div>
      </div>
    </section>
  ),
}
