# Phase 26: PDF-Infrastruktur - Research

**Researched:** 2026-03-31
**Domain:** PDF generation with @react-pdf/renderer, Payload CMS collections (immutable), N8N attachment integration
**Confidence:** HIGH

## Summary

Phase 26 builds server-side PDF generation for three German business document types (Angebot, Rechnung, Gutschrift) using @react-pdf/renderer, with immutable Payload CMS collections for archival, download integration in both Admin and Kunden dashboards, and Base64 PDF attachments in the existing N8N email queue webhook payload.

The project uses Next.js 15.4.11 with React 19.1.0 and Payload CMS 3.79.0. @react-pdf/renderer v4.3.2 is compatible with React 19 (since v4.1.0) and Next.js 15 (confirmed working with React 19.0.0+). The library provides `renderToStream` and `renderToBuffer` (undocumented but functional) for server-side PDF generation in API routes. The project already has established patterns for everything this phase needs: email rendering (renderEmailForEvent pattern), atomic number generation (getNextNumber), cent-based tax calculations (tax.ts), settings retrieval (getSettings), afterChange hooks for status triggers, and staff-protected preview routes.

**Primary recommendation:** Use `renderToStream` from @react-pdf/renderer in Next.js API route handlers under `src/app/(payload)/api/pdf/`. Add `'@react-pdf/renderer'` to `serverComponentsExternalPackages` in next.config.mjs. Follow the existing renderEmailForEvent pattern for the central renderPDF helper. Store generated PDFs in a dedicated pdf_uploads Upload collection, with relationship fields on the rechnungen/angebote business collections.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- @react-pdf/renderer for all PDF templates (JSX-Components, TypeScript, no browser needed)
- Templates in `src/lib/pdf/` as own folder (analog to src/lib/email/)
- Shared Components in `src/lib/pdf/components/`: Header, Footer, ProduktBlock, MwStBlock
- Central `renderPDF(type: 'angebot'|'rechnung'|'gutschrift', anfrageId, settings)` helper analog to renderEmailForEvent()
- Synchronous generation in API route (no job queue -- < 100 PDFs/day)
- One API route per document type: /api/pdf/angebot/[anfrageId], /api/pdf/rechnung/[anfrageId], /api/pdf/gutschrift/[anfrageId]
- Simple try/catch as memory guard (no semaphore -- 8GB VPS)
- System fonts (Helvetica built into @react-pdf) -- no custom fonts
- A4 portrait only, German only
- PDF-Preview Route /api/pdf-preview/[type] with mock data, staff-protected
- Professional-schlicht business layout (no color accents)
- Rechnungen-Collection (slug: 'rechnungen'): rechnung + gutschrift types, immutable
- Angebote-Collection (slug: 'angebote'): separate, version field, immutable after send
- PDF-Uploads-Collection (slug: 'pdf_uploads'): dedicated upload collection for PDFs
- Auto-trigger: Rechnung at 'bezahlt', Angebot at 'angebot_versendet', Gutschrift at 'rueckerstattung_abgeschlossen'
- Download streams stored PDF (no re-rendering)
- E-Mail attachment: PDF as Base64 in email_queue payload_data.attachments array
- Dateiname-Schema: Angebot_ANF-2026-0042_V1.pdf, Rechnung_ANF-2026-0042.pdf, Gutschrift_ANF-2026-0042.pdf
- Navigation: Rechnungen and Angebote under 'Bestellungen' dropdown
- Admin + Mitarbeiter see both collections, only Admin can create, Kunden see own docs only

### Claude's Discretion
- @react-pdf/renderer StyleSheet implementation and exact layout details
- ProduktBlock component implementation (mapping configuration snapshot to display)
- PDF-Preview mock data structure
- Exact Angebote-Collection field configuration (status, gueltig_bis, freitext etc.)
- PDF-Upload collection configuration (mimeTypes, maxFileSize)
- afterChange hook implementation for auto-trigger (error handling, ordering with email queue)
- Admin detail-view Dokumente panel styling (inline styles + admin-custom.css)

