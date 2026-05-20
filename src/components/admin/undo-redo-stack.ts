import type { FormState } from "payload";

/**
 * Pure undo/redo stack class for managing form state snapshots.
 * No React imports -- designed to be testable without Payload/React context.
 *
 * Stack uses a floor index (Boden-Index) pattern: after save, undo cannot
 * go past the save point. FIFO eviction when maxSize is reached.
 */
export class UndoRedoStack {
  private snapshots: FormState[] = [];
  private currentIndex = -1;
  private floorIndex = 0;
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  /**
   * Push a new snapshot onto the stack.
   * If currentIndex is not at end (user did undo then edited), discard everything after.
   * If at maxSize, evict oldest and adjust indices.
   */
  push(state: FormState): void {
    // Discard everything after currentIndex (user branched)
    this.snapshots = this.snapshots.slice(0, this.currentIndex + 1);

    // Add new snapshot
    this.snapshots.push(state);
    this.currentIndex = this.snapshots.length - 1;

    // Evict oldest if at capacity
    if (this.snapshots.length > this.maxSize) {
      this.snapshots.shift();
      this.currentIndex--;
      this.floorIndex = Math.max(this.floorIndex - 1, 0);
    }
  }

  /**
   * Undo: move back one step. Returns the snapshot at the new position,
   * or null if at or below the floor.
   */
  undo(): FormState | null {
    if (this.currentIndex <= this.floorIndex) {
      return null;
    }
    this.currentIndex--;
    return this.snapshots[this.currentIndex];
  }

  /**
   * Redo: move forward one step. Returns the snapshot at the new position,
   * or null if already at the end.
   */
  redo(): FormState | null {
    if (this.currentIndex >= this.snapshots.length - 1) {
      return null;
    }
    this.currentIndex++;
    return this.snapshots[this.currentIndex];
  }

  /**
   * Mark current position as save point (floor).
   * Undo will not go below this point.
   */
  markSaved(): void {
    this.floorIndex = this.currentIndex;
  }

  /**
   * Reset the entire stack.
   */
  reset(): void {
    this.snapshots = [];
    this.currentIndex = -1;
    this.floorIndex = 0;
  }

  get canUndo(): boolean {
    return this.currentIndex > this.floorIndex;
  }

  get canRedo(): boolean {
    return this.currentIndex < this.snapshots.length - 1;
  }

  get size(): number {
    return this.snapshots.length;
  }
}

/**
 * Create a document key for stack isolation.
 * Each document gets its own undo/redo stack.
 */
export function getDocKey(collectionSlug: string, id: string): string {
  return `${collectionSlug}:${id}`;
}

/**
 * Create a clean snapshot by stripping non-cloneable React nodes
 * (customComponents) from FieldState entries and their rows.
 * Uses structuredClone for a deep copy after stripping.
 */
export function createCleanSnapshot(formState: FormState): FormState {
  const clean: Record<string, any> = {};

  for (const [path, field] of Object.entries(formState)) {
    const { customComponents, ...rest } = field as any;

    // Strip customComponents from rows if present
    if (rest.rows) {
      rest.rows = rest.rows.map((row: any) => {
        const { customComponents: rowCC, ...rowRest } = row;
        return rowRest;
      });
    }

    clean[path] = rest;
  }

  return structuredClone(clean) as FormState;
}
