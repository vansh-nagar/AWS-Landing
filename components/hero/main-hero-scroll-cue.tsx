"use client";

import { useLayoutEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/components/hero/text-motion-hooks";
import { cx } from "@/lib/cx";

// motion's `easeOut` preset.
const EASE_OUT = "cubic-bezier(0, 0, 0.58, 1)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// The original scrolls with Lenis using ANCHOR_SCROLL
// ({ duration: 1.2, easing: easeInOutCubic }); reproduced here with rAF.
const SCROLL_DURATION_MS = 1200;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const USER_SCROLL_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"];

const BASE_CLASS =
  "group flex cursor-pointer flex-col items-center rounded-4 bg-black-deep px-8 py-10 ring-1 ring-white/20 ring-inset transition-shadow hover:ring-white/40 focus-visible:ring-2 focus-visible:ring-white/60";

const TRACK_STYLE = {
  backgroundImage:
    "repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0 1px, transparent 1px 8px)",
};

// The original joins classes with tailwind-merge, so a display utility in
// `className` (e.g. "hidden ... lg:flex") drops the base `flex`.
const DISPLAY_UTILITY =
  /^(hidden|flex|inline-flex|block|inline-block|inline|grid|inline-grid|contents)$/;

function joinClasses(className?: string) {
  if (!className) return BASE_CLASS;
  const overridesDisplay = className
    .split(/\s+/)
    .some((token) => DISPLAY_UTILITY.test(token));
  const base = overridesDisplay
    ? BASE_CLASS.split(" ")
        .filter((token) => token !== "flex")
        .join(" ")
    : BASE_CLASS;
  return cx(base, className);
}

function smoothScrollTo(top: number) {
  const startTop = window.scrollY;
  const maxTop = document.documentElement.scrollHeight - window.innerHeight;
  const targetTop = Math.max(0, Math.min(top, maxTop));
  const distance = targetTop - startTop;
  if (distance === 0) return;

  const startTime = performance.now();
  let frame = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    for (const type of USER_SCROLL_EVENTS) {
      window.removeEventListener(type, stop);
    }
  };
  const step = (now: number) => {
    const t = Math.min(1, (now - startTime) / SCROLL_DURATION_MS);
    window.scrollTo({ top: startTop + distance * easeInOutCubic(t), behavior: "instant" });
    if (t < 1) frame = requestAnimationFrame(step);
    else stop();
  };
  // User input takes over, like Lenis.
  for (const type of USER_SCROLL_EVENTS) {
    window.addEventListener(type, stop, { passive: true });
  }
  frame = requestAnimationFrame(step);
}

/**
 * "Scroll to the next section" cue at the bottom of the hero: a dotted track
 * with a stepping bar. Fades in (0.4s, 0.4s delay) and scrolls one viewport.
 */
export function MainHeroScrollCue({ className }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Entrance: server HTML starts at opacity 0 (like motion's `initial`), then
  // fades to 1. Under reduced motion it jumps straight to 1.
  useLayoutEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    button.style.opacity = "1";
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const animation = button.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 400,
      delay: 400,
      easing: EASE_OUT,
      fill: "backwards",
    });
    return () => animation.cancel();
  }, []);

  function scrollToNextSection() {
    const top = window.scrollY + window.innerHeight;
    if (reducedMotion) window.scrollTo({ top, behavior: "instant" });
    else smoothScrollTo(top);
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="Scroll to the next section"
      onClick={scrollToNextSection}
      className={joinClasses(className)}
      style={{ opacity: 0 }}
    >
      <span
        aria-hidden="true"
        className="relative block h-48 w-6 overflow-hidden"
        style={TRACK_STYLE}
      >
        <span className="absolute inset-x-0 top-0 h-6 animate-hero-scroll-cue bg-white/90 transition-colors group-hover:bg-white motion-reduce:hidden" />
        <span className="absolute inset-x-0 bottom-0 hidden h-6 bg-white/90 motion-reduce:block" />
      </span>
    </button>
  );
}
