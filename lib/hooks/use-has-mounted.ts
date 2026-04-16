import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * `false` during SSR / first client pass, `true` after hydration — avoids theme UI mismatch.
 */
export function useHasMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
