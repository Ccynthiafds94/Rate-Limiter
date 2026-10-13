import { useState, useRef, useCallback, useEffect } from "react";

/** Client-side sliding window: allow `limit` actions per `windowMs`. */
export function useRateLimiter(limit, windowMs) {
  const timestamps = useRef([]);
  const [remaining, setRemaining] = useState(limit);
  const [retryAfter, setRetryAfter] = useState(0); // seconds

  const prune = useCallback(
    (now) => {
      timestamps.current = timestamps.current.filter((t) => now - t < windowMs);
    },
    [windowMs]
  );

  const secondsUntilFree = useCallback(
    (now) =>
      timestamps.current.length >= limit
        ? Math.ceil((windowMs - (now - timestamps.current[0])) / 1000)
        : 0,
    [limit, windowMs]
  );

  const tryAction = useCallback(() => {
    const now = Date.now();
    prune(now);

    if (timestamps.current.length >= limit) {
      setRetryAfter(secondsUntilFree(now));
      return false; // blocked
    }
    timestamps.current.push(now);
    setRemaining(limit - timestamps.current.length);
    return true; // allowed
  }, [limit, prune, secondsUntilFree]);

  // refresh the counters as old requests expire
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      prune(now);
      setRemaining(limit - timestamps.current.length);
      setRetryAfter(secondsUntilFree(now));
    }, 250);
    return () => clearInterval(id);
  }, [limit, prune, secondsUntilFree]);

  return { tryAction, remaining, retryAfter };
}
