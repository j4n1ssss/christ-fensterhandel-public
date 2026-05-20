import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import type { Where } from "payload";
import config from "@payload-config";
import { LIST_TAB_FILTERS, type StatusKey } from "@/lib/status-config";
import { getAttentionScore } from "@/lib/list-view-helpers";
import { getWaitingDays, getUrgencyLevel } from "@/lib/detail-view-helpers";

/**
 * GET /api/admin/anfragen-list
 * Server-side paginated Anfragen list with tab counts, search, and attention sort.
 *
 * Query params:
 *  - page (default 1)
 *  - limit (default 25, max 100)
 *  - tab (default "alle") -- maps to LIST_TAB_FILTERS status arrays
 *  - sort (default "attention") -- "attention" | "anfrage_nummer" | "nachname" | "wartezeit" | "preis" | "erstellt"
 *  - dir (default "desc") -- "asc" | "desc"
 *  - q (default "") -- search string for anfrage_nummer, kontaktdaten.nachname, kontaktdaten.email
 */
export async function GET(request: NextRequest) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (
    !user ||
    !["admin", "mitarbeiter", "viewer"].includes(user.rolle as string)
  ) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("limit") || "25")),
  );
  const tab = url.searchParams.get("tab") || "alle";
  const sort = url.searchParams.get("sort") || "attention";
  const dir = url.searchParams.get("dir") || "desc";
  const q = (url.searchParams.get("q") || "").trim();

  // Build where clause from tab filter
  const tabStatuses = LIST_TAB_FILTERS[tab];
  const whereConditions: any[] = [];
  if (tabStatuses && tabStatuses.length > 0) {
    whereConditions.push({ status: { in: tabStatuses } });
  }

  // Search conditions (anfrage_nummer, kontaktdaten.nachname, kontaktdaten.email)
  if (q) {
    whereConditions.push({
      or: [
        { anfrage_nummer: { contains: q } },
        { "kontaktdaten.nachname": { contains: q } },
        { "kontaktdaten.email": { contains: q } },
      ],
    });
  }

  const where: Where | undefined =
    whereConditions.length > 0 ? { and: whereConditions } : undefined;

  // Determine sorting strategy
  const isAttentionSort = sort === "attention" || sort === "attention_score";

  let docs: any[];
  let totalDocs: number;
  let totalPages: number;

  if (isAttentionSort) {
    // ATTENTION SORT: Must fetch all matching docs, compute scores server-side, sort in JS, then paginate
    // This is necessary because attention_score is a computed value, not a DB field
    const allResult = await payload.find({
      collection: "anfragen",
      where,
      limit: 0,
      pagination: false,
      depth: 0,
    });

    // Enrich with attention scores
    const enriched = allResult.docs.map((doc: any) => ({
      ...doc,
      _attentionScore: getAttentionScore(
        doc.last_status_change_at,
        doc.createdAt,
        doc.status,
      ),
      _waitingDays: getWaitingDays(doc.last_status_change_at || doc.createdAt),
      _urgencyLevel: getUrgencyLevel(
        getWaitingDays(doc.last_status_change_at || doc.createdAt),
      ),
    }));

    // Sort by attention score
    const sortMultiplier = dir === "asc" ? 1 : -1;
    enriched.sort(
      (a: any, b: any) =>
        (a._attentionScore - b._attentionScore) * sortMultiplier,
    );

    totalDocs = enriched.length;
    totalPages = Math.max(1, Math.ceil(totalDocs / limit));

    // Paginate slice
    const startIndex = (page - 1) * limit;
    docs = enriched.slice(startIndex, startIndex + limit);
  } else {
    // NON-ATTENTION SORT: Use Payload native pagination
    const sortMap: Record<string, string> = {
      anfrage_nummer: "anfrage_nummer",
      nachname: "kontaktdaten.nachname",
      wartezeit: "last_status_change_at",
      preis: "gesamtpreis",
      erstellt: "createdAt",
    };

    const sortField = sortMap[sort] || "createdAt";
    const sortPrefix = dir === "desc" ? "-" : "";

    const result = await payload.find({
      collection: "anfragen",
      where,
      page,
      limit,
      sort: `${sortPrefix}${sortField}`,
      depth: 0,
    });

    // Enrich with computed fields
    docs = result.docs.map((doc: any) => ({
      ...doc,
      _attentionScore: getAttentionScore(
        doc.last_status_change_at,
        doc.createdAt,
        doc.status,
      ),
      _waitingDays: getWaitingDays(doc.last_status_change_at || doc.createdAt),
      _urgencyLevel: getUrgencyLevel(
        getWaitingDays(doc.last_status_change_at || doc.createdAt),
      ),
    }));

    totalDocs = result.totalDocs;
    totalPages = result.totalPages;
  }

  // Parallel tab counts (always computed for all tabs, regardless of current tab)
  const tabCountEntries = await Promise.all(
    Object.entries(LIST_TAB_FILTERS).map(async ([tabKey, statuses]) => {
      // Apply search filter to counts too (so counts reflect current search)
      const countWhere: any[] = [];
      if (statuses.length > 0) {
        countWhere.push({ status: { in: statuses } });
      }
      if (q) {
        countWhere.push({
          or: [
            { anfrage_nummer: { contains: q } },
            { "kontaktdaten.nachname": { contains: q } },
            { "kontaktdaten.email": { contains: q } },
          ],
        });
      }

      const countResult = await payload.count({
        collection: "anfragen",
        where:
          countWhere.length > 0 ? ({ and: countWhere } as Where) : undefined,
      });
      return [tabKey, countResult.totalDocs] as const;
    }),
  );

  const tabCounts = Object.fromEntries(tabCountEntries);

  return NextResponse.json({
    docs,
    totalDocs,
    totalPages,
    page,
    tabCounts,
  });
}
