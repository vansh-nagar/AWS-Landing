"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/** Port of the original's usePrefersReducedMotion (false on the server). */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/** Framer-motion style viewport options (the subset the original uses). */
export type MotionViewport = { once?: boolean; margin?: string; amount?: number };

/** The original's MOTION_VIEWPORT default. */
export const MOTION_VIEWPORT: MotionViewport = {
  margin: "0px 0px -10% 0px",
  once: true,
};

/**
 * Port of useViewportEnteredForGate + motion's `viewport`/`onViewportEnter`:
 * `false` disables gating (entered immediately), `undefined` uses
 * MOTION_VIEWPORT. Pass the returned ref callback to the gated element.
 */
export function useViewportGate<T extends Element>(
  viewport: MotionViewport | false | undefined,
): { entered: boolean; ref: (node: T | null) => void } {
  const disabled = viewport === false;
  const resolved = viewport === false ? null : (viewport ?? MOTION_VIEWPORT);
  const margin = resolved?.margin ?? "0px";
  const once = resolved?.once ?? false;
  const amount = resolved?.amount ?? 0;

  const [inView, setInView] = useState(false);
  const [node, setNode] = useState<T | null>(null);

  useEffect(() => {
    if (disabled || !node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) io.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { rootMargin: margin, threshold: amount },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [disabled, node, margin, once, amount]);

  const ref = useCallback((el: T | null) => setNode(el), []);
  return { entered: disabled || inView, ref };
}

/** Port of the original's fonts-ready hook (document.fonts.ready). */
export function useFontsReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (document.fonts.status === "loaded") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fonts already loaded at mount (mirrors the original)
      setReady(true);
      return;
    }
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return ready;
}
