import { getSettings } from "@/lib/settings";
import AnfragePageClient from "./anfrage-page-client";

/**
 * Anfrage contact form page — Step 2 of 3.
 * Server component wrapper that fetches the dynamic AGB link from Settings Global
 * and passes it to the client component.
 */
export default async function AnfragePage() {
  const settings = await getSettings();
  const agbLink =
    ((settings as Record<string, unknown>).agb_link as string) || "/agb";

  return <AnfragePageClient agbLink={agbLink} />;
}