### Deferred Ideas (OUT OF SCOPE)
- Angebots-Erstellungs-Modal with price adjustment and justification -- Phase 28: Angebots-Workflow
- Stripe Zahlungslink in Angebots-PDF -- Phase 27: Stripe End-to-End
- AGB as PDF download beside AGB link -- when AGB finalized
- PDF design with custom fonts from Style Guide -- currently system fonts, later optional
- Multi-language PDFs (DE/EN) -- when international customers come
- S3/Cloud storage for PDFs -- Docker volume sufficient, migration possible later
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PDF-01 | PDF-Infrastruktur mit @react-pdf/renderer (lib/pdf/, API-Route) | @react-pdf/renderer v4.3.2 compatible with React 19 + Next.js 15. renderToStream for API routes. serverComponentsExternalPackages config needed. Established renderEmailForEvent pattern to follow. |
| PDF-02 | Angebots-PDF mit Konfiguration, Preisen (netto+MwSt+brutto), Gueltigkeit, Widerrufshinweis | @react-pdf Document/Page/View/Text/Image components. A4 page size built-in. StyleSheet.create() for layout. Settings Global has widerrufsbelehrung, angebots_gueltigkeit_tage, pdf_logo fields. tax.ts splitLine() for MwSt calculation. getNextNumber('ANG') for numbering. |
| PDF-03 | Rechnungs-PDF nach Paragraph 14 UStG (10 Pflichtangaben inkl. Steuernummer, Zahlungsvermerk) | Settings Global has steuernummer, ust_id, bank_iban, bank_bic, bank_name fields. getNextNumber('RE') for numbering. All 10 UStG requirements can be sourced from Settings + Anfrage data. |
| PDF-04 | Gutschrift-PDF bei Rueckerstattung (GS-Nummer, Referenz auf Original-Rechnung) | getNextNumber('GS') for numbering. Gutschrift stored in same Rechnungen collection with typ='gutschrift'. Relationship to original Rechnung. |
| PDF-05 | Rechnungen Collection (immutable -- kein Update/Delete, Archivierungspflicht) | Payload access control: update/delete return false. beforeChange hook as immutability guard. Combined rechnung+gutschrift collection with type field and filter tabs (established pattern from Anfragen list). |
| PDF-06 | PDF-Download in Admin + Kunden-Dashboard | API routes stream stored PDF with Content-Disposition: attachment. Admin: Dokumente tab in TabPanel. Kunden: section in AnfrageDetail component. Access check: anfrage.kontaktdaten.email matches logged-in user. |
| PDF-07 | PDF als Base64-Attachment im N8N Webhook Payload | Extend processQueue POST body to include attachments array. Extend email_queue collection with optional attachments JSON field. PDF Buffer.toString('base64') at queue-time. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-pdf/renderer | ^4.3.2 | Server-side PDF generation from JSX | React-native styling, no browser dependency, built-in Helvetica, works in Node.js API routes |
| payload | 3.79.0 (existing) | CMS collections for rechnungen, angebote, pdf_uploads | Already the project CMS, upload collection support built-in |
| next | 15.4.11 (existing) | API route handlers for PDF endpoints | Already the project framework |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react (existing) | ^19.1.0 | JSX for PDF templates | Always -- @react-pdf uses React components |
| tax.ts (existing) | N/A | Cent-integer MwSt calculations | Every PDF that shows prices |
| nummernkreise.ts (existing) | N/A | Atomic document number generation | Every PDF creation (ANG/RE/GS) |
| settings.ts (existing) | N/A | Company data, tax info, logo | Every PDF header/footer |
| format-currency.ts (existing) | N/A | formatCents() for price display | Every price line in PDFs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @react-pdf/renderer | puppeteer/playwright | 500MB+ binary, heavy memory, browser dependency -- overkill for A4 business docs |
| @react-pdf/renderer | pdfkit | Lower-level API, no JSX templates, more boilerplate |
| @react-pdf/renderer | jsPDF | Browser-focused, limited server support, no React component model |

