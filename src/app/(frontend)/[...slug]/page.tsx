import { notFound } from "next/navigation";

/**
 * Catch-all Route für Puck-CMS-Pages (temporär deaktiviert).
 * Wird reaktiviert sobald Puck wieder live geschaltet wird.
 */
export default function CmsPage() {
  return notFound();
}
