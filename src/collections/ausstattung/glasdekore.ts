import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/is-admin'

export const Glasdekore: CollectionConfig = {
  slug: 'glasdekore',
  labels: {
    singular: 'Glasdekor',
    plural: 'Glasdekore',
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
      name: 'beschreibung',
      type: 'textarea',
      label: 'Beschreibung',
    },
    {
      name: 'bild',
      type: 'upload',
      label: 'Vorschaubild',
      relationTo: 'media',
    },
    {
      name: 'aufpreis',
      type: 'number',
      label: 'Aufpreis (EUR/m2)',
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
