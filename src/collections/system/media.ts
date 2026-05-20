import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/is-admin'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Mediendatei',
    plural: 'Medien',
  },
  admin: {
    group: 'System',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt-Text',
    },
  ],
  upload: true,
}
