import { useCallback, useRef, useState } from "react";

/**
 * Lightweight undo/redo history for any state.
 * - present is the live value
 * - set(...) replaces present and pushes the previous one onto the past stack
 * - undo/redo move between stacks
 */
export function useHistory<T>(initial: T, limit = 100) {
  const [present, setPresent] = useState<T>(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const [, force] = useState(0);
  const tick = () => force((n) => n + 1);

  const set = useCallback((value: T | ((prev: T) => T), opts?: { skipHistory?: boolean }) => {
    setPresent((prev) => {
      const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
      if (!opts?.skipHistory) {
        past.current.push(prev);
        if (past.current.length > limit) past.current.shift();
        future.current = [];
      }
      tick();
      return next;
    });
  }, [limit]);

  const reset = useCallback((value: T) => {
    past.current = [];
    future.current = [];
    setPresent(value);
    tick();
  }, []);

  const undo = useCallback(() => {
    setPresent((prev) => {
      const last = past.current.pop();
      if (last === undefined) return prev;
      future.current.push(prev);
      tick();
      return last;
    });
  }, []);

  const redo = useCallback(() => {
    setPresent((prev) => {
      const next = future.current.pop();
      if (next === undefined) return prev;
      past.current.push(prev);
      tick();
      return next;
    });
  }, []);

  return {
    value: present,
    set,
    reset,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
