import { useState, useEffect } from "react";

/** Returns `value` only after it has stopped changing for `delay` ms. */
export function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id); // reset the timer on every change
  }, [value, delay]);

  return debounced;
}
