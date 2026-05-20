/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock payload and config before import
const mockFind = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockBeginTransaction = jest.fn();
const mockCommitTransaction = jest.fn();
const mockRollbackTransaction = jest.fn();

const mockPayload = {
  find: mockFind,
  create: mockCreate,
  update: mockUpdate,
  db: {
    beginTransaction: mockBeginTransaction,
    commitTransaction: mockCommitTransaction,
    rollbackTransaction: mockRollbackTransaction,
  },
};

jest.mock("payload", () => ({
  getPayload: jest.fn(() => Promise.resolve(mockPayload)),
}));

jest.mock("@payload-config", () => ({}), { virtual: true });

import { getNextNumber } from "@/lib/nummernkreise";

describe("getNextNumber", () => {
  const currentYear = new Date().getFullYear();

  beforeEach(() => {
    jest.clearAllMocks();
    mockBeginTransaction.mockResolvedValue("tx-1");
    mockCommitTransaction.mockResolvedValue(undefined);
    mockRollbackTransaction.mockResolvedValue(undefined);
  });

  it("creates a new counter and returns 0001 when no counter exists", async () => {
    mockFind.mockResolvedValue({ docs: [] });
    mockCreate.mockResolvedValue({ id: "new-id" });

    const result = await getNextNumber("ANG");

    expect(result).toBe(`ANG-${currentYear}-0001`);
    expect(mockBeginTransaction).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "nummernkreise",
        data: expect.objectContaining({
          typ: "ANG",
          jahr: currentYear,
          letzte_nummer: 1,
          prefix: `ANG-${currentYear}-`,
        }),
      }),
    );
    expect(mockCommitTransaction).toHaveBeenCalledTimes(1);
  });

  it("increments existing counter and returns padded number", async () => {
    mockFind.mockResolvedValue({
      docs: [{ id: "counter-1", letzte_nummer: 42 }],
    });
    mockUpdate.mockResolvedValue({ id: "counter-1" });

    const result = await getNextNumber("RE");

    expect(result).toBe(`RE-${currentYear}-0043`);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "nummernkreise",
        id: "counter-1",
        data: { letzte_nummer: 43 },
      }),
    );
  });

  it("retries on transaction failure and succeeds on second attempt", async () => {
    // First attempt: transaction fails
    mockBeginTransaction
      .mockResolvedValueOnce("tx-fail")
      .mockResolvedValueOnce("tx-success");
    mockFind
      .mockRejectedValueOnce(new Error("serialization failure"))
      .mockResolvedValueOnce({ docs: [] });
    mockCreate.mockResolvedValue({ id: "new-id" });

    const result = await getNextNumber("GS");

    expect(result).toBe(`GS-${currentYear}-0001`);
    expect(mockBeginTransaction).toHaveBeenCalledTimes(2);
    expect(mockRollbackTransaction).toHaveBeenCalledTimes(1);
    expect(mockCommitTransaction).toHaveBeenCalledTimes(1);
  });

  it("throws after 3 failed attempts", async () => {
    mockBeginTransaction.mockResolvedValue("tx-fail");
    mockFind.mockRejectedValue(new Error("persistent error"));

    await expect(getNextNumber("ANG")).rejects.toThrow("persistent error");
    expect(mockBeginTransaction).toHaveBeenCalledTimes(3);
    expect(mockRollbackTransaction).toHaveBeenCalledTimes(3);
    expect(mockCommitTransaction).not.toHaveBeenCalled();
  });

  it("produces correct format matching /^(ANG|RE|GS)-\\d{4}-\\d{4}$/", async () => {
    mockFind.mockResolvedValue({
      docs: [{ id: "c-1", letzte_nummer: 9999 }],
    });
    mockUpdate.mockResolvedValue({ id: "c-1" });

    const result = await getNextNumber("ANG");

    expect(result).toMatch(/^(ANG|RE|GS)-\d{4}-\d{4,}$/);
    expect(result).toBe(`ANG-${currentYear}-10000`);
  });

  it("pads single-digit numbers to 4 digits", async () => {
    mockFind.mockResolvedValue({
      docs: [{ id: "c-1", letzte_nummer: 0 }],
    });
    mockUpdate.mockResolvedValue({ id: "c-1" });

    const result = await getNextNumber("RE");

    expect(result).toBe(`RE-${currentYear}-0001`);
  });
});
