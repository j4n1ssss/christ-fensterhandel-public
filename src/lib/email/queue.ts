/**
 * Email queue engine.
 *
 * Three main functions:
 * - queueEmailEvent: Creates queue entries with rendered HTML for each recipient
 * - processQueue: Picks up pending/failed entries and POSTs to N8N
 * - cleanupSentEvents: Deletes sent entries older than retention period
 *
 * Uses dynamic Payload imports to avoid initialization issues in hooks.
 */

import { z } from "zod";
import { EVENT_MATRIX } from "./event-matrix";
import type { EmailEventPayload, Recipient } from "./types";

const emailSchema = z.string().email();

/**
 * Queue email events for all recipients defined in the event matrix.
 *
 * Renders HTML at queue-time (data snapshot), validates emails,
 * respects event toggles, and creates queue entries via Payload API.
 *
 * Never throws -- errors are logged to console.
 */
export async function queueEmailEvent(
  eventPayload: EmailEventPayload,
): Promise<void> {
  try {
    const config = EVENT_MATRIX[eventPayload.eventType];
    if (!config) return;

    // Dynamic Payload import to avoid initialization issues
    const { getPayload } = await import("payload");
    const payloadConfig = (await import("@payload-config")).default;
    const payload = await getPayload({ config: payloadConfig });

    // Get settings for toggles, staff emails, reply_to, and template data
    const { getSettings } = await import("@/lib/settings");
    const settings = await getSettings();

    // Get render function
    const { renderEmailForEvent } = await import("@/lib/email/render-email");

    for (const recipient of config.empfaenger) {
      // Check event toggle
      const toggleKey = `${eventPayload.eventType}_${recipient}`;
      if (
        (settings as Record<string, unknown>).email_event_toggles &&
        (
          (settings as Record<string, unknown>).email_event_toggles as Record<
            string,
            boolean
          >
        )[toggleKey] === false
      ) {
        continue;
      }

      // Determine email addresses
      let emails: string[];
      if (recipient === "kunde") {
        emails = [eventPayload.kunde.email];
      } else {
        // staff
        const staffEmailsRaw =
          ((settings as Record<string, unknown>).benachrichtigungs_emails as
            | string
            | undefined) || "";
        emails = staffEmailsRaw
          .split(",")
          .map((e: string) => e.trim())
          .filter((e: string) => e.length > 0);
      }

      for (const email of emails) {
        // Validate email
        const validation = emailSchema.safeParse(email);
        if (!validation.success) {
          await payload.create({
            collection: "email_queue" as never,
            data: {
              event_type: eventPayload.eventType,
              to: email,
              subject: "",
              html: "",
              plain_text: "",
              reply_to: "",
              payload_data: eventPayload as unknown as Record<string, unknown>,
              status: "skipped",
              attempts: 0,
              max_attempts: 5,
              idempotency_key: `${eventPayload.anfrageId}_${eventPayload.eventType}_${eventPayload.status}_${Date.now()}`,
              error_log: "Ungueltige E-Mail-Adresse",
            } as never,
          });
          continue;
        }

        // Look up template slug
        const templateSlug = config.templates[recipient as Recipient];
        if (!templateSlug) continue;

        // Render email
        const { html, plainText, subject } = await renderEmailForEvent(
          templateSlug,
          eventPayload,
          recipient,
          settings as Record<string, unknown>,
        );

        // Generate idempotency key
        const idempotencyKey = `${eventPayload.anfrageId}_${eventPayload.eventType}_${eventPayload.status}_${Date.now()}`;

        // Create queue entry
        await payload.create({
          collection: "email_queue" as never,
          data: {
            event_type: eventPayload.eventType,
            to: email,
            subject,
            html,
            plain_text: plainText,
            reply_to:
              ((settings as Record<string, unknown>)
                .email_reply_to as string) ||
              ((settings as Record<string, unknown>).email as string) ||
              "",
            payload_data: eventPayload as unknown as Record<string, unknown>,
            status: "pending",
            attempts: 0,
            max_attempts: 5,
            idempotency_key: idempotencyKey,
          } as never,
        });
      }
    }
  } catch (err) {
    console.error("[Email Queue]", err);
  }
}