**Installation:**
```bash
npm install @react-pdf/renderer
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/pdf/
│   ├── render-pdf.ts              # Central renderPDF() orchestrator (analog to render-email.ts)
│   ├── types.ts                   # PDFDocumentType, PDFRenderResult, ProduktLineItem interfaces
│   ├── mock-data.ts               # Mock data for PDF preview route
│   ├── components/
│   │   ├── pdf-header.tsx         # Logo + Firmendaten (shared across all 3 templates)
│   │   ├── pdf-footer.tsx         # 3-column footer: Bank | Steuer | Kontakt + Seitenzahl
│   │   ├── produkt-block.tsx      # Product line items with multi-line config details
│   │   └── mwst-block.tsx         # Netto + MwSt + Brutto summary block
│   └── templates/
│       ├── angebot-pdf.tsx        # Angebot template (extends shared components)
│       ├── rechnung-pdf.tsx       # Rechnung template (extends shared components)
│       └── gutschrift-pdf.tsx     # Gutschrift template (extends shared components)
├── collections/
│   └── business/
│       ├── rechnungen.ts          # Rechnungen + Gutschriften (immutable)
│       ├── angebote.ts            # Angebote (versioniert, immutable nach Versand)
│       └── pdf-uploads.ts         # Upload collection for PDF files only
└── app/
    └── (payload)/api/
        ├── pdf/
        │   ├── angebot/[anfrageId]/route.ts    # Generate/download Angebot PDF
        │   ├── rechnung/[anfrageId]/route.ts   # Generate/download Rechnung PDF
        │   └── gutschrift/[anfrageId]/route.ts  # Generate/download Gutschrift PDF
        └── pdf-preview/
            └── [type]/route.ts                  # Staff-protected preview with mock data
```

### Pattern 1: Central renderPDF() Orchestrator
**What:** Single entry point function analogous to renderEmailForEvent()
**When to use:** Every PDF generation (API routes, afterChange hooks, preview)
**Example:**
```typescript
// Source: Adapted from existing src/lib/email/render-email.ts pattern
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';

type PDFDocumentType = 'angebot' | 'rechnung' | 'gutschrift';

const TEMPLATE_COMPONENTS: Record<PDFDocumentType, () => Promise<{ default: React.ComponentType<any> }>> = {
  angebot: () => import('./templates/angebot-pdf'),
  rechnung: () => import('./templates/rechnung-pdf'),
  gutschrift: () => import('./templates/gutschrift-pdf'),
};

export async function renderPDF(
  type: PDFDocumentType,
  props: Record<string, unknown>,
): Promise<Buffer> {
  const loader = TEMPLATE_COMPONENTS[type];
  const mod = await loader();
  const Component = mod.default;
  const element = createElement(Component, props);
  // renderToBuffer returns a NodeJS.Buffer
  const buffer = await renderToBuffer(element);
  return Buffer.from(buffer);
}
```

### Pattern 2: Immutable Collection with beforeChange Guard
**What:** Prevent updates/deletes on archived business documents
**When to use:** Rechnungen and Angebote (after status change)
**Example:**
```typescript
// Source: Payload CMS collection pattern
export const Rechnungen: CollectionConfig = {
  slug: 'rechnungen',
  access: {
    read: ({ req }) => ['admin', 'mitarbeiter'].includes(req.user?.rolle || ''),
    create: ({ req }) => req.user?.rolle === 'admin',
    update: () => false,  // Immutable
    delete: () => false,  // Immutable
  },
  hooks: {
    beforeChange: [
      ({ operation }) => {
        if (operation === 'update') {
          throw new APIError('Rechnungen koennen nicht geaendert werden.', 403);
        }
      },
    ],
  },
  // fields...
};
```

### Pattern 3: PDF Auto-Trigger via afterChange Hook
**What:** Generate PDF automatically when Anfrage status changes to trigger status
**When to use:** Status transitions: bezahlt -> Rechnung, angebot_versendet -> Angebot
**Example:**
```typescript
// Source: Existing anfragen.ts afterChange hook pattern
// Inside the existing afterChange hook, add after email queuing:
if (doc.status === 'bezahlt' && previousDoc?.status !== 'bezahlt') {
  try {
    // Generate Rechnung PDF and store in collection
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/pdf/rechnung/${doc.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    // Or call internal function directly
  } catch (err) {
    console.error('[PDF Auto-Trigger] Rechnung generation failed (non-blocking):', err);
  }
}
```

