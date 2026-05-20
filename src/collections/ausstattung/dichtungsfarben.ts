import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/is-admin'

export const Dichtungsfarben: CollectionConfig = {
  slug: 'dichtungsfarben',
  labels: {
    singular: 'Dichtungsfarbe',
    plural: 'Dichtungsfarben',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    group: 'Ausstattung',
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'farb_code',
      type: 'text',
      label: 'Farbcode (HEX)',
    },
    {
      name: 'aktiv',
      type: 'checkbox',
      label: 'Aktiv',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sortierung',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
