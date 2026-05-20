/**
 * PDF rendering orchestrator.
 *
 * Dynamically loads and renders PDF templates based on document type.
 * Returns a Buffer containing the rendered PDF and the filename.
 *
 * Pattern: Same lazy-loading approach as render-email.ts.
 */

import { createElement } from "react";
import type {
  PDFDocumentType,
  PDFTemplateProps,
  PDFRenderResult,
} from "./types";

// Template registry with lazy loading (same pattern as render-email.ts)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TEMPLATE_COMPONENTS: Record<
  PDFDocumentType,
  () => Promise<{ default: React.ComponentType<any> }>
> = {
  angebot: () => import("./templates/angebot-pdf"),
  rechnung: () => import("./templates/rechnung-pdf"),
  gutschrift: () => import("./templates/gutschrift-pdf"),
};

/**
 * Renders a PDF document of the given type.
 *
 * @param type - 'angebot' | 'rechnung' | 'gutschrift'
 * @param props - Template-specific props (AngebotPDFProps, RechnungPDFProps, or GutschriftPDFProps)
 * @param filename - Desired filename for the generated PDF (e.g. 'ANG-2026-0001.pdf')
 * @returns PDFRenderResult with buffer and filename
 */
export async function renderPDF(
  type: PDFDocumentType,
  props: PDFTemplateProps,
  filename: string,
): Promise<PDFRenderResult> {
  const { renderToBuffer } = await import("@react-pdf/renderer");

  const loader = TEMPLATE_COMPONENTS[type];
  if (!loader) throw new Error(`Unknown PDF template type: ${type}`);

  const mod = await loader();
  const Component = mod.default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(Component, props as any);

  let buffer: Buffer;
  try {
    // Primary: renderToBuffer (preferred, returns Uint8Array)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await renderToBuffer(element as any);
    buffer = Buffer.from(result);
  } catch {
    // Fallback: collect renderToStream chunks
    const { renderToStream } = await import("@react-pdf/renderer");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await renderToStream(element as any);
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    buffer = Buffer.concat(chunks);
  }

  return { buffer, filename };
}
