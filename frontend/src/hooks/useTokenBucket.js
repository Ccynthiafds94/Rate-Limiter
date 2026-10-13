import { useRef, useState, useEffect, useCallback } from "react";

/** Bursts up to `capacity`, then refills at `refillPerSecond`. */
export function useTokenBucket(capacity, refillPerSecond) {
  const tokens = useRef(capacity);
  const lastRefill = useRef(Date.now());
  const [display, setDisplay] = useState(capacity);

  const refill = useCallback(() => {
    const now = Date.now();
    const elapsed = (now - lastRefill.current) / 1000;
    tokens.current = Math.min(capacity, tokens.current + elapsed * refillPerSecond);
    lastRefill.current = now;
  }, [capacity, refillPerSecond]);

  const tryAction = useCallback(
    (cost = 1) => {
      refill();
      const ok = tokens.current >= cost;
      if (ok) tokens.current -= cost;
      setDisplay(Math.floor(tokens.current));
      return ok;
    },
    [refill]
  );

  // keep the UI counter updating while the bucket refills
  useEffect(() => {
    const id = setInterval(() => {
      refill();
      setDisplay(Math.floor(tokens.current));
    }, 250);
    return () => clearInterval(id);
  }, [refill]);

  return { tryAction, tokens: display, capacity };
}
