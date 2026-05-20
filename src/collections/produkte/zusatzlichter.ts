import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/is-admin'

export const Zusatzlichter: CollectionConfig = {
  slug: 'zusatzlichter',
  labels: {
    singular: 'Zusatzlicht',
    plural: 'Zusatzlichter',
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
      name: 'kombinierbar_mit',
      type: 'relationship',
      label: 'Kombinierbar mit',
      relationTo: 'fluegelanzahl',
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
