import { useEffect, useState } from "react";

/**
 * Returns the latest `value` once it has been stable for `delay`ms.
 * Used on Listings search inputs to avoid spamming the API per keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
