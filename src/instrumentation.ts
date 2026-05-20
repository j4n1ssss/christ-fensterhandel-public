/**
 * Next.js instrumentation hook.
 *
 * Starts the email queue worker on server boot:
 * - Processes pending/failed queue entries every 60 seconds
 * - Cleans up sent entries older than 30 days every hour
 *
 * The register() function is called once per server instance in production.
 * The workerStarted guard prevents multiple instances in dev mode (HMR).
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    let workerStarted = false;

    if (!workerStarted) {
      workerStarted = true;

      // Process queue every 60 seconds
      setInterval(async () => {
        try {
          const { processQueue } = await import("@/lib/email/queue");
          await processQueue();
        } catch (err) {
          console.error("[Email Queue Worker] Processing error:", err);
        }
      }, 60_000);

      // Cleanup sent events every hour
      setInterval(async () => {
        try {
          const { cleanupSentEvents } = await import("@/lib/email/queue");
          await cleanupSentEvents(30);
        } catch (err) {
          console.error("[Email Queue Worker] Cleanup error:", err);
        }
      }, 3_600_000);

      console.log("[Email Queue Worker] Started (60s interval)");
    }
  }
}
