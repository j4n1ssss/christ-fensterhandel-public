import type { AdminViewProps } from "payload";
import DashboardOverview from "./dashboard-overview";

/**
 * Thin server component wrapper for the client-side DashboardOverview.
 * Payload passes ServerProps (including locale objects with non-serializable
 * toString methods) to admin view components. This wrapper absorbs those
 * props so they don't cross the server→client boundary.
 */
export default function DashboardView(_props: AdminViewProps) {
  return <DashboardOverview />;
}
