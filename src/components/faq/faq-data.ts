/**
 * FAQ-Datenbank für die /faq-Route.
 *
 * Kategorien spiegeln die Customer-Journey wider:
 *   produkte → konfigurator → bestellung → zahlung → versand
 *   → montage → garantie
 *
 * Ein Eintrag kann mehreren Keywords zugewiesen werden; diese
 * fließen in die Client-seitige Volltextsuche ein.
 */

export type FaqCategoryId =
  | "produkte"
  | "konfigurator"
  | "bestellung"
  | "zahlung"
  | "versand"
  | "montage"
  | "garantie";

export type FaqCategory = {
  id: FaqCategoryId;
  label: string;
  /** Kurz-Beschreibung der Kategorie (wird als Header im "Alle"-Modus gezeigt). */
  tagline: string;
};

export type FaqItem = {
  id: string;
  category: FaqCategoryId;
  question: string;
  /** Antwort als Array von Absätzen — für saubere Typografie über mehrere Paragraphen. */
  answer: string[];
  keywords?: string[];
};

export const FAQ_CATEGORIES: readonly FaqCategory[] = [
  {
    id: "produkte",
    label: "Produkte und Materialien",
    tagline: "Kunststoff, Aluminium, Holz — was passt wozu.",
  },
  {
    id: "konfigurator",
    label: "Konfigurator",
    tagline: "Maßnehmen, Einstellen, Speichern.",
  },
  {
    id: "bestellung",
    label: "Bestellung und Auftrag",
    tagline: "Vom Warenkorb bis zur Auftragsbestätigung.",
  },
  {
    id: "zahlung",
    label: "Zahlung und Preise",
    tagline: "Zahlungsarten, Raten, Preisbindung.",
  },
  {
    id: "versand",
    label: "Versand und Lieferung",
    tagline: "Fertigungszeiten, Liefertermine, Transport.",
  },
  {
    id: "montage",
    label: "Montage und Einbau",
    tagline: "Eigenmontage oder durch unsere Partner.",
  },
  {
    id: "garantie",
    label: "Garantie und Reklamation",
    tagline: "Gewährleistung, Austausch, Service nach dem Kauf.",
  },
] as const;