### Pattern 4: PDF Upload + Store as Relationship
**What:** Upload generated PDF to pdf_uploads collection, link from business document
**When to use:** Every PDF generation stores the file and links it
**Example:**
```typescript
// Generate PDF buffer
const pdfBuffer = await renderPDF('rechnung', props);
const filename = `Rechnung_${anfrageNummer}.pdf`;

// Upload to pdf_uploads collection
const uploadedFile = await payload.create({
  collection: 'pdf_uploads',
  data: { alt: filename },
  file: {
    data: pdfBuffer,
    name: filename,
    mimetype: 'application/pdf',
    size: pdfBuffer.length,
  },
});

// Create Rechnung entry with relationship to uploaded PDF
await payload.create({
  collection: 'rechnungen',
  data: {
    typ: 'rechnung',
    nummer: rechnungNummer,
    anfrage: anfrageId,
    pdf: uploadedFile.id, // relationship to pdf_uploads
    betrag_netto_cents: netCents,
    betrag_brutto_cents: grossCents,
    mwst_cents: taxCents,
    mwst_satz: mwstSatz,
  },
});
```

### Pattern 5: Webhook Attachments Extension
**What:** Add PDF as Base64 attachment to N8N webhook POST body
**When to use:** Email events that should include PDF (angebot_versendet, bezahlt, rueckerstattung_abgeschlossen)
**Example:**
```typescript
// In processQueue, extend the POST body:
const bodyPayload: Record<string, unknown> = {
  to: entryData.to,
  subject: entryData.subject,
  html: entryData.html,
  plain_text: entryData.plain_text,
  reply_to: entryData.reply_to,
};

// Add attachments from payload_data if present
const payloadData = entryData.payload_data as Record<string, unknown>;
if (payloadData?.attachments && Array.isArray(payloadData.attachments)) {
  bodyPayload.attachments = payloadData.attachments;
  // Each: { filename: string, content_base64: string, mimetype: 'application/pdf' }
}
```

### Anti-Patterns to Avoid
- **Re-rendering PDFs on download:** Never regenerate a PDF when downloading. Always stream the stored file from pdf_uploads. This guarantees the archived document matches what was sent.
- **Storing PDF binary in email_queue:** Do not store the entire Base64 PDF string in the email_queue HTML fields. Store it in payload_data.attachments so it is cleanly separated.
- **Custom font loading at render time:** Avoid Font.register() calls -- use built-in Helvetica. Custom fonts add complexity, download latency, and potential failures.
- **Floating-point money in PDFs:** All amounts must use integer cents from tax.ts. Format with formatCents() only at display time.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MwSt calculation | Custom arithmetic | `tax.ts` splitLine(), calcGrossFromNet() | Rounding edge cases, cent-integer discipline already solved |
| Document numbering | Manual counter | `getNextNumber('ANG'|'RE'|'GS')` | Atomic, transaction-safe, gap-free sequence already built |
| Company data | Hardcoded strings | `getSettings()` | All company info in Settings Global, single source of truth |
| Currency formatting | Template-local formatting | `formatCents()` | German locale EUR formatting consistent project-wide |
| PDF page numbers | Manual tracking | `<Text render={({ pageNumber, totalPages }) => ...} fixed />` | @react-pdf built-in dynamic content API |
| Upload file handling | Manual file I/O | Payload Upload collection | Handles storage, serving, cleanup, access control |
| Immutability enforcement | Application-level checks only | Payload access + beforeChange hook | Belt-and-suspenders: access control blocks REST, hook blocks internal API |

**Key insight:** Phase 24 built all the foundation utilities (tax.ts, nummernkreise.ts, settings.ts, format-currency.ts) specifically for this phase. Use them -- do not duplicate logic.

## Common Pitfalls

### Pitfall 1: @react-pdf/renderer Not Found in Next.js Bundler
**What goes wrong:** Import errors or "module not found" when using @react-pdf in API routes
**Why it happens:** Next.js bundles server code differently; @react-pdf's Yoga layout engine uses native bindings
**How to avoid:** Add to `serverComponentsExternalPackages` in next.config.mjs:
```javascript
const nextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  // ...existing webpack config
}
```
Note: In Next.js 15, `serverComponentsExternalPackages` was renamed to `serverExternalPackages`.
**Warning signs:** "PDFDocument is not a constructor", React Error #31, "__dirname is not defined"

