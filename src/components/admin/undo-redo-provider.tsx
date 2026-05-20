"use client";

import React, { createContext, useContext, useRef, useCallback } from "react";
import { UndoRedoStack } from "@/components/admin/undo-redo-stack";

interface UndoRedoContextType {
  getStack: (docKey: string) => UndoRedoStack;
  resetStack: (docKey: string) => void;
}

const UndoRedoContext = createContext<UndoRedoContextType | null>(null);

export function UndoRedoProvider({ children }: { children: React.ReactNode }) {
  const stacksRef = useRef<Map<string, UndoRedoStack>>(new Map());

  const getStack = useCallback((docKey: string) => {
    if (!stacksRef.current.has(docKey)) {
      stacksRef.current.set(docKey, new UndoRedoStack(50));
    }
    return stacksRef.current.get(docKey)!;
  }, []);

  const resetStack = useCallback((docKey: string) => {
    stacksRef.current.delete(docKey);
  }, []);

  return (
    <UndoRedoContext.Provider value={{ getStack, resetStack }}>
      {children}
    </UndoRedoContext.Provider>
  );
}

export function useUndoRedoContext() {
  const ctx = useContext(UndoRedoContext);
  if (!ctx)
    throw new Error("useUndoRedoContext must be used within UndoRedoProvider");
  return ctx;
}
