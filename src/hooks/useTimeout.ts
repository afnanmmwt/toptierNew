import { useEffect, useRef } from "react";

interface UseTimeoutReturn {
  clear: () => void;
}

export function useTimeout(
  callback: () => void,
  delay: number | undefined,
  active: boolean
): UseTimeoutReturn {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedCallback = useRef<() => void>(() => {});

  // Always define clear first, so it can be used in effects
  const clear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Update the callback if it changes
  useEffect(() => {
    if (typeof callback === "function") {
      savedCallback.current = callback;
    }
  }, [callback]);

  // Start or clear the timeout based on 'active' and 'delay'
  useEffect(() => {
    if (!active || typeof delay !== "number" || delay <= 0) return;

    timeoutRef.current = setTimeout(() => {
      savedCallback.current?.(); // Optional chaining to be extra safe
    }, delay);

    return clear;
  }, [delay, active]);

  return { clear };
}
