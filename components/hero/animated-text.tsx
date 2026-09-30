"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type MotionViewport,
  useFontsReady,
  usePrefersReducedMotion,
  useViewportGate,
} from "@/components/hero/text-motion-hooks";
import "./text-motion.css";

/* Values copied from the original AnimatedText. */
const KEYFRAMES: Keyframe[] = [
  { translate: "0 100%", opacity: 0 },
  { translate: "0 0", opacity: 1 },
];
const EASING = "cubic-bezier(0.23, 1, 0.32, 1)";
const LINE_STAGGER = 0.1;
const MASK_CLIP = "inset(calc(0.25em * -1) 0)";
const DEBOUNCE_MS = 200;
/** Server/pre-reveal style (the original uses 0.001, not 0). */
const CLOAK_STYLE = { opacity: 0.001 };

type LineStart = { node: Text; offset: number };

type SplitHandle = {
  lines: HTMLElement[];
  width: number;
  setMasksClipped: (clipped: boolean) => void;
  revert: () => void;
};

/**
 * Tokens at whose start the browser may begin a new line: whitespace-separated
 * words, with hyphenated words split after each hyphen ("Full-" + "stack").
 */
const BREAK_TOKEN = /[^\s\-‐]*[\-‐]+|[^\s\-‐]+/g;

/** Where each rendered (layout) line starts, read from the live layout. */
function findLineStarts(target: HTMLElement): LineStart[] {
  const starts: LineStart[] = [];
  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let lineTop = 0;
  let lineBottom = 0;
  let hasLine = false;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    for (const match of text.data.matchAll(BREAK_TOKEN)) {
      const index = match.index ?? 0;
      range.setStart(text, index);
      range.setEnd(text, index + match[0].length);
      const rect = range.getBoundingClientRect();
      if (!rect.width && !rect.height) continue;
      const middle = (rect.top + rect.bottom) / 2;
      if (hasLine && middle > lineTop + 2 && middle < lineBottom - 2) continue;
      hasLine = true;
      lineTop = rect.top;
      lineBottom = rect.bottom;
      starts.push({ node: text, offset: index });
    }
  }
  return starts;
}

/**
 * Splits one element into layout lines, producing the original splitter's
 * DOM: `div[data-mask] > div[translate=no][data-line]` per line. The original
 * child nodes are kept (not re-created) so React's references stay valid, and
 * are put back on revert.
 */
function splitTarget(target: HTMLElement) {
  const originals = Array.from(target.childNodes);
  const previousSplit = target.getAttribute("data-split");
  const starts = findLineStarts(target);
  const range = document.createRange();
  const masks: HTMLElement[] = [];
  const lines: HTMLElement[] = [];

  starts.forEach((start, i) => {
    if (i === 0) range.setStart(target, 0);
    else range.setStart(start.node, start.offset);
    const next = starts[i + 1];
    if (next) range.setEnd(next.node, next.offset);
    else range.setEnd(target, target.childNodes.length);

    const mask = document.createElement("div");
    mask.setAttribute("data-mask", String(i));
    mask.style.cssText = `display:block;position:relative;clip-path:${MASK_CLIP}`;
    const line = document.createElement("div");
    line.setAttribute("translate", "no");
    line.setAttribute("data-line", String(i));
    line.style.cssText = `display:block;position:relative;--line:${i}`;
    line.append(range.cloneContents());
    mask.append(line);
    masks.push(mask);
    lines.push(line);
  });

  const clips = masks.map((mask) => mask.style.clipPath);
  if (masks.length > 0) target.replaceChildren(...masks);
  target.style.setProperty("--lines", String(lines.length));
  target.style.setProperty("--words", "0");
  target.style.setProperty("--chars", "0");
  target.setAttribute("data-split", lines.length > 0 ? "lines" : "");

  return {
    lines,
    setMasksClipped(clipped: boolean) {
      masks.forEach((mask, i) => {
        mask.style.clipPath = clipped ? clips[i] || "inset(0)" : "none";
      });
    },
    revert() {
      target.replaceChildren(...originals);
      if (previousSplit === null) target.removeAttribute("data-split");
      else target.setAttribute("data-split", previousSplit);
      for (const kind of ["lines", "words", "chars"]) {
        target.style.removeProperty(`--${kind}`);
      }
    },
  };
}

/** Splits the root, or each `splitSelector` match inside it when any exist. */
function splitRoot(root: HTMLElement, splitSelector?: string): SplitHandle {
  const matches = splitSelector
    ? Array.from(root.querySelectorAll<HTMLElement>(splitSelector))
    : [];
  const targets = matches.length > 0 ? matches : [root];
  const splits = targets.map(splitTarget);
  return {
    lines: splits.flatMap((split) => split.lines),
    width: root.offsetWidth,
    setMasksClipped: (clipped) => {
      for (const split of splits) split.setMasksClipped(clipped);
    },
    revert: () => {
      for (const split of splits) split.revert();
    },
  };
}

const DISPLAY_UTILITIES = new Set([
  "block",
  "inline-block",
  "inline",
  "flex",
  "inline-flex",
  "grid",
  "inline-grid",
  "contents",
  "flow-root",
  "table",
  "hidden",
]);

/**
 * cx(base, className) with the original's tailwind-merge behaviour for the
 * base classes: a display or width utility in `className` replaces the base.
 */
