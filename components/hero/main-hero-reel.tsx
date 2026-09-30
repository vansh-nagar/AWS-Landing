"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import {
  buttonClassName,
  Connector,
} from "@/components/hero/get-access-button";
import { OdometerHoverText } from "@/components/hero/odometer-hover-text";
import { usePrefersReducedMotion } from "@/components/hero/text-motion-hooks";
import { Typewriter } from "@/components/hero/typewriter";

// motion's `easeOut` preset.
const EASE_OUT = "cubic-bezier(0, 0, 0.58, 1)";

// The original's `{ duration: 0.4, ease: easeOut }`, or `{ duration: 0.01 }`
// under reduced motion.
function fadeTiming(reducedMotion: boolean): KeyframeAnimationOptions {
  return reducedMotion
    ? { duration: 10 }
    : { duration: 400, easing: EASE_OUT };
}

function fadeTransition(reducedMotion: boolean, properties: string[]) {
  const timing = reducedMotion ? "0.01s" : `0.4s ${EASE_OUT}`;
  return properties.map((property) => `${property} ${timing}`).join(", ");
}

const CALIBRATING_LINES = [["> calibrating"]];

// Captured from the live site (IconButton, size md, variant light,
// labelPosition bottom, already tailwind-merged).
const CLOSE_BUTTON_CLASS =
  "inline-flex w-fit min-w-0 shrink-0 cursor-pointer items-end whitespace-nowrap font-mono text-caption-10 uppercase [--odometer-progress:0] motion-safe:hover:[--odometer-progress:1] disabled:pointer-events-none disabled:opacity-50 disabled:grayscale *:data-label:inline-flex *:data-label:items-center *:data-label:justify-center *:data-label:rounded-4 *:data-icon:inline-flex *:data-icon:items-center *:data-icon:justify-center *:data-icon:rounded-4 *:data-connector:transition-colors *:data-icon:transition-colors *:data-label:transition-colors *:data-icon:size-48 *:data-label:h-22 *:data-connector:w-48 *:data-label:px-8 *:data-icon:bg-ghost-grey *:data-label:bg-ghost-grey *:data-connector:text-ghost-grey *:data-icon:text-black *:data-label:text-black [&:hover_[data-connector]]:text-white [&:hover_[data-icon]]:bg-white [&:hover_[data-label]]:bg-white flex-col-reverse absolute top-8 right-8 lg:top-16 lg:right-16";
// IconButton's horizontal connector length for size "md".
const CLOSE_CONNECTOR_LENGTH = 28;

/* ------------------------------------------------------------------------ */
/* Spring for the hover preview                                              */
/* ------------------------------------------------------------------------ */

// Same constants the original passes to motion's useSpring. With these the
// spring is slightly over-damped (damping ratio ≈ 1.06), so it never
// overshoots. Integrated with 1ms semi-implicit Euler substeps.
const PREVIEW_SPRING = { stiffness: 180, damping: 22, mass: 0.6 };
const REST_DELTA = 0.001;
const REST_SPEED = 0.01;
const SUBSTEP_S = 0.001;

class PointSpring {
  private x = 0;
  private y = 0;
  private vx = 0;
  private vy = 0;
  private targetX = 0;
  private targetY = 0;
  private frame = 0;
  private lastTime = 0;

  constructor(private readonly onUpdate: (x: number, y: number) => void) {}

  /** Snap to a point with no animation (motion's `jump`). */
  jump(x: number, y: number) {
    this.stop();
    this.x = this.targetX = x;
    this.y = this.targetY = y;
    this.vx = this.vy = 0;
    this.render();
  }