### Pitfall 2: renderToBuffer vs renderToStream
**What goes wrong:** Using renderToStream where a Buffer is needed (e.g., for Base64 encoding or Payload upload)
**Why it happens:** Official docs list renderToStream/renderToFile/renderToString but not renderToBuffer (it exists but is undocumented)
**How to avoid:** Use renderToBuffer for PDF generation where you need a Buffer (upload, Base64). If renderToBuffer fails, fall back to collecting renderToStream chunks into a Buffer:
```typescript
import { renderToStream } from '@react-pdf/renderer';

async function streamToBuffer(element: React.ReactElement): Promise<Buffer> {
  const stream = await renderToStream(element);
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
```
**Warning signs:** "renderToBuffer is not a function" errors

### Pitfall 3: Logo Image Loading in Server Context
**What goes wrong:** Image component fails to load logo from URL in server-side rendering
**Why it happens:** @react-pdf Image requires accessible URL or Buffer; relative paths don't work server-side
**How to avoid:** Read the logo file from disk using the Payload media storage path, or fetch it as a Buffer before rendering:
```typescript
import fs from 'fs';
import path from 'path';

// Option A: Read from Payload media directory
const logoPath = path.join(process.cwd(), 'media', settings.pdf_logo.filename);
const logoBuffer = fs.readFileSync(logoPath);
// Pass as: { data: logoBuffer, format: 'png' }

// Option B: Construct full URL
const logoUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/media/file/${settings.pdf_logo.filename}`;
```
**Warning signs:** Empty logo area in PDF, "fetch failed" errors during render

### Pitfall 4: Cent-to-Display Formatting in PDF
**What goes wrong:** Prices show raw cent values (e.g., "49900" instead of "499,00 EUR")
**Why it happens:** Forgetting to divide by 100 or using wrong locale
**How to avoid:** Always use `formatCents()` from lib/format-currency.ts for all price display in PDFs
**Warning signs:** Absurdly large price numbers in generated PDFs

### Pitfall 5: afterChange Hook Ordering (PDF + Email)
**What goes wrong:** Email is sent before PDF is generated, so attachment is missing
**Why it happens:** Both PDF generation and email queueing happen in the same afterChange hook; if email is queued first, the PDF doesn't exist yet
**How to avoid:** Generate PDF first, then queue email with attachment. The afterChange hook must:
1. Generate PDF via renderPDF()
2. Store PDF in pdf_uploads + create rechnungen/angebote entry
3. Convert PDF buffer to Base64
4. Queue email with attachments array in payload
**Warning signs:** Emails arrive without PDF attachment

### Pitfall 6: Large PDFs in email_queue JSON Field
**What goes wrong:** email_queue entries become very large (100KB+ per PDF as Base64)
**Why it happens:** Base64 encoding inflates binary by ~33%. A 200KB PDF becomes ~270KB of text stored in a JSON field.
**How to avoid:** This is acceptable for the expected volume (<100 PDFs/day). A typical invoice PDF is 50-150KB, so Base64 is ~70-200KB. The email_queue uses Postgres jsonb which handles this fine. If this becomes a concern, the deferred S3 migration would solve it.
**Warning signs:** Database size growing rapidly, slow queue processing

### Pitfall 7: Immutability Bypass via Internal API
**What goes wrong:** Despite access control blocking REST updates, server-side code using `payload.update()` can still modify immutable documents
**Why it happens:** Payload access functions check user auth; server-side calls with `overrideAccess: true` bypass them
**How to avoid:** Use BOTH access control AND a beforeChange hook guard:
```typescript
beforeChange: [({ operation }) => {
  if (operation === 'update') {
    throw new APIError('Rechnungen sind unveraenderbar (Archivierungspflicht).', 403);
  }
}]
```
**Warning signs:** Rechnungen records modified after creation

## Code Examples

### @react-pdf/renderer: Basic A4 Document Template
```typescript
// Source: https://react-pdf.org/components + https://react-pdf.org/styling
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60, // Space for footer
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    maxWidth: 120,
    maxHeight: 60,
  },
  companyInfo: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 700, // 'bold' also works
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9ca3af',
  },
});