/**
 * Process pending and retryable queue entries.
 *
 * Picks up entries with status='pending' or status='failed' with next_retry_at <= now.
 * POSTs to N8N_EMAIL_WEBHOOK_URL. On success: status='sent'. On failure: exponential backoff.
 * After max_attempts (5): status='dead'.
 */
export async function processQueue(): Promise<void> {
  const { getPayload } = await import("payload");
  const payloadConfig = (await import("@payload-config")).default;
  const payload = await getPayload({ config: payloadConfig });

  const now = new Date().toISOString();

  const result = await payload.find({
    collection: "email_queue" as never,
    where: {
      or: [
        { status: { equals: "pending" } },
        {
          and: [
            { status: { equals: "failed" } },
            { next_retry_at: { less_than_equal: now } },
          ],
        },
      ],
    },
    limit: 10,
    sort: "createdAt",
  });

  const webhookUrl = process.env.N8N_EMAIL_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("[Email Queue Worker] N8N_EMAIL_WEBHOOK_URL not set");
    return;
  }

  for (const entry of result.docs) {
    const entryData = entry as unknown as {
      id: string;
      to: string;
      subject: string;
      html: string;
      plain_text: string;
      reply_to: string;
      attempts: number;
      max_attempts: number;
    };

    // Set to processing
    await payload.update({
      collection: "email_queue" as never,
      id: entryData.id,
      data: { status: "processing" } as never,
    });

    try {
      // Build POST body with optional attachments from payload_data
      const bodyPayload: Record<string, unknown> = {
        to: entryData.to,
        subject: entryData.subject,
        html: entryData.html,
        plain_text: entryData.plain_text,
        reply_to: entryData.reply_to,
      };

      // Add attachments from payload_data if present
      const entryPayloadData = (entry as any).payload_data;
      if (
        entryPayloadData?.zusatzDaten?.attachments &&
        Array.isArray(entryPayloadData.zusatzDaten.attachments)
      ) {
        bodyPayload.attachments = entryPayloadData.zusatzDaten.attachments;
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        throw new Error(
          `N8N responded with ${response.status}: ${response.statusText}`,
        );
      }

      // Success
      await payload.update({
        collection: "email_queue" as never,
        id: entryData.id,
        data: { status: "sent" } as never,
      });
    } catch (err) {
      const newAttempts = entryData.attempts + 1;

      if (newAttempts >= entryData.max_attempts) {
        // Dead after max attempts
        await payload.update({
          collection: "email_queue" as never,
          id: entryData.id,
          data: {
            status: "dead",
            attempts: newAttempts,
            error_log: err instanceof Error ? err.message : String(err),
          } as never,
        });
      } else {
        // Failed with exponential backoff
        const delayMs = Math.pow(2, newAttempts - 1) * 60_000;
        const nextRetryAt = new Date(Date.now() + delayMs).toISOString();

        await payload.update({
          collection: "email_queue" as never,
          id: entryData.id,
          data: {
            status: "failed",
            attempts: newAttempts,
            next_retry_at: nextRetryAt,
            error_log: err instanceof Error ? err.message : String(err),
          } as never,
        });
      }
    }
  }
}

/**
 * Clean up sent queue entries older than the retention period.
 *
 * @param retentionDays - Number of days to keep sent entries (default 30)
 */
export async function cleanupSentEvents(
  retentionDays: number = 90,
): Promise<void> {
  const { getPayload } = await import("payload");
  const payloadConfig = (await import("@payload-config")).default;
  const payload = await getPayload({ config: payloadConfig });

  const cutoffDate = new Date(
    Date.now() - retentionDays * 86400000,
  ).toISOString();

  const result = await payload.find({
    collection: "email_queue" as never,
    where: {
      and: [
        { status: { equals: "sent" } },
        { createdAt: { less_than: cutoffDate } },
      ],
    },
    limit: 100,
  });

  for (const entry of result.docs) {
    await payload.delete({
      collection: "email_queue" as never,
      id: (entry as unknown as { id: string }).id,
    });
  }
}
