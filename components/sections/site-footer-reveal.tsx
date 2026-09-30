"use client";

import { type ReactNode, useEffect, useRef } from "react";

/**
 * Port of the reference FooterReveal's motion, without the sticky pinning:
 * while the footer scrolls into view its content rises from +30% of the
 * footer height to rest, and a black veil fades from 0.7 to 0. Both settle
 * when the page reaches its end. Static under reduced motion.
 */
export function SiteFooterReveal({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    const veil = veilRef.current;
    const footer = content?.closest("footer");
    if (!content || !veil || !footer) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      const height = footer.offsetHeight;
      if (reduced.matches || height === 0) {
        content.style.transform = "none";
        veil.style.opacity = "0";
        return;
      }
      // 1 while the footer is below the fold, 0 once its bottom meets the
      // viewport bottom (end of page).
      const rest = footer.getBoundingClientRect().bottom - window.innerHeight;
      const progress = Math.min(Math.max(rest / height, 0), 1);
      content.style.transform = `translate3d(0, ${progress * height * 0.3}px, 0)`;
      veil.style.opacity = String(0.7 * progress);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <>
      <div ref={contentRef} className="will-change-transform">
        {children}
      </div>
      <div
        ref={veilRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black will-change-[opacity]"
        style={{ opacity: 0 }}
      />
    </>
  );
}
