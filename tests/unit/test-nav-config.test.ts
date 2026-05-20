import fs from "fs";
import path from "path";

describe("nav config registration", () => {
  const configPath = path.resolve(__dirname, "../../src/payload.config.ts");
  let configContent: string;

  beforeAll(() => {
    configContent = fs.readFileSync(configPath, "utf-8");
  });

  test("registers custom Nav component", () => {
    // Plan 02 will add this line to payload.config.ts
    // Linter enforces double quotes in this codebase
    expect(configContent).toContain(
      'Nav: "@/components/admin/custom-nav#default"',
    );
  });

  test("does not have afterNavLinks with webhook badge", () => {
    // Plan 02 will remove afterNavLinks since badge is embedded in custom nav
    expect(configContent).not.toContain("afterNavLinks");
  });

  test("keeps existing graphics components", () => {
    expect(configContent).toContain('Logo: "@/components/admin/logo#default"');
    expect(configContent).toContain(
      'Icon: "@/components/admin/logo-icon#default"',
    );
  });

  test("keeps existing providers", () => {
    expect(configContent).toContain("undo-redo-provider");
  });
});
