import * as React from "react";

const MOBILE_BREAKPOINT = 768;

// useSyncExternalStore gives us a known server snapshot (`false` = desktop),
// so the server-rendered HTML matches the first client render and React can
// hydrate without a mismatch warning. After hydration the external store
// update fires and the value corrects itself if the viewport is actually
// mobile.
export function useIsMobile(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
}

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getClientSnapshot(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function getServerSnapshot(): boolean {
  return false;
}
