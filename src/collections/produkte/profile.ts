/**
 * ENTSCHEIDUNG: Kein versions:drafts in v1.1
 *
 * Payload versions:drafts fuegt _status Feld hinzu. Bestehende Profile haben
 * _status=null und werden aus allen Queries gefiltert (unsichtbar).
 * Risiko zu hoch fuer produktive Daten. Siehe ADR:
 * docs/entscheidungen/001_2026-03-20_keine-versions-drafts-v11.md
 * Geplant fuer v1.2 mit Pre-Migration (VRSN-01).
 */
import type { CollectionConfig } from "payload";
import { isAdmin } from "@/access/is-admin";
import {
  profileBeforeChange,
  profileAfterChange,
} from "@/hooks/profile-edit-history";

export const Profile: CollectionConfig = {
  slug: "profile",
  labels: {
    singular: "Profil",
    plural: "Profile",
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [profileBeforeChange],
    afterChange: [profileAfterChange],
  },
  admin: {
    group: "Produkte",
    useAsTitle: "name_technisch",
    defaultColumns: ["name_technisch", "material", "hub_status", "aktiv"],
    components: {
      beforeListTable: [
        "@/components/admin/profile-hub-status-filter#ProfileHubStatusFilter",
      ],
      views: {
        edit: {
          history: {
            Component:
              "@/components/admin/profile-history-panel#ProfileHistoryPanel",
            path: "/history",
            tab: {
              label: "Historie",
              href: "/history",
            },
          },
        },
      },
      edit: {
        beforeDocumentControls: [
          "@/components/admin/profile-last-editor#ProfileLastEditor",
          "@/components/admin/profile-edit-toolbar#ProfileEditToolbar",
        ],
      },
    },
  },
  fields: [
    {
      name: "name_technisch",
      type: "text",
      label: "Technischer Name",
      required: true,
    },
    {
      name: "name_einfach",
      type: "text",
      label: "Einfacher Name",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "beschreibung",
      type: "textarea",
      label: "Beschreibung",
    },
    {
      name: "bild",
      type: "upload",
      label: "Bild",
      relationTo: "media",
    },
    {
      name: "qualitaetsstufe",
      type: "select",
      label: "Qualitätsstufe",
      options: [
        { label: "Einstieg", value: "einstieg" },
        { label: "Standard", value: "standard" },
        { label: "Premium", value: "premium" },
        { label: "Top", value: "top" },
      ],
    },
    {
      name: "technische_daten",
      type: "group",
      label: "Technische Daten",
      fields: [
        {
          name: "uw_wert",
          type: "number",
          label: "Uw-Wert (W/m2K)",
        },
        {
          name: "kammern",
          type: "number",
          label: "Kammern",
        },
        {
          name: "bautiefe_mm",
          type: "number",
          label: "Bautiefe (mm)",
        },
        {
          name: "dichtungen",
          type: "number",
          label: "Dichtungen",
        },
      ],
    },
    {
      name: "masse",
      type: "group",
      label: "Erlaubte Maße",
      fields: [
        {
          name: "min_breite_mm",
          type: "number",
          label: "Minimale Breite (mm)",
        },
        {
          name: "max_breite_mm",
          type: "number",
          label: "Maximale Breite (mm)",
        },
        {
          name: "min_hoehe_mm",
          type: "number",
          label: "Minimale Höhe (mm)",
        },
        {
          name: "max_hoehe_mm",
          type: "number",
          label: "Maximale Höhe (mm)",
        },
      ],
    },
    {
      name: "material",
      type: "relationship",
      label: "Material",
      relationTo: "materialien",
      required: true,
    },
    // --- Hub-Felder: Erlaubte Zuordnungen ---
    {
      type: "tabs",
      tabs: [
        {
          label: "Kombinationen",
          description:
            "Welche Produkt-Kombinationen sind für dieses Profil erlaubt?",
          fields: [
            {
              name: "erlaubte_produkttypen",
              type: "relationship",
              label: "Erlaubte Produkttypen",
              relationTo: "produkttypen",
              hasMany: true,
              maxDepth: 0,
              filterOptions: { aktiv: { equals: true } },
              admin: {
                allowCreate: true,
                description:
                  "Welche Produkttypen können mit diesem Profil konfiguriert werden? Leer = keine Einschränkung.",
              },
            },
            {
              name: "erlaubte_fensterformen",
              type: "relationship",
              label: "Erlaubte Fensterformen",
              relationTo: "fensterformen",
              hasMany: true,
              maxDepth: 0,
              filterOptions: { aktiv: { equals: true } },
              admin: {
                allowCreate: true,
                description:
                  "Welche Fensterformen sind für dieses Profil verfügbar? Leer = alle aktiven Formen.",
              },
            },
            {
              name: "erlaubte_fluegelanzahl",
              type: "relationship",
              label: "Erlaubte Flügelanzahl",
              relationTo: "fluegelanzahl",
              hasMany: true,
              maxDepth: 0,
              filterOptions: { aktiv: { equals: true } },
              admin: {
                allowCreate: true,
                description:
                  "Welche Flügelanzahlen sind möglich? Leer = alle aktiven Optionen.",
              },
            },
            {
              name: "erlaubte_oeffnungsarten",
              type: "relationship",
              label: "Erlaubte Öffnungsarten",
              relationTo: "oeffnungsarten",
              hasMany: true,
              maxDepth: 0,
              filterOptions: { aktiv: { equals: true } },
              admin: {
                allowCreate: true,
                description:
                  "Welche Öffnungsarten unterstützt dieses Profil? Leer = alle aktiven Arten.",
              },
            },
            {
              name: "erlaubte_zusatzlichter",
              type: "relationship",
              label: "Erlaubte Zusatzlichter",
              relationTo: "zusatzlichter",
              hasMany: true,
              maxDepth: 0,
              filterOptions: { aktiv: { equals: true } },
              admin: {
                allowCreate: true,
                description:
                  "Welche Zusatzlichter (Ober-/Unterlicht) sind möglich? Leer = alle aktiven Optionen.",
              },
            },
          ],
        },
        {
          label: "Ausstattung",
          description:
            "Welche Ausstattungsoptionen sind für dieses Profil erlaubt?",
          fields: [
            {
              name: "erlaubte_farben",
              type: "relationship",
              label: "Erlaubte Farben",
              relationTo: "farben",
              hasMany: true,
              maxDepth: 0,
              filterOptions: { aktiv: { equals: true } },
              admin: {
                allowCreate: true,
                description:
                  "Welche Farben sind für dieses Profil erlaubt? Leer = Fallback auf Material-Filter.",
              },
            },
            {
              name: "erlaubte_dichtungsfarben",
              type: "relationship",
              label: "Erlaubte Dichtungsfarben",
              relationTo: "dichtungsfarben",
              hasMany: true,
              maxDepth: 0,
              filterOptions: { aktiv: { equals: true } },
              admin: {
                allowCreate: true,
                description:
                  "Welche Dichtungsfarben stehen zur Auswahl? Leer = alle aktiven Dichtungsfarben.",
              },
            },
            {
              name: "erlaubte_verglasungen",
              type: "relationship",
              label: "Erlaubte Verglasungen",
              relationTo: "verglasungen",
              hasMany: true,
              maxDepth: 0,
              filterOptions: { aktiv: { equals: true } },
              admin: {
                allowCreate: true,
                description:
                  "Welche Verglasungsoptionen sind verfügbar? Leer = alle aktiven Verglasungen.",
              },
            },
            {
              name: "erlaubte_schallschutz",
              type: "relationship",
              label: "Erlaubter Schallschutz",
              relationTo: "schallschutz",
              hasMany: true,
              maxDepth: 0,
              filterOptions: { aktiv: { equals: true } },
              admin: {
                allowCreate: true,
                description:
                  "Welche Schallschutz-Optionen bietet dieses Profil? Leer = alle aktiven Optionen.",
              },
            },
            {
              name: "erlaubte_sicherheitsglas",
              type: "relationship",
              label: "Erlaubtes Sicherheitsglas",
              relationTo: "sicherheitsglas",
              hasMany: true,
              maxDepth: 0,
              filterOptions: { aktiv: { equals: true } },
              admin: {
                allowCreate: true,
                description:
                  "Welches Sicherheitsglas ist verfügbar? Leer = alle aktiven Optionen.",
              },
            },
            {
              name: "erlaubte_glasdekore",
              type: "relationship",
              label: "Erlaubte Glasdekore",
              relationTo: "glasdekore",
              hasMany: true,
              maxDepth: 0,
              filterOptions: { aktiv: { equals: true } },
              admin: {
                allowCreate: true,
                description:
                  "Welche Glasdekore können gewählt werden? Leer = alle aktiven Dekore.",
              },
            },
            {
              name: "erlaubte_sprossen",
              type: "relationship",
              label: "Erlaubte Sprossen",
              relationTo: "sprossen",
              hasMany: true,
              maxDepth: 0,
              filterOptions: { aktiv: { equals: true } },
              admin: {
                allowCreate: true,
                description:
                  "Welche Sprossentypen sind möglich? Leer = alle aktiven Sprossen.",
              },
            },
            {
              name: "erlaubte_extras",
              type: "relationship",
              label: "Erlaubte Extras",
              relationTo: "extras",
              hasMany: true,
              maxDepth: 0,
              filterOptions: { aktiv: { equals: true } },
              admin: {
                allowCreate: true,
                description:
                  "Welche Extras (Griffe, Beschläge) sind verfügbar? Leer = alle aktiven Extras.",
              },
            },
          ],
        },
      ],
    },
    {
      name: "last_edited_by",
      type: "relationship",
      relationTo: "users",
      label: "Zuletzt bearbeitet von",
      admin: {
        hidden: true,
        readOnly: true,
      },
      maxDepth: 1,
    },
    {
      name: "hub_status",
      type: "ui",
      label: "Hub-Status",
      admin: {
        components: {
          Cell: "@/components/admin/profile-hub-status-cell#ProfileHubStatusCell",
        },
      },
    },
    {
      name: "aktiv",
      type: "checkbox",
      label: "Aktiv",
      defaultValue: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      label: "Sortierung",
      defaultValue: 0,
      admin: {
        position: "sidebar",
      },
    },
  ],
};
