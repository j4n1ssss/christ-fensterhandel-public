import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  admin: {
    group: 'Website',
  },
  access: {
    read: () => true,
    update: ({ req }) => ['admin', 'mitarbeiter'].includes(req.user?.rolle || ''),
  },
  fields: [
    {
      name: 'links',
      type: 'array',
      label: 'Navigationspunkte',
      admin: {
        initCollapsed: false,
      },
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
        {
          name: 'newTab',
          type: 'checkbox',
          label: 'In neuem Tab öffnen',
          defaultValue: false,
        },
      ],
    },
  ],
}
