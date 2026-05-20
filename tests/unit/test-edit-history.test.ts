import { EditHistory } from "@/collections/system/edit-history";

describe("EditHistory Collection Config", () => {
  it("HIST-01: has correct slug", () => {
    expect(EditHistory.slug).toBe("edit_history");
  });

  it("HIST-01: has all required fields", () => {
    const fieldNames = EditHistory.fields
      .filter((f: any) => "name" in f)
      .map((f: any) => f.name);
    expect(fieldNames).toEqual(
      expect.arrayContaining([
        "collection",
        "doc_id",
        "event",
        "diff",
        "editor",
        "timestamp",
      ]),
    );
    expect(fieldNames).toHaveLength(6);
  });

  it("HIST-01: field types are correct", () => {
    const fields = EditHistory.fields as any[];
    const getField = (name: string) => fields.find((f: any) => f.name === name);

    expect(getField("collection")).toMatchObject({
      type: "text",
      required: true,
    });
    expect(getField("doc_id")).toMatchObject({ type: "text", required: true });
    expect(getField("event")).toMatchObject({ type: "text", required: true });
    expect(getField("diff")).toMatchObject({ type: "json" });
    expect(getField("editor")).toMatchObject({
      type: "relationship",
      relationTo: "users",
    });
    expect(getField("timestamp")).toMatchObject({
      type: "date",
      required: true,
    });
  });

  it("HIST-01: timestamp has dayAndTime picker", () => {
    const fields = EditHistory.fields as any[];
    const timestamp = fields.find((f: any) => f.name === "timestamp");
    expect(timestamp.admin.date.pickerAppearance).toBe("dayAndTime");
  });

  it("HIST-01: access control is correct", () => {
    const access = EditHistory.access!;
    // create must return false (only via overrideAccess in hooks)
    expect(
      (access.create as Function)({ req: { user: { rolle: "admin" } } }),
    ).toBe(false);
    // update must return false
    expect(
      (access.update as Function)({ req: { user: { rolle: "admin" } } }),
    ).toBe(false);
    // read allows admin
    expect(
      (access.read as Function)({ req: { user: { rolle: "admin" } } }),
    ).toBe(true);
    // read allows mitarbeiter
    expect(
      (access.read as Function)({ req: { user: { rolle: "mitarbeiter" } } }),
    ).toBe(true);
    // read denies viewer
    expect(
      (access.read as Function)({ req: { user: { rolle: "viewer" } } }),
    ).toBe(false);
    // delete allows admin
    expect(
      (access.delete as Function)({ req: { user: { rolle: "admin" } } }),
    ).toBe(true);
    // delete denies mitarbeiter
    expect(
      (access.delete as Function)({ req: { user: { rolle: "mitarbeiter" } } }),
    ).toBe(false);
  });

  it("HIST-01: admin config is correct", () => {
    expect(EditHistory.admin!.group).toBe("System");
    expect(EditHistory.admin!.useAsTitle).toBe("event");
    expect(EditHistory.admin!.defaultColumns).toEqual([
      "collection",
      "doc_id",
      "event",
      "editor",
      "timestamp",
    ]);
  });
});
