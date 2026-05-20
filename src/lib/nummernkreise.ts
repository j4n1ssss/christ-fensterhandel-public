import { getPayload } from "payload";
import config from "@payload-config";

export async function getNextNumber(typ: "ANG" | "RE" | "GS"): Promise<string> {
  const payload = await getPayload({ config });
  const jahr = new Date().getFullYear();

  // Retry up to 3 times for serialization conflicts
  for (let attempt = 0; attempt < 3; attempt++) {
    const transactionID = await payload.db.beginTransaction();
    try {
      // Collection slug cast needed until payload-types.ts is regenerated
      const existing = await payload.find({
        collection: "nummernkreise" as any,
        where: {
          typ: { equals: typ },
          jahr: { equals: jahr },
        },
        limit: 1,
        req: { transactionID } as any,
      });

      let nextNum: number;
      if (existing.docs.length > 0) {
        const counter = existing.docs[0];
        nextNum = ((counter as any).letzte_nummer || 0) + 1;
        await payload.update({
          collection: "nummernkreise" as any,
          id: counter.id,
          data: { letzte_nummer: nextNum } as any,
          req: { transactionID } as any,
        });
      } else {
        nextNum = 1;
        await payload.create({
          collection: "nummernkreise" as any,
          data: {
            typ,
            jahr,
            letzte_nummer: 1,
            prefix: `${typ}-${jahr}-`,
          } as any,
          req: { transactionID } as any,
        });
      }

      if (transactionID) await payload.db.commitTransaction(transactionID);
      return `${typ}-${jahr}-${String(nextNum).padStart(4, "0")}`;
    } catch (error) {
      if (transactionID) await payload.db.rollbackTransaction(transactionID);
      if (attempt === 2) throw error;
      // Retry on serialization/deadlock errors
    }
  }

  throw new Error(`Failed to generate ${typ} number after 3 attempts`);
}
