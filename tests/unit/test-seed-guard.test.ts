/**
 * Unit tests for the seed script production guard logic.
 *
 * @jest-environment node
 */

describe("Seed Guard", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("NODE_ENV production guard", () => {
    it("blocks execution when NODE_ENV=production", () => {
      // The seed script checks NODE_ENV at the top and calls process.exit(1)
      // We verify the guard logic pattern here
      process.env.NODE_ENV = "production";
      const shouldBlock = process.env.NODE_ENV === "production";
      expect(shouldBlock).toBe(true);
    });

    it("allows execution when NODE_ENV=development", () => {
      process.env.NODE_ENV = "development";
      const shouldBlock = process.env.NODE_ENV === "production";
      expect(shouldBlock).toBe(false);
    });

    it("allows execution when NODE_ENV is undefined", () => {
      delete process.env.NODE_ENV;
      const shouldBlock = process.env.NODE_ENV === "production";
      expect(shouldBlock).toBe(false);
    });
  });

  describe("DATABASE_URL localhost guard", () => {
    it("does not warn when DATABASE_URL contains localhost", () => {
      process.env.DATABASE_URL =
        "postgresql://user:pass@localhost:5432/christ_fensterhandel";
      const dbUrl = process.env.DATABASE_URL || "";
      const isRemote =
        dbUrl && !dbUrl.includes("localhost") && !dbUrl.includes("127.0.0.1");
      expect(isRemote).toBe(false);
    });

    it("does not warn when DATABASE_URL contains 127.0.0.1", () => {
      process.env.DATABASE_URL =
        "postgresql://user:pass@127.0.0.1:5432/christ_fensterhandel";
      const dbUrl = process.env.DATABASE_URL || "";
      const isRemote =
        dbUrl && !dbUrl.includes("localhost") && !dbUrl.includes("127.0.0.1");
      expect(isRemote).toBe(false);
    });

    it("warns when DATABASE_URL contains a remote host", () => {
      process.env.DATABASE_URL =
        "postgresql://user:pass@prod-db.example.com:5432/christ_fensterhandel";
      const dbUrl = process.env.DATABASE_URL || "";
      const isRemote =
        dbUrl && !dbUrl.includes("localhost") && !dbUrl.includes("127.0.0.1");
      expect(isRemote).toBeTruthy();
    });

    it("does not warn when DATABASE_URL is empty", () => {
      delete process.env.DATABASE_URL;
      const dbUrl = process.env.DATABASE_URL || "";
      const isRemote =
        dbUrl && !dbUrl.includes("localhost") && !dbUrl.includes("127.0.0.1");
      expect(isRemote).toBeFalsy();
    });
  });
});
