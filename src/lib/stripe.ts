import Stripe from "stripe";
import { getSettings } from "@/lib/settings";

/**
 * Stripe client lazy-initializer with env guards.
 * Avoids import-time crashes if env is missing.
 */
let stripeClient: Stripe | null = null;
export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(key, { typescript: true });
  }
  return stripeClient;
}

// --- Checkout Session ---

export interface CreateCheckoutOptions {
  anfrageId: string;
  anfrageNummer: string;
  gesamtpreis: number; // in cents
  produktAnzahl: number;
  kundenEmail: string;
  kundenName: string;
  userId?: string; // if logged in
  metadata?: Record<string, string>; // additional metadata for flow identification
}

/**
 * Creates a Stripe Checkout Session for a confirmed Anfrage.
 * Integrates Customer lookup/creation, Settings-driven currency/expiry,
 * and returns the full Session object.
 */
export async function createCheckoutSession(
  opts: CreateCheckoutOptions,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const settings = await getSettings();

  // Expiry: clamp to Stripe's 30min-24h window
  const ablaufStunden = Math.min(
    Math.max(
      (settings as Record<string, unknown>).stripe_zahlungslink_ablauf_stunden
        ? Number(
            (settings as Record<string, unknown>)
              .stripe_zahlungslink_ablauf_stunden,
          )
        : 24,
      0.5,
    ),
    24,
  );
  const waehrung = (
    ((settings as Record<string, unknown>).stripe_waehrung as string) || "eur"
  ).toLowerCase();
  const expiresAt =
    Math.floor(Date.now() / 1000) + Math.floor(ablaufStunden * 3600);

  // Find or create Stripe Customer (DSGVO minimal: only email + name)
  const customerId = await findOrCreateStripeCustomer(
    opts.kundenEmail,
    opts.kundenName,
    opts.userId,
  );

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    currency: waehrung,
    line_items: [
      {
        price_data: {
          currency: waehrung,
          unit_amount: opts.gesamtpreis,
          product_data: {
            name: `Anfrage ${opts.anfrageNummer}`,
            description: `${opts.produktAnzahl} Produkt(e)`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      anfrage_id: opts.anfrageId,
      anfrage_nummer: opts.anfrageNummer,
      ...opts.metadata,
    },
    expires_at: expiresAt,
    success_url: `${baseUrl}/zahlung/erfolgreich?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/zahlung/abgebrochen`,
  });

  return session;
}

// --- Customer Management ---

/**
 * Find existing Stripe Customer by email, or create new one.
 * DSGVO minimal: only email + name sent to Stripe.
 * Stores stripe_customer_id on Users collection if userId provided.
 */
export async function findOrCreateStripeCustomer(
  email: string,
  name: string,
  userId?: string,
): Promise<string> {
  const stripe = getStripe();

  // Check if user already has a stored customer ID
  if (userId) {
    const { getPayload } = await import("payload");
    const payloadConfig = (await import("@payload-config")).default;
    const payload = await getPayload({ config: payloadConfig });
    const user = await payload.findByID({ collection: "users", id: userId });
    // stripe_customer_id not yet in payload-types -- use runtime check
    const userAny = user as unknown as Record<string, unknown>;
    if (userAny.stripe_customer_id) {
      return userAny.stripe_customer_id as string;
    }
  }

  // Look up existing Stripe customer by email
  const existing = await stripe.customers.list({ email, limit: 1 });
  let customerId: string;

  if (existing.data.length > 0) {
    customerId = existing.data[0].id;
  } else {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { user_id: userId || "guest" },
    });
    customerId = customer.id;
  }

  // Store on user record if userId provided
  if (userId) {
    try {
      const { getPayload } = await import("payload");
      const payloadConfig = (await import("@payload-config")).default;
      const payload = await getPayload({ config: payloadConfig });
      await payload.update({
        collection: "users",
        id: userId,
        data: { stripe_customer_id: customerId } as never,
      });
    } catch (err) {
      console.error("[Stripe] Failed to store customer ID on user:", err);
    }
  }

  return customerId;
}

// --- Session Lifecycle ---

/**
 * Expire an existing Checkout Session if it's still active.
 * Prevents double-payment (STRP-06: max 1 active session per Anfrage).
 */
export async function expireExistingSession(sessionId: string): Promise<void> {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status === "open") {
      await stripe.checkout.sessions.expire(sessionId);
      console.info("[Stripe] Expired old session", { sessionId });
    }
  } catch (err) {
    // Session may already be expired or completed -- non-fatal
    console.info(
      "[Stripe] Could not expire session (may already be closed)",
      { sessionId },
      err,
    );
  }
}