export default function AngebotPDF({ /* props */ }) {
  return (
    <Document title="Angebot" language="de">
      <Page size="A4" style={styles.page}>
        {/* Header: Logo + Company Info */}
        <View style={styles.header}>
          <Image src={logoSrc} style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text>{settings.firmenname}</Text>
            <Text>{settings.adresse_strasse} {settings.adresse_hausnummer}</Text>
            <Text>{settings.adresse_plz} {settings.adresse_ort}</Text>
          </View>
        </View>
        <View style={styles.separator} />

        {/* Document content... */}

        {/* Footer (fixed = appears on every page) */}
        <View style={styles.footer} fixed>
          <View>
            <Text>IBAN: {settings.bank_iban}</Text>
            <Text>BIC: {settings.bank_bic}</Text>
            <Text>{settings.bank_name}</Text>
          </View>
          <View>
            <Text>St.-Nr.: {settings.steuernummer}</Text>
            <Text>USt-IdNr.: {settings.ust_id}</Text>
          </View>
          <View>
            <Text>{settings.telefon}</Text>
            <Text>{settings.email}</Text>
            <Text render={({ pageNumber, totalPages }) =>
              `Seite ${pageNumber} von ${totalPages}`
            } />
          </View>
        </View>
      </Page>
    </Document>
  );
}
```

### @react-pdf/renderer: Table Layout with Product Block
```typescript
// Source: @react-pdf/renderer flexbox styling (https://react-pdf.org/styling)
const tableStyles = StyleSheet.create({
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontWeight: 700,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  colPos: { width: '6%' },
  colDesc: { width: '44%' },
  colQty: { width: '10%', textAlign: 'right' },
  colUnit: { width: '18%', textAlign: 'right' },
  colTotal: { width: '22%', textAlign: 'right' },
  configLine: { fontSize: 8, color: '#6b7280', marginTop: 2 },
});

function ProduktBlock({ produkt, index }: { produkt: ProduktLineItem; index: number }) {
  return (
    <View style={tableStyles.tableRow} wrap={false}>
      <Text style={tableStyles.colPos}>{index + 1}</Text>
      <View style={tableStyles.colDesc}>
        <Text style={{ fontWeight: 700 }}>
          {produkt.produkttyp} {produkt.material} - {produkt.profil}
        </Text>
        <Text style={tableStyles.configLine}>
          {produkt.masse_breite}x{produkt.masse_hoehe}mm | {produkt.fluegelanzahl}
        </Text>
        <Text style={tableStyles.configLine}>
          Aussen: {produkt.farbe_aussen} | Innen: {produkt.farbe_innen}
        </Text>
        {produkt.weitere_optionen && (
          <Text style={tableStyles.configLine}>{produkt.weitere_optionen}</Text>
        )}
      </View>
      <Text style={tableStyles.colQty}>{produkt.stueckzahl}x</Text>
      <Text style={tableStyles.colUnit}>{formatCents(produkt.einzelpreis)}</Text>
      <Text style={tableStyles.colTotal}>
        {formatCents(produkt.einzelpreis * produkt.stueckzahl)}
      </Text>
    </View>
  );
}
```

### Payload Upload Collection for PDFs
```typescript
// Source: Payload CMS docs (https://payloadcms.com/docs/upload/overview)
import type { CollectionConfig } from 'payload';

