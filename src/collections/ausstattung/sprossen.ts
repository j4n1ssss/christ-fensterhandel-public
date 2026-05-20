import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/is-admin'

export const Sprossen: CollectionConfig = {
  slug: 'sprossen',
  labels: {
    singular: 'Sprosse',
    plural: 'Sprossen',
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
      name: 'typ',
      type: 'select',
      label: 'Typ',
      options: [
        { label: 'Wiener Sprossen', value: 'wiener' },
        { label: 'Helima Sprossen', value: 'helima' },
        { label: 'Aufgesetzte Sprossen', value: 'aufgesetzt' },
      ],
    },
    {
      name: 'aufpreis',
      type: 'number',
      label: 'Aufpreis (EUR)',
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
