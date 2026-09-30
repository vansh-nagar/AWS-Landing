"use client";

import { useLayoutEffect, useRef } from "react";

import {
  type MotionViewport,
  usePrefersReducedMotion,
  useViewportGate,
} from "@/components/hero/text-motion-hooks";
import { cx } from "@/lib/cx";

/*
 * Port of the reference site's price Odometer (06-pricing): each digit is a
 * 0–9 column in a 1em window that rolls from 0 to its value when the element
 * scrolls into view (1.2s, 0.06s stagger per digit, easeOut). Non-digit
 * characters render as plain text. Reduced motion shows the final value.
 */

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const EASE_OUT = "cubic-bezier(0, 0, 0.58, 1)";
const ROW = { height: "1em", lineHeight: "1em" } as const;

type Part = { type: "text" | "digit"; value: string; key: number };

function splitDigits(text: string): Part[] {
  const parts: Part[] = [];
  let run = "";
  let key = 0;
  for (const ch of text) {
    if (/\d/.test(ch)) {
      if (run) parts.push({ type: "text", value: run, key: key++ });
      run = "";
      parts.push({ type: "digit", value: ch, key: key++ });
    } else {
      run += ch;
    }
  }
  if (run) parts.push({ type: "text", value: run, key: key++ });
  return parts;
}

function Digit({
  digit,
  play,
  reduced,
  duration,
  delay,
}: {
  digit: string;
  play: boolean;
  reduced: boolean;
  duration: number;
  delay: number;
}) {
  const index = DIGITS.indexOf(digit);
  const columnRef = useRef<HTMLSpanElement>(null);
  const final = `translateY(${-index}em)`;

  useLayoutEffect(() => {
    const el = columnRef.current;
    if (!el || reduced || !play) return;
    const animation = el.animate(
      [{ transform: "translateY(0em)" }, { transform: final }],
      { duration: duration * 1000, delay: delay * 1000, easing: EASE_OUT, fill: "backwards" },
    );
    return () => animation.cancel();
  }, [play, reduced, final, duration, delay]);

  // Before the gate opens the column sits on "0" (as in the original).
  const transform = reduced || play ? final : "translateY(0em)";

  return (
    <span className="relative inline-block overflow-hidden align-baseline" style={ROW}>
      <span className="invisible">{digit}</span>
      <span
        ref={columnRef}
        className="absolute inset-x-0 top-0 flex flex-col"
        style={{ transform }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="block" style={ROW} aria-hidden={d !== digit || undefined}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

export function Odometer({
  children,
  className,
  duration = 1.2,
  staggerDelay = 0.06,
  viewport,
}: {
  children: string;
  className?: string;
  duration?: number;
  staggerDelay?: number;
  viewport?: MotionViewport | false;
}) {
  const reduced = usePrefersReducedMotion();
  const { entered, ref } = useViewportGate<HTMLSpanElement>(viewport);
  const parts = splitDigits(children);
  let digitIndex = 0;

  return (
    <span ref={ref} className={cx("inline-flex", className)}>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className="flex items-center">
        {parts.map((part) => {
          if (part.type === "text") return <span key={part.key} className="whitespace-pre">{part.value}</span>;
          const i = digitIndex++;
          return (
            <Digit
              key={part.key}
              digit={part.value}
              play={entered}
              reduced={reduced}
              duration={duration}
              delay={i * staggerDelay}
            />
          );
        })}
      </span>
    </span>
  );
}