export const PDFUploads: CollectionConfig = {
  slug: 'pdf_uploads',
  labels: { singular: 'PDF-Dokument', plural: 'PDF-Dokumente' },
  admin: {
    group: 'System',
  },
  access: {
    read: ({ req }) => {
      if (['admin', 'mitarbeiter'].includes(req.user?.rolle || '')) return true;
      // Kunden access controlled via business collection relationship
      return false;
    },
    create: () => true, // Server-side creation (no auth context)
    update: () => false, // Immutable
    delete: ({ req }) => req.user?.rolle === 'admin',
  },
  upload: {
    mimeTypes: ['application/pdf'],
    staticDir: 'pdf-uploads',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Dateiname',
    },
  ],
};
```

### API Route: PDF Download (Streaming Stored File)
```typescript
// Source: Next.js API route pattern (project existing routes)
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ anfrageId: string }> },
) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });

  if (!['admin', 'mitarbeiter'].includes(user?.rolle || '')) {
    return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
  }

  const { anfrageId } = await params;

  // Find the Rechnung for this Anfrage
  const result = await payload.find({
    collection: 'rechnungen',
    where: { anfrage: { equals: anfrageId } },
    limit: 1,
    depth: 1, // Populate pdf relationship
  });

  if (result.docs.length === 0) {
    return NextResponse.json({ error: 'Keine Rechnung gefunden' }, { status: 404 });
  }

  const rechnung = result.docs[0];
  const pdfUpload = rechnung.pdf; // Populated relationship

  // Stream the stored PDF file
  const filePath = path.join(process.cwd(), 'pdf-uploads', pdfUpload.filename);
  const fileBuffer = fs.readFileSync(filePath);
  const filename = `Rechnung_${rechnung.anfrage_nummer}.pdf`;

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| puppeteer/wkhtmltopdf for PDF | @react-pdf/renderer (JSX components) | 2022+ | No browser binary needed, ~50MB vs ~500MB memory, type-safe |
| renderToFile + read back | renderToBuffer (direct) | @react-pdf v3+ | No temp file needed, faster |
| serverComponentsExternalPackages | serverExternalPackages | Next.js 15 | Config key renamed (old key still works as alias) |
| @react-pdf peerDep React 18 | React 19 support | @react-pdf v4.1.0 | Can use with project's React 19.1.0 |

**Deprecated/outdated:**
- `renderToString` returns a PDF as string -- rarely useful, prefer renderToBuffer for binary operations
- `PDFViewer` component -- browser-only, not relevant for server-side generation

## Open Questions

1. **renderToBuffer availability in Next.js 15**
   - What we know: renderToBuffer is not in official docs but works in practice. Some GitHub issues report "PDFDocument is not a constructor" in Next.js 15 but this was fixed by upgrading to React 19.0.0+ (which this project already has at 19.1.0).
   - What's unclear: Whether renderToBuffer works reliably in the exact Next.js 15.4.11 + React 19.1.0 combination in production (Coolify Docker).
   - Recommendation: Test renderToBuffer first. If it fails, use the renderToStream-to-Buffer fallback (collect stream chunks). Both approaches are documented above.

2. **PDF file storage path in Docker**
   - What we know: Payload Upload collections store files in a `staticDir` relative to project root. In Docker, this must be a persistent volume.
   - What's unclear: Whether the Coolify Docker deployment already has persistent volume mounts for the `media/` directory (used by existing Media collection).
   - Recommendation: Use a `pdf-uploads/` directory alongside `media/`. In Docker compose, ensure both directories are mounted as persistent volumes. This is a deployment concern, not a code concern.

3. **Maximum PDF size for Base64 in email_queue**
   - What we know: A typical invoice PDF is 50-150KB. Base64 inflates by ~33%. Postgres jsonb handles this fine.
   - What's unclear: Whether N8N's webhook receiver has a body size limit that could reject large payloads.
   - Recommendation: Default N8N body limit is 16MB, far exceeding expected needs. No action required.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (via existing project config) |
