import { getSettings } from "@/lib/settings";
import { getPayload } from "payload";

// Mock payload module
jest.mock("payload", () => ({
  getPayload: jest.fn(),
}));

// Mock @payload-config (virtual module, doesn't exist on disk for tests)
jest.mock("@payload-config", () => ({}), { virtual: true });

describe("getSettings", () => {
  let mockFindGlobal: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindGlobal = jest.fn().mockResolvedValue({
      mwst_satz: 19,
      firmenname: "Test GmbH",
    });
    (getPayload as jest.Mock).mockResolvedValue({
      findGlobal: mockFindGlobal,
    });
  });

  it('calls payload.findGlobal with slug "settings"', async () => {
    await getSettings();
    expect(mockFindGlobal).toHaveBeenCalledWith({ slug: "settings" });
  });

  it("returns the data from findGlobal", async () => {
    const result = await getSettings();
    expect(result).toEqual({
      mwst_satz: 19,
      firmenname: "Test GmbH",
    });
  });

  it("does NOT cache between calls (two calls = two findGlobal invocations)", async () => {
    await getSettings();
    await getSettings();
    expect(mockFindGlobal.mock.calls.length).toBe(2);
  });
});
