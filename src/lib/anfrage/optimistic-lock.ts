/**
 * Optimistic Locking for Anfragen collection.
 *
 * Compares the version sent by the client with the version stored in the DB.
 * If they differ, a concurrent edit occurred and the operation must be rejected.
 *
 * Used in the Anfragen beforeChange hook.
 */

/**
 * Custom error for version conflicts.
 * The Anfragen hook converts this to an APIError(message, 409).
 */
export class VersionConflictError extends Error {
  readonly statusCode = 409;

  constructor(message: string) {
    super(message);
    this.name = "VersionConflictError";
  }
}

/**
 * Check and update the version field for optimistic locking.
 *
 * @param data - The incoming data (from the client/API call)
 * @param originalDoc - The existing document in the DB (undefined on create)
 * @param operation - 'create' or 'update'
 * @returns The data object with an updated version field
 * @throws VersionConflictError if versions mismatch on update
 */
export function checkOptimisticLock(
  data: Record<string, unknown>,
  originalDoc: Record<string, unknown> | undefined,
  operation: string,
): Record<string, unknown> {
  // On create: initialize version to 1
  if (operation === "create" || !originalDoc) {
    return { ...data, version: 1 };
  }

  // On update: compare versions
  const clientVersion = data.version;
  const dbVersion = originalDoc.version;

  // If the client sent a version AND the DB has a version, compare them
  if (
    clientVersion !== undefined &&
    dbVersion !== undefined &&
    clientVersion !== dbVersion
  ) {
    throw new VersionConflictError(
      "Diese Anfrage wurde zwischenzeitlich von einem anderen Benutzer geaendert. Bitte laden Sie die Seite neu.",
    );
  }

  // Increment version
  const currentVersion = typeof dbVersion === "number" ? dbVersion : 1;
  return { ...data, version: currentVersion + 1 };
}
