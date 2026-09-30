"use client";

import { type MouseEvent, useEffect, useState } from "react";

// 0, 0.05, ... 1: re-check on every 5% of visibility change (reference value).
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

/**
 * Port of the reference nav's active-section tracker: the active section is
 * the one crossing the line 40% down the viewport. Sections that mount late
 * are picked up through a MutationObserver. Returns null when none matches.
 */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const wanted = key.split("|").filter(Boolean);
    if (wanted.length === 0) return;

    const observed = new Set<Element>();
    let queued = false;

    const compute = () => {
      queued = false;
      const line = window.innerHeight * 0.4;
      let next: string | null = null;
      for (const el of observed) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > line) {
          next = el.id;
          break;
        }
      }
      setActive(next);
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(compute);
    };

    const io = new IntersectionObserver(schedule, { threshold: THRESHOLDS });
    const collect = () => {
      let added = false;
      for (const id of wanted) {
        const el = document.getElementById(id);
        if (el && !observed.has(el)) {
          observed.add(el);
          io.observe(el);
          added = true;
        }
      }
      if (observed.size === wanted.length) mo.disconnect();
      if (added) schedule();
    };
    const mo = new MutationObserver(collect);
    mo.observe(document.body, { childList: true, subtree: true });
    collect();

    return () => {
      io.disconnect();
      mo.disconnect();
      setActive(null);
    };
  }, [key]);

  return active;
}

/**
 * Smooth-scrolls same-page links ("#about", or "/" while on "/") instead of
 * jumping, and keeps the hash in the URL. Instant under reduced motion.
 */
export function scrollToHref(event: MouseEvent<HTMLAnchorElement>, href: string) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
    return;
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = reduced ? "auto" : "smooth";

  if (href === "/" && window.location.pathname === "/") {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior });
    history.replaceState(null, "", "/");
    return;
  }
  if (!href.startsWith("#")) return;
  const target = document.getElementById(href.slice(1));
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior, block: "start" });
  history.replaceState(null, "", href);
}
