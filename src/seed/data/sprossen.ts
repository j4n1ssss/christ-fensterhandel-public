export const sprossenData = [
  {
    name: "Wiener Sprossen",
    slug: "wiener-sprossen",
    beschreibung: "Sprossen zwischen den Glasscheiben für klassische Optik",
    typ: "wiener" as const,
    aufpreis: 4000,
    aktiv: true,
    sortOrder: 1,
  },
  {
    name: "Helima Sprossen",
    slug: "helima-sprossen",
    beschreibung: "Im Scheibenzwischenraum integrierte Sprossen",
    typ: "helima" as const,
    aufpreis: 6000,
    aktiv: true,
    sortOrder: 2,
  },
  {
    name: "Aufgesetzte Sprossen",
    slug: "aufgesetzte-sprossen",
    beschreibung: "Von außen auf die Scheibe aufgesetzte Sprossen",
    typ: "aufgesetzt" as const,
    aufpreis: 3000,
    aktiv: true,
    sortOrder: 3,
  },
];
