import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
} from "payload";
import { computeDiff, resolveRelationshipLabels } from "@/lib/diff-utils";

/**
 * beforeChange hook for Profile collection.
 * Sets last_edited_by to the current user ID on every save (create + update).
 *
 * IMPORTANT: last_edited_by is set here (not in afterChange) to prevent infinite loops.
 * See: STATE.md decision "last_edited_by in beforeChange (nicht afterChange + update)"
 */
export const profileBeforeChange: CollectionBeforeChangeHook = async ({
  data,
  req,
}) => {
  if (req.user?.id) {
    return { ...data, last_edited_by: req.user.id };
  }
  return data;
};

/**
 * afterChange hook for Profile collection.
 * Creates an edit_history entry with computed diff and resolved relationship labels.
 *
 * Guard: context.skipEditHistory prevents infinite loops (passed to nested create calls).
 * Non-blocking: entire logic wrapped in try/catch so profile save is never prevented.
 */
export const profileAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
  context,
}) => {
  // Guard: prevent infinite loops
  if (context?.skipEditHistory) return;

  try {
    let event: string;
    let diff: unknown[] = [];

    if (operation === "create") {
      event = "create";
      // No diff for create events -- just log the creation
    } else {
      // Compute diff between previousDoc and doc
      const rawDiff = computeDiff(previousDoc || {}, doc);

      if (rawDiff.length === 0) {
        event = "save_no_changes";
      } else {
        event = "update";
        // Resolve relationship labels (snapshot frozen at save time)
        diff = await resolveRelationshipLabels(
          rawDiff,
          req.payload as unknown as Parameters<
            typeof resolveRelationshipLabels
          >[1],
        );
      }
    }

    await req.payload.create({
      collection: "edit_history",
      data: {
        collection: "profile",
        doc_id: doc.id,
        event,
        diff: diff.length > 0 ? diff : null,
        editor: req.user?.id || null,
        timestamp: new Date().toISOString(),
      },
      overrideAccess: true,
      context: { skipEditHistory: true },
    });
  } catch (err) {
    // Non-blocking: log error but never prevent the profile save
    console.error(
      "[Profile afterChange] Edit history error (non-blocking):",
      err,
    );
  }
};