export const FAQ_ITEMS: readonly FaqItem[] = [
  // ───────── PRODUKTE ─────────
  {
    id: "material-unterschiede",
    category: "produkte",
    question: "Welches Fenstermaterial ist für mein Zuhause das richtige?",
    answer: [
      "Kunststoff ist der Allrounder: beste Wärmedämmung im Preis-Leistungs-Verhältnis, pflegeleicht, über 40 Dekore erhältlich. Passt zu klassischen und modernen Bauten.",
      "Aluminium bringt schlanke Ansichten und sehr hohe Stabilität — ideal für große Elemente, moderne Architektur und Objektbau.",
      "Holz ist das lebendigste Material: warm, ökologisch, mit natürlicher Wärmedämmung. Benötigt einen Wartungsanstrich alle 8–12 Jahre.",
      "Im Zweifel: ruf uns kurz an. Wir hören, was dein Projekt braucht, und schlagen das passende Material vor.",
    ],
    keywords: ["kunststoff", "aluminium", "holz", "material", "pvc", "alu"],
  },
  {
    id: "drutex-partner",
    category: "produkte",
    question: "Warum DRUTEX — und nicht einfach irgendein Hersteller?",
    answer: [
      "DRUTEX ist einer der größten Fenster-Produzenten Europas mit voll automatisierter Fertigung in Bytów (Polen). Als einer ihrer autorisierten Partner in Musterstadt bekommen wir direkte Werksware, transparente Zertifikate und Zugriff auf Sonderanfertigungen.",
      "Das bedeutet für dich: kurze Fertigungszeiten, gleichbleibende Qualität und ein Ersatzteil-Netzwerk, das auch in 20 Jahren noch existiert.",
    ],
    keywords: ["drutex", "hersteller", "partner", "qualität"],
  },
  {
    id: "uw-wert",
    category: "produkte",
    question: "Welche U-Werte erreichen eure Fenster?",
    answer: [
      "Unsere Standard-Kunststofffenster (Iglo 5) erreichen Uw = 0,9 W/(m²K). Mit Iglo Light und 3-fach-Verglasung gehen wir auf Uw = 0,7 W/(m²K).",
      "Für KfW-Förderung und Passivhaus-Niveau empfehlen wir Iglo Edge: Uw bis 0,66 W/(m²K) mit integriertem Rolladen ohne Kältebrücke.",
      "Die exakten Werte hängen von Größe und Öffnungsart ab — sie stehen auf jedem Angebot und auf dem CE-Label.",
    ],
    keywords: ["u-wert", "uw", "dämmung", "wärmedämmung", "energieeffizienz", "kfw"],
  },
  {
    id: "sicherheitsklasse",
    category: "produkte",
    question: "Gibt es einbruchhemmende Fenster und Türen?",
    answer: [
      "Ja. Standardmäßig sind unsere Fenster mit RC1N ausgestattet. Auf Wunsch liefern wir RC2 oder RC2N — dieselbe Sicherheitsklasse, die Polizei und Versicherungen für Erdgeschoss und leicht erreichbare Fenster empfehlen.",
      "Haustüren (D-Gate, Tempo) sind ab Werk RC2; RC3 auf Anfrage. Smart-Lock-fähig, mit Fingerprint oder PIN.",
    ],
    keywords: ["sicherheit", "einbruch", "rc2", "rc3", "einbruchhemmend", "polizei"],
  },

  // ───────── KONFIGURATOR ─────────
  {
    id: "konfigurator-start",
    category: "konfigurator",
    question: "Wie funktioniert euer Konfigurator?",
    answer: [
      "Du durchläufst 8 Schritte: Produktauswahl, Maße, Öffnungsrichtung, Verglasung, Farbe, Beschläge, Extras und Zusammenfassung. Bei jedem Schritt siehst du Live-Vorschau und aktualisierten Preis.",
      "Pro Position brauchst du etwa 3–5 Minuten. Du kannst jederzeit speichern und später fortsetzen — auch auf einem anderen Gerät, wenn du einen Account hast.",
    ],
    keywords: ["konfigurator", "schritte", "ablauf", "anfangen"],
  },
  {
    id: "mass-nehmen",
    category: "konfigurator",
    question: "Wie messe ich mein Fenster richtig aus?",
    answer: [
      "Gemessen wird das Mauerlicht (Öffnung im Rohbau) — nicht der alte Fensterrahmen. Miss Breite oben/mitte/unten und Höhe links/mitte/rechts; nimm den kleinsten Wert.",
      "Einbautiefe beachten: bei Außen- oder Innendämmung bitte angeben. Wir ziehen im Werk die richtigen Einbauzuschläge ab.",
      "Du bist unsicher? Unser kostenloses Aufmaß-Service-Paket: wir kommen, messen und du bekommst verbindliche Maße im Angebot.",
    ],
    keywords: ["maß", "messen", "aufmaß", "breite", "höhe", "mauerlicht"],
  },
  {
    id: "config-speichern",
    category: "konfigurator",
    question: "Kann ich meine Konfiguration speichern und später weitermachen?",
    answer: [
      "Ja. Mit Kundenkonto speichern wir jede Position automatisch — du siehst sie in deinem Dashboard unter „Konfigurationen“.",
      "Ohne Account legen wir die Konfiguration 30 Tage im Browser ab. Für längere Projekte oder Austausch mit uns ist ein Account klar sinnvoller.",
    ],
    keywords: ["speichern", "konto", "account", "fortsetzen", "pausieren"],
  },
  {
    id: "vorschau-realistisch",
    category: "konfigurator",
    question: "Ist die Vorschau im Konfigurator maßstabsgetreu?",
    answer: [
      "Die Proportionen stimmen: Rahmenbreite, Sprossenlage und Öffnungsart werden 1:1 dargestellt. Farben sind kalibriert, können aber je nach Monitor minimal variieren.",
      "Für eine echte Farb- und Oberflächenprobe schicken wir auf Anfrage kostenlos Musterriegel der gängigen Dekore zu.",
    ],
    keywords: ["vorschau", "3d", "rendering", "muster", "farbe"],
  },
  {
    id: "sonderwunsch",
    category: "konfigurator",
    question: "Was, wenn meine Wunschkonfiguration nicht im Konfigurator ist?",
    answer: [
      "Nicht jede Sondergröße, jede Farbe oder jede Öffnungsart lässt sich online abbilden — gerade historische Gebäude oder extreme Formate brauchen Sonderfertigung.",
      "Nutz die „Anfrage“-Funktion oder schick uns eine Skizze. Wir rechnen manuell nach, sprechen mit DRUTEX und du bekommst ein verbindliches Angebot — meist innerhalb von 2–3 Werktagen.",
    ],
    keywords: ["sonderwunsch", "sondergröße", "individuell", "anfrage", "denkmal"],
  },

  // ───────── BESTELLUNG ─────────
  {
    id: "bestellung-ablauf",
    category: "bestellung",
    question: "Wie läuft eine Bestellung bei euch ab?",
    answer: [
      "Nach dem Konfigurieren legst du Positionen in den Warenkorb, prüfst die Zusammenfassung und schließt ab. Du erhältst sofort eine Eingangsbestätigung.",
      "Wir prüfen deine Daten (meist am selben Werktag), klären bei Bedarf Rückfragen und schicken dir die verbindliche Auftragsbestätigung mit konkretem Liefertermin. Erst dann geht der Auftrag in Produktion.",
    ],
    keywords: ["bestellung", "ablauf", "auftrag", "warenkorb", "prozess"],
  },
  {
    id: "bestellung-aendern",
    category: "bestellung",
    question: "Kann ich meine Bestellung nachträglich ändern?",
    answer: [
      "Solange der Auftrag noch nicht in Produktion ist (in der Regel 2–3 Werktage nach Auftragsbestätigung), kannst du kostenlos ändern oder stornieren. Ruf uns an oder antworte auf die Auftragsbestätigung.",
      "Ist die Fertigung gestartet, ist eine Änderung nur eingeschränkt möglich — jedes Fenster wird individuell produziert, Materialien sind dann bereits beschnitten.",
    ],
    keywords: ["ändern", "stornieren", "anpassen", "widerruf", "korrektur"],
  },
  {
    id: "tracking",
    category: "bestellung",
    question: "Wie verfolge ich den Status meiner Bestellung?",
    answer: [
      "Unter /bestellung-verfolgen gibst du Auftragsnummer und E-Mail ein und siehst den aktuellen Status: Prüfung, Produktion, Versand, Zustellung.",
      "Mit Kundenkonto ist der gesamte Verlauf inklusive Dokumenten (Auftragsbestätigung, Rechnung, CE-Zertifikate) dauerhaft abrufbar.",
    ],
    keywords: ["status", "tracking", "verfolgen", "auftragsnummer"],
  },
  {
    id: "geschaeftskunde",
    category: "bestellung",
    question: "Ich bin Handwerker oder Bauträger — gibt es besondere Konditionen?",
    answer: [
      "Ja. Gewerbekunden erhalten ab 5 Positionen gestaffelte Rabatte, auf Wunsch Rechnung auf 30 Tage netto und einen persönlichen Ansprechpartner.",
      "Registriere dich als Gewerbekunde — nach kurzer Prüfung schalten wir die B2B-Preise im Konfigurator frei.",
    ],
    keywords: ["b2b", "gewerbe", "handwerker", "bauträger", "rabatt"],
  },

  // ───────── ZAHLUNG ─────────
  {
    id: "zahlungsmittel",
    category: "zahlung",
    question: "Welche Zahlungsarten akzeptiert ihr?",
    answer: [
      "Überweisung (SEPA), Kreditkarte (Visa, Mastercard, Amex) und PayPal. Gewerbekunden: Rechnung auf 30 Tage netto nach Bonitätsprüfung.",
      "Auf Wunsch: Finanzierung über unseren Partner für Beträge ab 2.000 €, Laufzeit 12–84 Monate. Antrag vollständig digital.",
    ],
    keywords: ["zahlung", "paypal", "kreditkarte", "überweisung", "rechnung"],
  },
  {
    id: "anzahlung",
    category: "zahlung",
    question: "Muss ich eine Anzahlung leisten?",
    answer: [
      "Bei Privatkunden: 50 % bei Auftragsbestätigung, 50 % bei Lieferung. Kleine Aufträge unter 1.000 € sind komplett mit Bestellung fällig.",
      "Gewerbekunden zahlen nach Absprache — üblich ist Rechnung mit Zahlungsziel 30 Tage nach Lieferung.",
    ],
    keywords: ["anzahlung", "ratenzahlung", "vorkasse", "teilzahlung"],
  },
  {
    id: "preisbindung",
    category: "zahlung",
    question: "Wie lange sind Angebotspreise gültig?",
    answer: [
      "Online-Konfigurator-Preise sind tagesaktuell. Ein schriftliches Angebot binden wir 30 Tage — danach müssen wir aufgrund von Material- und Energiekosten neu kalkulieren.",
      "Bei Angeboten über 10.000 € gewähren wir auf Wunsch eine 60-Tage-Bindung, damit du Zeit für Finanzierung und Förderanträge hast.",
    ],
    keywords: ["angebot", "preis", "gültigkeit", "bindung"],
  },

  // ───────── VERSAND ─────────
  {
    id: "lieferzeit",
    category: "versand",
    question: "Wie lange dauert die Lieferung?",
    answer: [
      "Standard-Kunststofffenster: 3–5 Wochen ab Auftragsbestätigung. Aluminium und Holz: 5–7 Wochen. Sonderanfertigungen entsprechend länger.",
      "Wir nennen auf der Auftragsbestätigung immer einen konkreten Liefertermin (Kalenderwoche) und halten ihn in über 95 % der Aufträge punktgenau ein.",
    ],
    keywords: ["lieferzeit", "dauer", "wochen", "termin", "fertigung"],
  },
  {
    id: "liefergebiet",
    category: "versand",
    question: "Liefert ihr deutschlandweit?",
    answer: [
      "Ja, deutschlandweit über eine eigene Spedition. Schwerpunkt Musterstadt, Beispielstadt und Sachsen-Anhalt — dort liefern wir mit eigenen Fahrzeugen mehrmals wöchentlich.",
      "Auslandslieferung (Österreich, Schweiz, Benelux): auf Anfrage möglich, inklusive Zollabwicklung.",
    ],
    keywords: ["liefergebiet", "deutschland", "österreich", "schweiz", "spedition"],
  },
  {
    id: "liefertag-absprache",
    category: "versand",
    question: "Kann ich mir einen Liefertag aussuchen?",
    answer: [
      "Circa 7 Tage vor Lieferung meldet sich die Spedition telefonisch und stimmt einen festen Tag (in der Regel in einem 4-Stunden-Fenster) mit dir ab.",
      "Montags bis freitags, 7–17 Uhr. Samstagslieferung ist gegen Aufpreis möglich.",
    ],
    keywords: ["liefertag", "termin", "avis", "spedition"],
  },
  {
    id: "entladung",
    category: "versand",
    question: "Helft ihr beim Abladen?",
    answer: [
      "Die Spedition liefert bis zur Bordsteinkante. Für das Abladen brauchst du 2 Helfer — Fenster unter 2 m Höhe sind meist zu zweit tragbar, große Elemente bitte mit Tragegurten oder Hebezeug.",
      "Gegen Aufpreis: Abladung durch unser Team, Verbringung bis Wunschort auf dem Grundstück, Entsorgung der Transportverpackung.",
    ],
    keywords: ["abladen", "entladung", "transport", "abladehilfe"],
  },

  // ───────── MONTAGE ─────────
  {
    id: "selbst-einbauen",
    category: "montage",
    question: "Kann ich die Fenster selbst einbauen?",
    answer: [
      "Ja. Handwerklich erfahrene Kunden bauen regelmäßig selbst ein. Wir liefern Montage­anleitung, alle Dichtbänder und bei Bedarf RAL-Einbauzubehör mit.",
      "Wichtig: Bei Eigenmontage erlischt nicht die Produktgarantie, aber Einbaufehler sind nicht abgedeckt. Verarbeite die Montage nach RAL und dokumentiere mit Fotos.",
    ],
    keywords: ["selbst", "eigenmontage", "einbau", "diy", "anleitung"],
  },
  {
    id: "montage-partner",
    category: "montage",
    question: "Übernehmt ihr auch den Einbau?",
    answer: [
      "In Musterstadt und Beispielstadt vermitteln wir dir einen festen Montage-Partner aus unserem Netzwerk — zertifiziert, versichert, RAL-konform. Du bekommst ein separates Angebot mit Festpreis pro Fenster.",
      "Außerhalb dieser Region verbinden wir dich gerne mit regionalen Betrieben — oder du beauftragst deinen eigenen Handwerker.",
    ],
    keywords: ["montage", "einbau", "handwerker", "partner", "service"],
  },
  {
    id: "altfenster-entsorgung",
    category: "montage",
    question: "Werden die alten Fenster entsorgt?",
    answer: [
      "Bei Montage durch unsere Partner: Ja, Demontage und fachgerechte Entsorgung der Altfenster ist Teil des Montageangebots.",
      "Bei Eigenmontage: Wertstoffhöfe nehmen alte Fenster kostenlos an. Sondermüll ist es nur, wenn Dichtstoffe oder Lacke aus der Vor-1990-Zeit verbaut sind.",
    ],
    keywords: ["entsorgung", "altfenster", "demontage", "recycling"],
  },

  // ───────── GARANTIE ─────────
  {
    id: "garantie-dauer",
    category: "garantie",
    question: "Welche Garantien gebt ihr?",
    answer: [
      "Gesetzliche Gewährleistung: 2 Jahre auf die gesamte Lieferung.",
      "Herstellergarantie DRUTEX: 7 Jahre auf Profile und Dichtungen, 10 Jahre auf Verglasung (Gasfüllung), 3 Jahre auf Beschläge.",
      "Bei Einbau durch unsere Partner: zusätzlich 5 Jahre auf die fachgerechte Montage.",
    ],
    keywords: ["garantie", "gewährleistung", "jahre", "hersteller"],
  },
  {
    id: "reklamation",
    category: "garantie",
    question: "Was, wenn ein Fenster beschädigt oder falsch geliefert wurde?",
    answer: [
      "Sofort bei Annahme auf dem Lieferschein der Spedition vermerken und uns innerhalb von 24 Stunden mit Fotos informieren. Wir organisieren Ersatz oder Reparatur kostenlos.",
      "Später entdeckte Mängel: gerne per Formular unter /reklamation. Bearbeitungszeit maximal 5 Werktage bis zur verbindlichen Rückmeldung.",
    ],
    keywords: ["reklamation", "schaden", "beschädigt", "beanstandung", "transport"],
  },
  {
    id: "ersatzteile",
    category: "garantie",
    question: "Wo bekomme ich später Ersatzteile?",
    answer: [
      "Direkt bei uns. DRUTEX garantiert Ersatzteilverfügbarkeit für mindestens 15 Jahre ab Produktionsdatum — Dichtungen, Beschläge, Griffe, Rolladen-Komponenten.",
      "Nimm einfach Kontakt auf, nenn die Auftragsnummer und die betroffene Komponente. Häufige Teile sind ab Lager, Sonderteile in 1–3 Wochen verfügbar.",
    ],
    keywords: ["ersatzteile", "dichtung", "griff", "beschlag", "service"],
  },
] as const;

export function getFaqStats() {
  return {
    totalQuestions: FAQ_ITEMS.length,
    totalCategories: FAQ_CATEGORIES.length,
  };
}