  /** Spring towards a new target, keeping the current velocity. */
  set(x: number, y: number) {
    this.targetX = x;
    this.targetY = y;
    if (this.frame) return;
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  render() {
    this.onUpdate(this.x, this.y);
  }

  stop() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private tick = (now: number) => {
    const { stiffness, damping, mass } = PREVIEW_SPRING;
    const elapsed = Math.min(now - this.lastTime, 64) / 1000;
    this.lastTime = now;
    const steps = Math.max(1, Math.ceil(elapsed / SUBSTEP_S));
    const h = elapsed / steps;
    for (let i = 0; i < steps; i++) {
      this.vx += ((-stiffness * (this.x - this.targetX) - damping * this.vx) / mass) * h;
      this.vy += ((-stiffness * (this.y - this.targetY) - damping * this.vy) / mass) * h;
      this.x += this.vx * h;
      this.y += this.vy * h;
    }
    const resting =
      Math.abs(this.vx) < REST_SPEED &&
      Math.abs(this.vy) < REST_SPEED &&
      Math.abs(this.x - this.targetX) < REST_DELTA &&
      Math.abs(this.y - this.targetY) < REST_DELTA;
    if (resting) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.vx = this.vy = 0;
      this.frame = 0;
      this.render();
      return;
    }
    this.render();
    this.frame = requestAnimationFrame(this.tick);
  };
}

/* ------------------------------------------------------------------------ */
/* Hover preview (thumbnail that follows the mouse over the trigger)         */
/* ------------------------------------------------------------------------ */

function ReelPreview({
  src,
  visible,
  containerRef,
}: {
  src: string;
  visible: boolean;
  containerRef: (node: HTMLDivElement | null) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const shown = visible && loaded;

  return createPortal(
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-4"
    >
      <div className="-translate-x-1/2 -translate-y-[calc(100%+16px)]">
        <div
          className="aspect-video w-160 origin-bottom overflow-hidden rounded-4 bg-black-deep ring-1 ring-white/10"
          style={{
            opacity: shown ? 1 : 0,
            transform: shown ? "none" : "scale(0.9)",
            transition: `opacity 0.25s ${EASE_OUT}, transform 0.25s ${EASE_OUT}`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- animated preview, no optimisation wanted */}
          <img
            src={src}
            alt=""
            onLoad={() => setLoaded(true)}
            className="size-full object-cover"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------------ */
/* Fullscreen dialog                                                         */
/* ------------------------------------------------------------------------ */

function ReelDialog({
  label,
  open,
  reducedMotion,
  videoSrc,
  videoRef,
  onRequestClose,
  onExited,
}: {
  label: string;
  open: boolean;
  reducedMotion: boolean;
  videoSrc?: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  onRequestClose: () => void;
  onExited: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loaderPresent, setLoaderPresent] = useState(true);

  // Mount = showModal (top layer, rest of the page inert). Unmount = close,
  // which hands focus back to the element that opened it.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.style.opacity = "0";
    if (!dialog.open) dialog.showModal();
    return () => dialog.close();
  }, []);

  // Fade in while open; fade out when closed, then let the parent unmount.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Start from wherever a running fade currently is.
    const from = getComputedStyle(dialog).opacity;
    const to = open ? "1" : "0";
    for (const animation of dialog.getAnimations()) animation.cancel();
    dialog.style.opacity = to;
    const animation = dialog.animate(
      [{ opacity: from }, { opacity: to }],
      fadeTiming(reducedMotion),
    );
    if (!open) animation.onfinish = onExited;
    return () => {
      animation.onfinish = null;
    };
  }, [open, reducedMotion, onExited]);

  // Once the video plays, fade the loader out and drop it.
  useLayoutEffect(() => {
    const loader = loaderRef.current;
    if (!ready || !loader) return;
    const animation = loader.animate(
      [{ opacity: getComputedStyle(loader).opacity }, { opacity: 0 }],
      { ...fadeTiming(reducedMotion), fill: "forwards" },
    );
    animation.onfinish = () => setLoaderPresent(false);
    return () => {
      animation.onfinish = null;
    };
  }, [ready, reducedMotion]);

  // autoPlay "any": try with sound, fall back to muted.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
  }, [videoRef]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      onCancel={(event) => {
        // Escape: run our own fade-out instead of the instant native close.
        event.preventDefault();
        onRequestClose();
      }}
      onClose={() => {
        // Only reached if the browser force-closes the dialog.
        if (!dialogRef.current?.open) onExited();
      }}
      className="fixed inset-0 m-0 size-full max-h-none max-w-none overflow-hidden bg-black-deep p-0 backdrop:bg-transparent"
    >
      <div
        onClick={togglePlayback}
        className="size-full cursor-pointer"
        style={{
          opacity: ready ? 1 : 0,
          transform: ready || reducedMotion ? "none" : "scale(0.98)",
          transition: fadeTransition(reducedMotion, ["opacity", "transform"]),
        }}
      >
        {videoSrc ? (
          <div className="relative isolate max-w-full overflow-hidden size-full">
            <video
              ref={videoRef}
              src={videoSrc}
              playsInline
              preload="auto"
              onPlaying={() => setReady(true)}
              className="absolute inset-0 z-2 size-full object-contain"
            />
          </div>
        ) : null}
      </div>
      {loaderPresent ? (
        <div
          ref={loaderRef}
          role="status"
          className="pointer-events-none absolute inset-0 grid place-items-center px-16"
        >
          <Typewriter
            lines={CALIBRATING_LINES}
            viewport={false}
            charDelay={22}
            className="font-mono text-caption-10 text-white/70 uppercase"
          />
        </div>
      ) : null}
      <button
        type="button"
        onClick={onRequestClose}
        className={CLOSE_BUTTON_CLASS}
      >
        <span data-label>
          <OdometerHoverText text="Close" />
        </span>
        <span data-connector className="flex justify-center">
          <Connector orientation="horizontal" length={CLOSE_CONNECTOR_LENGTH} />
        </span>
        <span data-icon>X</span>
      </button>
    </dialog>
  );
}