| Config file | jest.config.ts (existing) |
| Quick run command | `npx jest --testPathPattern=pdf --no-coverage -x` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PDF-01 | renderPDF generates valid Buffer | unit | `npx jest tests/unit/test-render-pdf.test.ts -x` | Wave 0 |
| PDF-02 | Angebot PDF contains required fields (prices, validity, Widerrufshinweis) | unit | `npx jest tests/unit/test-angebot-pdf.test.ts -x` | Wave 0 |
| PDF-03 | Rechnung PDF has 10 UStG Pflichtangaben | unit | `npx jest tests/unit/test-rechnung-pdf.test.ts -x` | Wave 0 |
| PDF-04 | Gutschrift references original Rechnung, has GS-Nummer | unit | `npx jest tests/unit/test-gutschrift-pdf.test.ts -x` | Wave 0 |
| PDF-05 | Rechnungen collection rejects update/delete | unit | `npx jest tests/unit/test-rechnungen-collection.test.ts -x` | Wave 0 |
| PDF-06 | PDF download API returns application/pdf with correct headers | manual-only | Manual: curl /api/pdf/rechnung/[id] | N/A (requires running server + DB) |
| PDF-07 | Email queue entry includes attachments array with Base64 | unit | `npx jest tests/unit/test-pdf-attachment.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=pdf --no-coverage -x`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-render-pdf.test.ts` -- covers PDF-01 (renderPDF returns Buffer, correct size)
- [ ] `tests/unit/test-angebot-pdf.test.ts` -- covers PDF-02 (Angebot content validation)
- [ ] `tests/unit/test-rechnung-pdf.test.ts` -- covers PDF-03 (UStG Pflichtangaben)
- [ ] `tests/unit/test-gutschrift-pdf.test.ts` -- covers PDF-04 (Gutschrift reference)
- [ ] `tests/unit/test-rechnungen-collection.test.ts` -- covers PDF-05 (immutability)
- [ ] `tests/unit/test-pdf-attachment.test.ts` -- covers PDF-07 (Base64 attachment in queue)

Note: Testing @react-pdf/renderer output in Jest requires the actual package installed. Tests can verify Buffer output is non-empty and has PDF magic bytes (%PDF-). Content verification (e.g., "contains Steuernummer") requires parsing the PDF output text.

## Sources

### Primary (HIGH confidence)
- [@react-pdf/renderer npm](https://www.npmjs.com/package/@react-pdf/renderer) - v4.3.2, React 19 support since v4.1.0
- [React-PDF official docs - Components](https://react-pdf.org/components) - Document, Page, View, Text, Image props
- [React-PDF official docs - Styling](https://react-pdf.org/styling) - StyleSheet API, all CSS properties, valid units
- [React-PDF official docs - Node API](https://react-pdf.org/node) - renderToStream, renderToFile, renderToString
- [React-PDF official docs - Advanced](https://react-pdf.org/advanced) - Page wrapping, fixed elements, dynamic content, page numbers
- [React-PDF official docs - Compatibility](https://react-pdf.org/compatibility) - Next.js, Node.js, React version support
- [Payload CMS Upload docs](https://payloadcms.com/docs/upload/overview) - Upload collection configuration, mimeTypes

### Secondary (MEDIUM confidence)
- [GitHub Issue #3074](https://github.com/diegomura/react-pdf/issues/3074) - renderToBuffer with Next.js 15 confirmed working with React 19
- [GitHub Issue #2994](https://github.com/diegomura/react-pdf/issues/2994) - Next.js 15 renderToStream Error #31 (React version mismatch root cause)
- [GitHub Issue #2756](https://github.com/diegomura/react-pdf/issues/2756) - React 19 compatibility confirmed in v4.1.0+
- Existing project codebase: src/lib/email/render-email.ts, src/lib/tax.ts, src/lib/nummernkreise.ts, src/lib/settings.ts, src/lib/format-currency.ts, src/collections/business/anfragen.ts, src/components/admin/tab-panel.tsx, src/components/admin/custom-nav.tsx

### Tertiary (LOW confidence)
- renderToBuffer function: Not in official docs, confirmed to exist via npm package and GitHub issues. Fallback (renderToStream to Buffer) documented as alternative.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - @react-pdf/renderer v4.3.2 compatibility confirmed for React 19 + Next.js 15 via GitHub issues and official docs
- Architecture: HIGH - Direct adaptation of established project patterns (renderEmailForEvent, afterChange hooks, Payload collections, email preview routes)
- Pitfalls: HIGH - Well-documented compatibility issues with specific known workarounds. Project already uses React 19.1.0 which resolves the main compatibility issue.
- Code examples: HIGH - Based on official @react-pdf docs + verified against existing project patterns

**Research date:** 2026-03-31
**Valid until:** 2026-04-30 (30 days -- @react-pdf is stable, Payload CMS update cycle moderate)
