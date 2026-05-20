import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: {
    group: 'Website',
  },
  access: {
    read: () => true,
    update: ({ req }) => ['admin', 'mitarbeiter'].includes(req.user?.rolle || ''),
  },
  fields: [
    {
      name: 'firmenname',
      type: 'text',
      label: 'Firmenname',
      defaultValue: 'Muster Fenster',
    },
    {
      name: 'adresse',
      type: 'textarea',
      label: 'Adresse',
      localized: true,
    },
    {
      name: 'telefon',
      type: 'text',
      label: 'Telefon',
    },
    {
      name: 'email',
      type: 'email',
      label: 'E-Mail',
    },
    {
      name: 'legal_links',
      type: 'array',
      label: 'Rechtliche Links',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