/* ------------------------------------------------------------------------ */
/* WATCH REEL                                                                */
/* ------------------------------------------------------------------------ */

/**
 * "WATCH REEL" button that opens the reel in a fullscreen native <dialog>.
 * Without `videoSrc` the dialog shows the "> calibrating" loader. With
 * `previewSrc` (an image, e.g. an animated webp), hovering the button with a
 * mouse shows a spring-following thumbnail, like the original's Mux preview.
 */
export function MainHeroReel({
  buttonText,
  videoSrc,
  previewSrc,
}: {
  buttonText: string;
  videoSrc?: string;
  previewSrc?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Stays true through the exit fade (AnimatePresence in the original).
  const [isPresent, setIsPresent] = useState(false);
  const [previewMounted, setPreviewMounted] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewNodeRef = useRef<HTMLDivElement | null>(null);
  const springRef = useRef<PointSpring | null>(null);

  function getSpring() {
    springRef.current ??= new PointSpring((x, y) => {
      const node = previewNodeRef.current;
      if (node) node.style.transform = `translateX(${x}px) translateY(${y}px)`;
    });
    return springRef.current;
  }

  const setPreviewNode = useCallback((node: HTMLDivElement | null) => {
    previewNodeRef.current = node;
    if (node) springRef.current?.render();
  }, []);

  useEffect(() => () => springRef.current?.stop(), []);

  // Lock page scroll while open (the original stops Lenis, which sets
  // `overflow: clip` on <html>).
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "clip";
    return () => {
      root.style.overflow = previous;
    };
  }, [isOpen]);

  function openReel() {
    setPreviewVisible(false);
    setIsOpen(true);
    setIsPresent(true);
  }

  const closeReel = useCallback(() => {
    videoRef.current?.pause();
    setIsOpen(false);
  }, []);

  const handleExited = useCallback(() => {
    setIsOpen(false);
    setIsPresent(false);
    // Native close restores focus; cover browsers that don't focus buttons on click.
    requestAnimationFrame(() => {
      const active = document.activeElement;
      if (!active || active === document.body) {
        triggerRef.current?.focus({ preventScroll: true });
      }
    });
  }, []);

  function handlePointerEnter(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "mouse" || reducedMotion) return;
    getSpring().jump(event.clientX, event.clientY);
    setPreviewMounted(true);
    setPreviewVisible(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    getSpring().set(event.clientX, event.clientY);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={buttonClassName("light")}
        onClick={openReel}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setPreviewVisible(false)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span data-text>
          <OdometerHoverText text={buttonText} />
        </span>
      </button>
      {previewMounted && previewSrc ? (
        <ReelPreview
          src={previewSrc}
          visible={previewVisible}
          containerRef={setPreviewNode}
        />
      ) : null}
      {isPresent
        ? createPortal(
            <ReelDialog
              label={buttonText}
              open={isOpen}
              reducedMotion={reducedMotion}
              videoSrc={videoSrc}
              videoRef={videoRef}
              onRequestClose={closeReel}
              onExited={handleExited}
            />,
            document.body,
          )
        : null}
    </>
  );
}
