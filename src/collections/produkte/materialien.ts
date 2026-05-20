import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/is-admin'

export const Materialien: CollectionConfig = {
  slug: 'materialien',
  labels: {
    singular: 'Material',
    plural: 'Materialien',
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
      name: 'lieferzeit_wochen',
      type: 'number',
      label: 'Lieferzeit (Wochen)',
    },
    {
      name: 'garantie_jahre',
      type: 'number',
      label: 'Garantie (Jahre)',
    },
    {
      name: 'erlaubte_profile',
      type: 'relationship',
      label: 'Erlaubte Profile',
      relationTo: 'profile',
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
