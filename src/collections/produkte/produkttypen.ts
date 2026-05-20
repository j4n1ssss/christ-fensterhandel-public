import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/is-admin'

export const Produkttypen: CollectionConfig = {
  slug: 'produkttypen',
  labels: {
    singular: 'Produkttyp',
    plural: 'Produkttypen',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    group: 'Produkte',
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
      label: 'Bild',
      relationTo: 'media',
    },
    {
      name: 'erlaubte_materialien',
      type: 'relationship',
      label: 'Erlaubte Materialien',
      relationTo: 'materialien',
      hasMany: true,
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
