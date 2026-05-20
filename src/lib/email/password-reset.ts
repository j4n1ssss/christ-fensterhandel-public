/**
 * Queue a password reset email through the project's email system.
 * Called from Users collection generateEmailHTML override.
 *
 * Uses the email queue (Phase 25) instead of Payload's built-in transport.
 * The password reset template is rendered at queue-time with the reset URL.
 */
export async function queuePasswordResetEmail(
  email: string,
  resetUrl: string,
): Promise<void> {
  try {
    const { queueEmailEvent } = await import("./queue");
    await queueEmailEvent({
      eventType: "passwort_reset",
      anfrageId: "",
      anfrageNummer: "",
      status: "",
      kunde: { vorname: "", nachname: "", email },
      produkte: [],
      gesamtbetragCents: 0,
      resetUrl,
    });
  } catch (error) {
    console.error("[Password Reset] Failed to queue email:", error);
  }
}
