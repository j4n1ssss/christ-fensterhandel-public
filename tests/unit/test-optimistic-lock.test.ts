import {
  checkOptimisticLock,
  VersionConflictError,
} from "@/lib/anfrage/optimistic-lock";

describe("Optimistic Locking", () => {
  it("passes when data.version matches originalDoc.version", () => {
    const data = { version: 1, status: "in_bearbeitung" };
    const originalDoc = { version: 1, status: "neu" };

    const result = checkOptimisticLock(data, originalDoc, "update");

    expect(result.version).toBe(2);
  });

  it("throws VersionConflictError with statusCode 409 when versions mismatch", () => {
    const data = { version: 1, status: "in_bearbeitung" };
    const originalDoc = { version: 2, status: "neu" };

    expect(() => checkOptimisticLock(data, originalDoc, "update")).toThrow(
      VersionConflictError,
    );

    try {
      checkOptimisticLock(data, originalDoc, "update");
    } catch (err) {
      expect(err).toBeInstanceOf(VersionConflictError);
      expect((err as VersionConflictError).statusCode).toBe(409);
    }
  });

  it("error message contains 'zwischenzeitlich'", () => {
    const data = { version: 1, status: "in_bearbeitung" };
    const originalDoc = { version: 2, status: "neu" };

    try {
      checkOptimisticLock(data, originalDoc, "update");
      throw new Error("Expected VersionConflictError to be thrown");
    } catch (err) {
      expect((err as VersionConflictError).message).toContain(
        "zwischenzeitlich",
      );
    }
  });

  it("increments version: originalDoc.version=1 -> result.version=2", () => {
    const data = { version: 1 };
    const originalDoc = { version: 1 };

    const result = checkOptimisticLock(data, originalDoc, "update");

    expect(result.version).toBe(2);
  });

  it("handles first create: does not throw, sets version to 1", () => {
    const data = { status: "neu" };

    const result = checkOptimisticLock(data, undefined, "create");

    expect(result.version).toBe(1);
  });

  it("handles missing version gracefully (originalDoc.version undefined): treats as version 1", () => {
    const data = { version: undefined };
    const originalDoc = { status: "neu" };

    const result = checkOptimisticLock(
      data as any,
      originalDoc as any,
      "update",
    );

    expect(result.version).toBe(2);
  });
});
