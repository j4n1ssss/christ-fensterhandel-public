import { getPayload } from "payload";
import config from "@payload-config";

export async function getSettings() {
  const payload = await getPayload({ config });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- slug type updates when payload-types.ts is regenerated
  return payload.findGlobal({ slug: "settings" as any });
}
