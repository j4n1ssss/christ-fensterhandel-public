import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/is-admin'

export const Verglasungen: CollectionConfig = {
  slug: 'verglasungen',
  labels: {
    singular: 'Verglasung',
    plural: 'Verglasungen',
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
      name: 'ug_wert',
      type: 'number',
      label: 'Ug-Wert (W/m2K)',
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
