import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/is-admin'
import { isAdminOrMitarbeiter } from '@/access/is-admin-or-mitarbeiter'

export const Preisregeln: CollectionConfig = {
  slug: 'preisregeln',
  labels: {
    singular: 'Preisregel',
    plural: 'Preisregeln',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    group: 'Business',
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Bezeichnung',
      required: true,
    },
    {
      name: 'produkttyp',
      type: 'relationship',
      label: 'Produkttyp',
      relationTo: 'produkttypen',
    },
    {
      name: 'material',
      type: 'relationship',
      label: 'Material',
      relationTo: 'materialien',
    },
    {
      name: 'profil',
      type: 'relationship',
      label: 'Profil',
      relationTo: 'profile',
    },
    {
      name: 'grundpreis_pro_m2',
      type: 'number',
      label: 'Grundpreis pro m2 (EUR)',
      required: true,
    },
    {
      name: 'aufpreis_typ',
      type: 'select',
      label: 'Aufpreis-Typ',
      options: [
        { label: 'Pauschal', value: 'pauschal' },
        { label: 'Pro m2', value: 'pro_m2' },
      ],
    },
    {
      name: 'aufpreis_wert',
      type: 'number',
      label: 'Aufpreis-Wert (EUR)',
    },
    {
      name: 'beschreibung',
      type: 'textarea',
      label: 'Beschreibung',
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
  ],
}
