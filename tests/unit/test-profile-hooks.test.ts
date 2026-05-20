import {
  profileBeforeChange,
  profileAfterChange,
} from "@/hooks/profile-edit-history";

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function createMockReq(overrides: Record<string, unknown> = {}) {
  return {
    user: { id: "user-123" },
    payload: {
      create: jest.fn().mockResolvedValue({}),
      find: jest.fn().mockResolvedValue({ docs: [] }),
    },
    ...overrides,
  };
}

// ──────────────────────────────────────────────────────────────
// profileBeforeChange
// ──────────────────────────────────────────────────────────────

describe("profileBeforeChange", () => {
  it("HIST-02: sets last_edited_by to req.user.id on update operation", async () => {
    const data = { name_einfach: "Iglo 5" };
    const req = createMockReq();

    const result = await profileBeforeChange({
      data,
      req: req as any,
      operation: "update",
      originalDoc: {} as any,
      context: {},
      collection: {} as any,
    });

    expect(result).toEqual({
      name_einfach: "Iglo 5",
      last_edited_by: "user-123",
    });
  });

  it("HIST-02: sets last_edited_by to req.user.id on create operation", async () => {
    const data = { name_einfach: "Iglo 5" };
    const req = createMockReq();

    const result = await profileBeforeChange({
      data,
      req: req as any,
      operation: "create",
      originalDoc: {} as any,
      context: {},
      collection: {} as any,
    });

    expect(result).toEqual({
      name_einfach: "Iglo 5",
      last_edited_by: "user-123",
    });
  });

  it("HIST-02: returns data unchanged when no user on req", async () => {
    const data = { name_einfach: "Iglo 5" };
    const req = createMockReq({ user: null });

    const result = await profileBeforeChange({
      data,
      req: req as any,
      operation: "update",
      originalDoc: {} as any,
      context: {},
      collection: {} as any,
    });

    expect(result).toEqual({ name_einfach: "Iglo 5" });
    expect(result).not.toHaveProperty("last_edited_by");
  });
});

// ──────────────────────────────────────────────────────────────
// profileAfterChange
// ──────────────────────────────────────────────────────────────

describe("profileAfterChange", () => {
  it('HIST-03: creates edit_history entry with event "update" when fields changed', async () => {
    const req = createMockReq();
    const previousDoc = { id: "doc-1", name_einfach: "Iglo 5" };
    const doc = { id: "doc-1", name_einfach: "Iglo 5 Classic" };

    await profileAfterChange({
      doc: doc as any,
      previousDoc: previousDoc as any,
      req: req as any,
      operation: "update",
      context: {},
      collection: {} as any,
    });

    expect(req.payload.create).toHaveBeenCalledTimes(1);
    const createCall = req.payload.create.mock.calls[0][0];
    expect(createCall.collection).toBe("edit_history");
    expect(createCall.data.event).toBe("update");
    expect(createCall.data.collection).toBe("profile");
    expect(createCall.data.doc_id).toBe("doc-1");
    expect(createCall.data.diff).not.toBeNull();
    expect(createCall.data.editor).toBe("user-123");
  });

  it('HIST-03: creates edit_history entry with event "create" on create operation', async () => {
    const req = createMockReq();
    const doc = { id: "doc-1", name_einfach: "Iglo 5" };

    await profileAfterChange({
      doc: doc as any,
      previousDoc: {} as any,
      req: req as any,
      operation: "create",
      context: {},
      collection: {} as any,
    });

    expect(req.payload.create).toHaveBeenCalledTimes(1);
    const createCall = req.payload.create.mock.calls[0][0];
    expect(createCall.data.event).toBe("create");
    expect(createCall.data.diff).toBeNull();
  });

  it('HIST-03: creates edit_history entry with event "save_no_changes" when no diff', async () => {
    const req = createMockReq();
    const doc = { id: "doc-1", name_einfach: "Iglo 5" };
    const previousDoc = { id: "doc-1", name_einfach: "Iglo 5" };

    await profileAfterChange({
      doc: doc as any,
      previousDoc: previousDoc as any,
      req: req as any,
      operation: "update",
      context: {},
      collection: {} as any,
    });

    expect(req.payload.create).toHaveBeenCalledTimes(1);
    const createCall = req.payload.create.mock.calls[0][0];
    expect(createCall.data.event).toBe("save_no_changes");
    expect(createCall.data.diff).toBeNull();
  });

  it("HIST-04: skips history creation when context.skipEditHistory is true", async () => {
    const req = createMockReq();
    const doc = { id: "doc-1", name_einfach: "Iglo 5" };

    await profileAfterChange({
      doc: doc as any,
      previousDoc: {} as any,
      req: req as any,
      operation: "update",
      context: { skipEditHistory: true },
      collection: {} as any,
    });

    expect(req.payload.create).not.toHaveBeenCalled();
  });

  it("HIST-04: does not throw when req.payload.create fails (non-blocking)", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const req = createMockReq();
    req.payload.create.mockRejectedValue(new Error("DB write failed"));

    const doc = { id: "doc-1", name_einfach: "Changed" };
    const previousDoc = { id: "doc-1", name_einfach: "Original" };

    // Should NOT throw
    await expect(
      profileAfterChange({
        doc: doc as any,
        previousDoc: previousDoc as any,
        req: req as any,
        operation: "update",
        context: {},
        collection: {} as any,
      }),
    ).resolves.not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[Profile afterChange]"),
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("HIST-03: passes overrideAccess: true and context.skipEditHistory: true to create call", async () => {
    const req = createMockReq();
    const doc = { id: "doc-1", name_einfach: "Iglo 5" };

    await profileAfterChange({
      doc: doc as any,
      previousDoc: {} as any,
      req: req as any,
      operation: "create",
      context: {},
      collection: {} as any,
    });

    const createCall = req.payload.create.mock.calls[0][0];
    expect(createCall.overrideAccess).toBe(true);
    expect(createCall.context).toEqual({ skipEditHistory: true });
  });

  it('HIST-03: sets collection to "profile" and doc_id to doc.id in history entry', async () => {
    const req = createMockReq();
    const doc = { id: "unique-profile-id", name_einfach: "Test" };

    await profileAfterChange({
      doc: doc as any,
      previousDoc: {} as any,
      req: req as any,
      operation: "create",
      context: {},
      collection: {} as any,
    });

    const createCall = req.payload.create.mock.calls[0][0];
    expect(createCall.data.collection).toBe("profile");
    expect(createCall.data.doc_id).toBe("unique-profile-id");
  });

  it("HIST-03: sets editor to null when no user on req", async () => {
    const req = createMockReq({ user: null });
    const doc = { id: "doc-1", name_einfach: "Test" };

    await profileAfterChange({
      doc: doc as any,
      previousDoc: {} as any,
      req: req as any,
      operation: "create",
      context: {},
      collection: {} as any,
    });

    const createCall = req.payload.create.mock.calls[0][0];
    expect(createCall.data.editor).toBeNull();
  });

  it("HIST-03: includes timestamp as ISO string in history entry", async () => {
    const req = createMockReq();
    const doc = { id: "doc-1", name_einfach: "Test" };

    await profileAfterChange({
      doc: doc as any,
      previousDoc: {} as any,
      req: req as any,
      operation: "create",
      context: {},
      collection: {} as any,
    });

    const createCall = req.payload.create.mock.calls[0][0];
    expect(createCall.data.timestamp).toBeDefined();
    // Should be a valid ISO string
    expect(() => new Date(createCall.data.timestamp)).not.toThrow();
    expect(new Date(createCall.data.timestamp).toISOString()).toBe(
      createCall.data.timestamp,
    );
  });
});
