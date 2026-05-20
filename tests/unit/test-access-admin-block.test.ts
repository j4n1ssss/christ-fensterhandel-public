import { Users } from "@/collections/system/users";

// Extract the access.admin function from Users collection config
const adminAccess = Users.access?.admin;

// Helper to create mock request objects (same pattern as test-access-control.test.ts)
function mockReq(rolle?: string) {
  if (!rolle) return { user: null } as any;
  return {
    user: {
      id: "1",
      email: "test@example.com",
      rolle,
    },
  } as any;
}

describe("Users access.admin", () => {
  it("access.admin function exists on Users collection", () => {
    expect(adminAccess).toBeDefined();
    expect(typeof adminAccess).toBe("function");
  });

  it('returns true for user with rolle="admin"', () => {
    const result = adminAccess!({ req: mockReq("admin") });
    expect(result).toBe(true);
  });

  it('returns true for user with rolle="mitarbeiter"', () => {
    const result = adminAccess!({ req: mockReq("mitarbeiter") });
    expect(result).toBe(true);
  });

  it('returns true for user with rolle="viewer"', () => {
    const result = adminAccess!({ req: mockReq("viewer") });
    expect(result).toBe(true);
  });

  it('returns false for user with rolle="kunde"', () => {
    const result = adminAccess!({ req: mockReq("kunde") });
    expect(result).toBe(false);
  });

  it("returns false when req.user is null (not logged in)", () => {
    const result = adminAccess!({ req: mockReq() });
    expect(result).toBe(false);
  });
});
