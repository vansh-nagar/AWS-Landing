"use client";

import { useLayoutEffect, useRef } from "react";

import {
  usePrefersReducedMotion,
  useViewportGate,
} from "@/components/hero/text-motion-hooks";
import { cx } from "@/lib/cx";

/*
 * Port of the reference GithubAvatarStack (06-pricing): overlapping 32px
 * circles, grayscale until the parent `group` is hovered, entering with a
 * 0.07s stagger (opacity 0, x -12px, scale 0.7 -> 1, 0.5s). Ours shows the
 * program's pixel icons (no member photos yet) and ends on an open seat.
 */

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
const KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: "translateX(-12px) scale(0.7)" },
  { opacity: 1, transform: "none" },
];

const ICONS = [
  "/brand/program-icon/mint.svg",
  "/brand/icons/bolt_blue.svg",
  "/brand/icons/key_amber.svg",
  "/brand/icons/teams_magenta.svg",
  "/brand/icons/ladder_purple.svg",
];

const CIRCLE =
  "flex size-32 shrink-0 items-center justify-center rounded-full ring-2 ring-off-white";

export function AvatarStack({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const { entered, ref } = useViewportGate<HTMLDivElement>(undefined);
  const itemsRef = useRef<HTMLDivElement>(null);
  const count = ICONS.length + 1;

  useLayoutEffect(() => {
    const root = itemsRef.current;
    if (!root || reduced || !entered) return;
    const animations = Array.from(root.children).map((child, i) =>
      (child as HTMLElement).animate(KEYFRAMES, {
        duration: 500,
        delay: i * 70,
        easing: EASE,
        fill: "backwards",
      }),
    );
    return () => animations.forEach((a) => a.cancel());
  }, [entered, reduced]);

  return (
    <div
      ref={(node) => {
        ref(node);
        itemsRef.current = node;
      }}
      aria-hidden="true"
      className={cx(
        "flex shrink-0 items-center",
        !reduced && !entered && "opacity-0",
        className,
      )}
    >
      {ICONS.map((src, i) => (
        <div
          key={src}
          className={cx("relative", i > 0 && "-ml-10")}
          style={{ zIndex: count - i }}
        >
          <span
            className={cx(
              CIRCLE,
              "bg-black outline outline-black/20 -outline-offset-1 grayscale transition-[filter] duration-300 ease-out group-hover:grayscale-0 motion-reduce:transition-none",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG */}
            <img src={src} alt="" width={14} height={14} className="size-14 object-contain" />
          </span>
        </div>
      ))}
      <div className="relative -ml-10" style={{ zIndex: 0 }}>
        <span
          className={cx(
            CIRCLE,
            "border border-dashed border-dark-grey bg-off-white font-mono text-caption-10 text-dark-grey",
          )}
        >
          +
        </span>
      </div>
    </div>
  );
}
