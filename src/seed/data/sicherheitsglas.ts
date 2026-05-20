export const sicherheitsglasData = [
  {
    name: "VSG Außen",
    slug: "vsg-aussen",
    beschreibung: "Verbundsicherheitsglas auf der Außenseite",
    typ: "vsg_aussen" as const,
    aufpreis: 3500,
    aktiv: true,
    sortOrder: 1,
  },
  {
    name: "VSG Innen",
    slug: "vsg-innen",
    beschreibung: "Verbundsicherheitsglas auf der Innenseite",
    typ: "vsg_innen" as const,
    aufpreis: 3500,
    aktiv: true,
    sortOrder: 2,
  },
  {
    name: "VSG Beidseitig",
    slug: "vsg-beidseitig",
    beschreibung: "Verbundsicherheitsglas auf beiden Seiten",
    typ: "vsg_beidseitig" as const,
    aufpreis: 6000,
    aktiv: true,
    sortOrder: 3,
  },
];
