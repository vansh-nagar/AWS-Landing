"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cx } from "@/lib/cx";
import {
  type MotionViewport,
  usePrefersReducedMotion,
  useViewportGate,
} from "@/components/hero/text-motion-hooks";
import "./text-motion.css";

const HIDDEN: CSSProperties = { opacity: 0, transform: "translateY(100%)" };
const VISIBLE: CSSProperties = { opacity: 1, transform: "none" };
const KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: "translateY(100%)" },
  { opacity: 1, transform: "none" },
];
const EASING = "cubic-bezier(0.23, 1, 0.32, 1)";

export type AnimatedContentProps = {
  children?: ReactNode;
  className?: string;
  /** Seconds before the entrance starts. */
  animationDelay?: number;
  /** Entrance duration in seconds. */
  duration?: number;
  /**
   * Viewport gate (the original's motion `viewport`). Default waits for the
   * element to enter the viewport (margin 0 0 -10% 0, once); `false` starts
   * on mount.
   */
  viewport?: MotionViewport | false;
};

/**
 * Port of the original AnimatedContent: the inner block rises from
 * translateY(100%) and fades in; the wrapper clips it until the entrance is
 * done. Reduced motion renders a single plain wrapper.
 */
export function AnimatedContent({
  children,
  className,
  animationDelay = 0,
  duration = 1,
  viewport,
}: AnimatedContentProps) {
  const reduced = usePrefersReducedMotion();
  const { entered, ref } = useViewportGate<HTMLDivElement>(viewport);
  const innerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- follow the viewport gate (motion's animate="visible")
    setVisible(entered);
  }, [entered]);

  // Runs before paint, so the first frame after the style flips to its final
  // values already shows keyframe 0 (fill: backwards covers the delay).
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!visible || reduced || !el) return;
    const animation = el.animate(KEYFRAMES, {
      duration: 1000 * duration,
      delay: 1000 * animationDelay,
      easing: EASING,
      fill: "backwards",
    });
    let active = true;
    animation.finished
      .then(() => {
        if (active) setDone(true);
      })
      .catch(() => {});
    return () => {
      active = false;
      animation.cancel();
    };
  }, [visible, reduced, duration, animationDelay]);

  const wrapperClassName = cx(
    "block w-full",
    !reduced && !done && "overflow-hidden",
    className,
  );

  // Distinct keys remount the subtree when reduced motion flips (the original
  // swaps a plain div for a motion.div), instead of patching the inner div.
  if (reduced) {
    return (
      <div key="static" className={wrapperClassName}>
        {children}
      </div>
    );
  }

  return (
    <div
      key="animated"
      ref={ref}
      className={wrapperClassName}
      data-content-cloak={done ? undefined : ""}
    >
      <div ref={innerRef} style={visible ? VISIBLE : HIDDEN}>
        {children}
      </div>
    </div>
  );
}
