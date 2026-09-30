"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/hero/text-motion-hooks";
import { cx } from "@/lib/cx";
import type { FaqItem } from "@/content/proof";

/*
 * Port of the reference FaqAccordion: one item open at a time (the first by
 * default), "Q.001 /" mono index, +/- box whose vertical bar rotates 90deg.
 * The panel animates height 0 <-> auto and opacity 0 <-> 1 over 0.4s
 * easeInOut (motion's easeInOut = cubic-bezier(0.42, 0, 0.58, 1)); reduced
 * motion snaps. Closed panels are `inert` so their links can't be tabbed to.
 */

const DURATION_MS = 400;
const EASE_IN_OUT = "cubic-bezier(0.42, 0, 0.58, 1)";

export function FaqAccordion({
  items,
  className,
}: {
  items: FaqItem[];
  className?: string;
}) {
  const [openKey, setOpenKey] = useState<string | null>(items[0]?.key ?? null);

  return (
    <ul className={cx("flex flex-col", className)}>
      {items.map((item, index) => (
        <FaqAccordionItem
          key={item.key}
          item={item}
          index={index}
          isOpen={openKey === item.key}
          onToggle={() =>
            setOpenKey((current) => (current === item.key ? null : item.key))
          }
        />
      ))}
    </ul>
  );
}

function FaqAccordionItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const buttonId = useId();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const mountedRef = useRef(false);
  // Initial style only: after mount the panel's size is driven imperatively,
  // so React never re-applies (and fights) it.
  const [initialStyle] = useState(() =>
    isOpen ? { height: "auto", opacity: 1 } : { height: "0px", opacity: 0 },
  );
  const number = String(index + 1).padStart(3, "0");

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const targetOpacity = isOpen ? "1" : "0";
    // Start from wherever the panel is now (mid-animation included).
    const fromHeight = panel.getBoundingClientRect().height;
    const fromOpacity = getComputedStyle(panel).opacity;
    animationRef.current?.cancel();
    panel.style.height = isOpen ? "auto" : "0px";
    panel.style.opacity = targetOpacity;
    if (reduced) return;

    const toHeight = isOpen ? panel.scrollHeight : 0;
    const animation = panel.animate(
      [
        { height: `${fromHeight}px`, opacity: fromOpacity },
        { height: `${toHeight}px`, opacity: targetOpacity },
      ],
      { duration: DURATION_MS, easing: EASE_IN_OUT },
    );
    animationRef.current = animation;
    return () => animation.cancel();
  }, [isOpen, reduced]);

  return (
    <li className="border-white/15 border-b">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex w-full cursor-pointer items-center justify-between gap-24 py-24 text-left font-mono text-caption-20 uppercase focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/60"
        >
          <span>
            <span className="text-dark-grey" inert>
              Q.{number} /
            </span>{" "}
            <span>{item.question}</span>
          </span>
          <span
            aria-hidden="true"
            className="relative grid size-24 shrink-0 place-items-center rounded-2 bg-white/10 transition-colors group-hover:bg-white/20"
          >
            <span className="h-px w-10 bg-current" />
            <span
              className="absolute h-10 w-px bg-current transition-transform duration-400 ease-[cubic-bezier(0.42,0,0.58,1)] motion-reduce:transition-none"
              style={{ transform: isOpen ? "rotate(90deg)" : "none" }}
            />
          </span>
        </button>
      </h3>
      <div
        ref={panelRef}
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!isOpen}
        className="overflow-hidden"
        style={initialStyle}
      >
        <div className="flex w-full flex-col gap-[1em] pb-24 text-body-20 text-ghost-grey">
          {item.answer.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </li>
  );
}
