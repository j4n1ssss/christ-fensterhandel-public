import {
  UndoRedoStack,
  getDocKey,
  createCleanSnapshot,
} from "@/components/admin/undo-redo-stack";
import type { FormState } from "payload";

// Helper: create a minimal mock FormState
function mockState(fields: Record<string, any>): FormState {
  const state: Record<string, any> = {};
  for (const [key, value] of Object.entries(fields)) {
    state[key] = { value, valid: true };
  }
  return state as FormState;
}

describe("UndoRedoStack", () => {
  it("Test 1: new stack has canUndo=false and canRedo=false", () => {
    const stack = new UndoRedoStack(50);
    expect(stack.canUndo).toBe(false);
    expect(stack.canRedo).toBe(false);
  });

  it("Test 2: push(A), push(B) then canUndo=true, canRedo=false", () => {
    const stack = new UndoRedoStack(50);
    stack.push(mockState({ a: 1 }));
    stack.push(mockState({ a: 2 }));
    expect(stack.canUndo).toBe(true);
    expect(stack.canRedo).toBe(false);
  });

  it("Test 3: push(A), push(B), undo() returns stateA, canRedo=true", () => {
    const stack = new UndoRedoStack(50);
    const stateA = mockState({ a: 1 });
    const stateB = mockState({ a: 2 });
    stack.push(stateA);
    stack.push(stateB);
    const result = stack.undo();
    expect(result).toEqual(stateA);
    expect(stack.canRedo).toBe(true);
  });

  it("Test 4: push(A), push(B), undo(), redo() returns stateB, canRedo=false", () => {
    const stack = new UndoRedoStack(50);
    const stateA = mockState({ a: 1 });
    const stateB = mockState({ a: 2 });
    stack.push(stateA);
    stack.push(stateB);
    stack.undo();
    const result = stack.redo();
    expect(result).toEqual(stateB);
    expect(stack.canRedo).toBe(false);
  });

  it("Test 5: push 51 states then oldest is evicted, stack.size === 50", () => {
    const stack = new UndoRedoStack(50);
    for (let i = 0; i < 51; i++) {
      stack.push(mockState({ i }));
    }
    expect(stack.size).toBe(50);
  });

  it("Test 6: push(A), push(B), undo(), push(C) clears redo stack", () => {
    const stack = new UndoRedoStack(50);
    stack.push(mockState({ a: 1 }));
    stack.push(mockState({ a: 2 }));
    stack.undo();
    stack.push(mockState({ a: 3 }));
    expect(stack.canRedo).toBe(false);
  });

  it("Test 7: markSaved() sets floor, undo() past floor returns null", () => {
    const stack = new UndoRedoStack(50);
    stack.push(mockState({ a: 1 }));
    stack.push(mockState({ a: 2 }));
    stack.markSaved();
    const result = stack.undo();
    expect(result).toBeNull();
  });

  it("Test 8: markSaved(), push(C), push(D), undo() returns C, undo() returns B (save state), undo() returns null", () => {
    const stack = new UndoRedoStack(50);
    const stateA = mockState({ a: 1 });
    const stateB = mockState({ a: 2 });
    stack.push(stateA);
    stack.push(stateB);
    stack.markSaved(); // floor = 1 (currentIndex)
    const stateC = mockState({ a: 3 });
    const stateD = mockState({ a: 4 });
    stack.push(stateC);
    stack.push(stateD);
    const first = stack.undo();
    expect(first).toEqual(stateC); // above floor
    const second = stack.undo();
    expect(second).toEqual(stateB); // at floor (save state) -- can undo TO save point
    const third = stack.undo();
    expect(third).toBeNull(); // cannot undo PAST save point
  });

  it("Test 8b: markSaved(), push(C), undo() returns save state (single change after save)", () => {
    const stack = new UndoRedoStack(50);
    stack.push(mockState({ a: 1 }));
    const stateB = mockState({ a: 2 });
    stack.push(stateB);
    stack.markSaved(); // floor = 1
    stack.push(mockState({ a: 3 }));
    const result = stack.undo();
    expect(result).toEqual(stateB); // can undo back to save state with just one change
    expect(stack.canUndo).toBe(false); // at floor, no further undo
  });

  it("Test 9: reset() clears everything", () => {
    const stack = new UndoRedoStack(50);
    stack.push(mockState({ a: 1 }));
    stack.push(mockState({ a: 2 }));
    stack.reset();
    expect(stack.canUndo).toBe(false);
    expect(stack.canRedo).toBe(false);
    expect(stack.size).toBe(0);
  });
});

describe("getDocKey", () => {
  it("Test 10: returns collectionSlug:id format", () => {
    expect(getDocKey("profile", "123")).toBe("profile:123");
  });
});

describe("createCleanSnapshot", () => {
  it("Test 11: strips customComponents from FieldState entries", () => {
    const input = {
      name: {
        value: "test",
        valid: true,
        customComponents: { Field: "<ReactNode>" },
      },
      slug: {
        value: "test-slug",
        valid: true,
        customComponents: { Field: "<ReactNode>" },
      },
    } as unknown as FormState;

    const result = createCleanSnapshot(input);
    for (const field of Object.values(result)) {
      expect(field).not.toHaveProperty("customComponents");
    }
    expect(result.name.value).toBe("test");
    expect(result.slug.value).toBe("test-slug");
  });

  it("Test 12: strips customComponents from rows[].customComponents", () => {
    const input = {
      erlaubte_farben: {
        value: ["uuid-1", "uuid-2"],
        valid: true,
        customComponents: { Field: "<ReactNode>" },
        rows: [
          { id: "row-1", customComponents: { RowLabel: "<ReactNode>" } },
          { id: "row-2", customComponents: { RowLabel: "<ReactNode>" } },
        ],
      },
    } as unknown as FormState;

    const result = createCleanSnapshot(input);
    expect(result.erlaubte_farben).not.toHaveProperty("customComponents");
    expect(result.erlaubte_farben.value).toEqual(["uuid-1", "uuid-2"]);
    for (const row of result.erlaubte_farben.rows!) {
      expect(row).not.toHaveProperty("customComponents");
      expect(row).toHaveProperty("id");
    }
  });
});