function rootClassName(as: "span" | "div", className?: string) {
  const base = as === "div" ? ["block", "w-full"] : ["inline-block"];
  const tokens = className?.split(/\s+/).filter(Boolean) ?? [];
  const hasDisplay = tokens.some((token) => DISPLAY_UTILITIES.has(token));
  const hasWidth = tokens.some((token) => token.startsWith("w-"));
  const kept = base.filter((token) =>
    DISPLAY_UTILITIES.has(token) ? !hasDisplay : !hasWidth,
  );
  return [...kept, ...tokens].join(" ");
}

export type AnimatedTextProps = {
  children?: ReactNode;
  /** Seconds before the first line starts. */
  animationDelay?: number;
  /** Seconds per line. */
  duration?: number;
  as?: "span" | "div";
  className?: string;
  /** Split each matching element inside instead of the root (rich text). */
  splitSelector?: string;
  /** Seconds between lines (default 0.1). */
  staggerDelay?: number;
  /**
   * Viewport gate (the original's motion `viewport`). Default waits for the
   * element to enter the viewport (margin 0 0 -10% 0, once); `false` starts
   * as soon as fonts are ready.
   */
  viewport?: MotionViewport | false;
};

/**
 * Port of the original AnimatedText: splits its text into rendered lines and
 * reveals them bottom-up with a 0.1s stagger once fonts are ready and the
 * element is in view. Re-splits on resize (debounced) without replaying.
 */
export function AnimatedText({
  children,
  animationDelay = 0,
  duration = 1,
  as = "span",
  className,
  splitSelector,
  staggerDelay,
  viewport,
}: AnimatedTextProps) {
  const reduced = usePrefersReducedMotion();
  const fontsReady = useFontsReady();
  const { entered, ref: gateRef } = useViewportGate<HTMLElement>(viewport);
  const rootRef = useRef<HTMLElement | null>(null);
  const splitRef = useRef<SplitHandle | null>(null);
  const animationsRef = useRef<Animation[] | null>(null);
  const finishedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  const canAnimate = !reduced && fontsReady;
  const gateOpen = reduced || (entered && fontsReady);

  const setRoot = useCallback(
    (el: HTMLElement | null) => {
      rootRef.current = el;
      gateRef(el);
    },
    [gateRef],
  );

  const split = useCallback(() => {
    const root = rootRef.current;
    if (!root) return null;
    splitRef.current?.revert();
    splitRef.current = splitRoot(root, splitSelector);
    return splitRef.current;
  }, [splitSelector]);

  const play = useCallback(
    (handle: SplitHandle, delay: number, currentTime = 0) => {
      finishedRef.current = false;
      handle.setMasksClipped(true);
      const stagger = (staggerDelay ?? LINE_STAGGER) * 1000;
      const animations = handle.lines.map((line, i) =>
        line.animate(KEYFRAMES, {
          duration: 1000 * duration,
          delay: 1000 * delay + i * stagger,
          easing: EASING,
          fill: "backwards",
        }),
      );
      for (const animation of animations) animation.currentTime = currentTime;
      animationsRef.current = animations;
      Promise.all(animations.map((animation) => animation.finished))
        .then(() => {
          if (animationsRef.current !== animations) return;
          finishedRef.current = true;
          handle.setMasksClipped(false);
        })
        .catch(() => {});
    },
    [duration, staggerDelay],
  );

  const stop = useCallback(() => {
    for (const animation of animationsRef.current ?? []) animation.cancel();
    animationsRef.current = null;
    finishedRef.current = false;
  }, []);

  // Entrance: once fonts are ready and the root is in view.
  useEffect(() => {
    if (!rootRef.current || !gateOpen) return;
    // Drop the cloak in the same task the line animations (fill: backwards)
    // take over, so no frame shows the text fully visible.
    setRevealed(true);
    if (!canAnimate) return;
    const handle = split();
    if (!handle) return;
    if (handle.lines.length > 0) play(handle, animationDelay);
    else handle.setMasksClipped(false);
    return () => {
      stop();
      splitRef.current?.revert();
      splitRef.current = null;
    };
  }, [animationDelay, canAnimate, gateOpen, split, play, stop]);

  // Re-split when the root's width changes or late fonts land (debounced).
  // A running entrance resumes where it was; a finished one is not replayed.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let timer = 0;
    const run = () => {
      timer = 0;
      const current = splitRef.current;
      if (!current || root.offsetWidth === current.width) return;
      const resumeAt =
        animationsRef.current && !finishedRef.current
          ? Number(animationsRef.current[0]?.currentTime ?? 0)
          : null;
      stop();
      const next = split();
      if (!next) return;
      if (resumeAt === null) next.setMasksClipped(false);
      else play(next, animationDelay, resumeAt);
    };
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(run, DEBOUNCE_MS);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    document.fonts.addEventListener("loadingdone", schedule);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", schedule);
      window.clearTimeout(timer);
    };
  }, [animationDelay, split, play, stop]);

  const Tag = as === "div" ? "div" : "span";
  return (
    <Tag
      ref={setRoot}
      className={rootClassName(as, className)}
      style={revealed ? undefined : CLOAK_STYLE}
      data-text-cloak={revealed ? undefined : ""}
      onFocus={() => splitRef.current?.setMasksClipped(false)}
    >
      {children}
    </Tag>
  );
}
