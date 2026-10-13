import { useRef, useCallback } from "react";

/** Leading-edge throttle: runs at most once per `interval` ms. */
export function useThrottle(callback, interval = 1000) {
  const lastCall = useRef(0);
  const callbackRef = useRef(callback);
  callbackRef.current = callback; // always use the latest callback

  return useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastCall.current >= interval) {
        lastCall.current = now;
        callbackRef.current(...args);
      }
    },
    [interval]
  );
}
