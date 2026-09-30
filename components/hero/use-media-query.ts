"use client";

import { useEffect, useState } from "react";

// Tailwind default screens (the original reads them from its tailwind config).
export const screens = {
  sm: "40rem",
  md: "48rem",
  lg: "64rem",
  xl: "80rem",
  "2xl": "96rem",
} as const;

export type Breakpoint = keyof typeof screens;

/**
 * Port of the original's useMediaQuery. `initializeWithValue` is the value
 * returned on the server and on the first client render (default false); the
 * real match is read in an effect, so SSR and hydration always agree.
 */
export function useMediaQuery(
  query: string,
  initializeWithValue = false,
): boolean {
  const [matches, setMatches] = useState<boolean>(initializeWithValue);

  useEffect(() => {
    try {
      if (!("matchMedia" in window)) return;
      const mql = window.matchMedia(query);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the external media query once mounted (mirrors the original)
      setMatches(mql.matches);
      const onChange = (event: MediaQueryListEvent) =>
        setMatches(event.matches);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    } catch {
      return;
    }
  }, [query]);

  return matches || false;
}

export function useBreakpoint(
  breakpoint: Breakpoint,
  opts?: { initializeWithValue?: boolean },
): boolean {
  return useMediaQuery(
    `(min-width: ${screens[breakpoint]})`,
    opts?.initializeWithValue ?? false,
  );
}

export function useIsTouchDevice(opts?: {
  initializeWithValue?: boolean;
}): boolean {
  return useMediaQuery("(pointer: coarse)", opts?.initializeWithValue ?? false);
}
