import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { getStatusColor, getStatusLabel } from "@/lib/status-config";

/**
 * GET /api/admin/dashboard-stats
 * Dashboard statistics API with parallel queries including dringend count.
 *
 * Returns:
 *  - stats: { neueHeute, offeneGesamt, bestaetigteMonat, umsatzCents, dringend }
 *  - statusDistribution: Array<{ status, count, color, label }>
 *  - letzte10: Array of enriched anfragen docs
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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  // Non-terminal statuses for dringend count
  const nonTerminalStatuses = [
    "neu",
    "in_bearbeitung",
    "rueckfrage",
    "angebot_versendet",
    "bestaetigt",
    "zahlungslink_versendet",
    "bezahlt",
    "hersteller_problem",
    "zahlungsproblem",
    "wieder_geoeffnet",
    "stornierung_beantragt",
    "kundenantwort",
  ];

  // All stat queries in parallel
  const [
    neueHeute,
    offeneGesamt,
    bestaetigteMonat,
    dringendCount,
    letzte10,
    ...statusCountResults
  ] = await Promise.all([
    // Neue heute
    payload.count({
      collection: "anfragen",
      where: {
        status: { equals: "neu" },
        createdAt: { greater_than_equal: todayStart.toISOString() },
      },
    }),
    // Offene gesamt
    payload.count({
      collection: "anfragen",
      where: {
        status: { in: ["neu", "in_bearbeitung", "rueckfrage"] },
      },
    }),
    // Bestaetigte Monat
    payload.count({
      collection: "anfragen",
      where: {
        status: { equals: "bestaetigt" },
        createdAt: { greater_than_equal: monthStart.toISOString() },
      },
    }),
    // Dringend: non-terminal anfragen where last_status_change_at is older than 7 days
    // Uses server-side date query -- no limit=0 + JS filter needed
    payload.count({
      collection: "anfragen",
      where: {
        and: [
          { status: { in: nonTerminalStatuses } },
          {
            or: [
              // last_status_change_at exists and is older than 7 days
              {
                and: [
                  { last_status_change_at: { exists: true } },
                  { last_status_change_at: { less_than: sevenDaysAgo } },
                ],
              },
              // last_status_change_at is null but createdAt is older than 7 days
              {
                and: [
                  { last_status_change_at: { exists: false } },
                  { createdAt: { less_than: sevenDaysAgo } },
                ],
              },
            ],
          },
        ],
      },
    }),
    // Letzte 10
    payload.find({
      collection: "anfragen",
      sort: "-createdAt",
      limit: 10,
      depth: 0,
    }),
    // Status counts for distribution
    ...[
      "neu",
      "in_bearbeitung",
      "bestaetigt",
      "bezahlt",
      "abgeschlossen",
      "rueckfrage",
      "abgelehnt",
    ].map((status) =>
      payload.count({
        collection: "anfragen",
        where: { status: { equals: status } },
      }),
    ),
  ]);

  // Server-side Umsatz aggregation: paginate through paid/completed, sum server-side
  // Use paginated iteration instead of limit=0
  let umsatzCents = 0;
  let umsatzPage = 1;
  let hasMorePages = true;
  while (hasMorePages) {
    const batch = await payload.find({
      collection: "anfragen",
      where: { status: { in: ["bezahlt", "abgeschlossen"] } },
      page: umsatzPage,
      limit: 100,
      depth: 0,
    });
    for (const doc of batch.docs) {
      umsatzCents += (doc as any).gesamtpreis || 0;
    }
    hasMorePages = batch.hasNextPage;
    umsatzPage++;
  }

  // Build status distribution
  const allStatuses = [
    "neu",
    "in_bearbeitung",
    "bestaetigt",
    "bezahlt",
    "abgeschlossen",
    "rueckfrage",
    "abgelehnt",
  ];
  const statusDistribution = allStatuses
    .map((status, i) => ({
      status,
      count: statusCountResults[i].totalDocs,
      color: getStatusColor(status),
      label: getStatusLabel(status),
    }))
    .filter((s) => s.count > 0);

  // Enrich letzte10 with computed fields for display
  const letzte10Enriched = letzte10.docs.map((doc: any) => ({
    id: doc.id,
    anfrage_nummer: doc.anfrage_nummer,
    kontaktdaten: doc.kontaktdaten,
    status: doc.status,
    gesamtpreis: doc.gesamtpreis,
    createdAt: doc.createdAt,
    last_status_change_at: doc.last_status_change_at,
    statusColor: getStatusColor(doc.status),
    statusLabel: getStatusLabel(doc.status),
  }));

  return NextResponse.json({
    stats: {
      neueHeute: neueHeute.totalDocs,
      offeneGesamt: offeneGesamt.totalDocs,
      bestaetigteMonat: bestaetigteMonat.totalDocs,
      umsatzCents,
      dringend: dringendCount.totalDocs,
    },
    statusDistribution,
    letzte10: letzte10Enriched,
  });
}
