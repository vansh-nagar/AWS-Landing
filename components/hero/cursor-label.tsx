"use client";

import type { RefObject } from "react";
import { cx } from "@/lib/cx";
import { useIsTouchDevice } from "./use-media-query";

type CursorLabelProps = {
  labelRef: RefObject<HTMLDivElement | null>;
  isHovering: boolean;
  text?: string;
};

/**
 * Small white mono label that follows the cursor inside an interactive canvas.
 * On touch devices it is pinned to the top-right corner instead.
 */
export function CursorLabel({
  labelRef,
  isHovering,
  text = "Click",
}: CursorLabelProps) {
  const isTouch = useIsTouchDevice();

  if (isTouch) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-16 right-16 z-2 select-none whitespace-nowrap bg-white p-2 font-mono text-black text-caption-10 uppercase"
      >
        {text}
      </div>
    );
  }

  return (
    <div
      ref={labelRef}
      aria-hidden="true"
      className={cx(
        "pointer-events-none absolute top-0 left-0 z-2 translate-x-20 translate-y-20 select-none whitespace-nowrap bg-white p-2 font-mono text-black text-caption-10 uppercase transition-opacity duration-150",
        isHovering ? "opacity-100" : "opacity-0",
      )}
    >
      {text}
    </div>
  );
}

type CursorTrackingOptions = {
  container: HTMLElement;
  signal: AbortSignal;
  labelRef: RefObject<HTMLDivElement | null>;
  setIsHovering: (hovering: boolean) => void;
  onPointerMove?: (localX: number, localY: number) => void;
  onPointerEnter?: (localX: number, localY: number) => void;
  onPointerLeave?: () => void;
  onPointerDown?: (localX: number, localY: number) => void;
  onPointerUp?: (localX: number, localY: number) => void;
  onClick?: (localX: number, localY: number) => void;
};

/**
 * Wires pointer listeners on `container` (removed when `signal` aborts), keeps
 * the label under the cursor, and forwards container-local coordinates.
 */
export function setupCursorTracking({
  container,
  signal,
  labelRef,
  setIsHovering,
  onPointerMove,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onClick,
}: CursorTrackingOptions) {
  const toLocal = (event: PointerEvent | MouseEvent) => {
    const rect = container.getBoundingClientRect();
    return {
      localX: event.clientX - rect.left,
      localY: event.clientY - rect.top,
    };
  };

  const moveLabel = (x: number, y: number) => {
    const label = labelRef.current;
    if (!label) return;
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
  };

  const handleLeave = () => {
    onPointerLeave?.();
    setIsHovering(false);
  };

  container.addEventListener(
    "pointermove",
    (event) => {
      const { localX, localY } = toLocal(event);
      moveLabel(localX, localY);
      onPointerMove?.(localX, localY);
    },
    { passive: true, signal },
  );

  container.addEventListener(
    "pointerenter",
    (event) => {
      const { localX, localY } = toLocal(event);
      moveLabel(localX, localY);
      onPointerEnter?.(localX, localY);
      setIsHovering(true);
    },
    { signal },
  );

  container.addEventListener("pointerleave", handleLeave, { signal });
  container.addEventListener("pointercancel", handleLeave, { signal });

  container.addEventListener(
    "pointerdown",
    (event) => {
      const { localX, localY } = toLocal(event);
      onPointerDown?.(localX, localY);
    },
    { signal },
  );

  container.addEventListener(
    "pointerup",
    (event) => {
      const { localX, localY } = toLocal(event);
      onPointerUp?.(localX, localY);
    },
    { signal },
  );

  container.addEventListener(
    "click",
    (event) => {
      const { localX, localY } = toLocal(event);
      onClick?.(localX, localY);
    },
    { signal },
  );
}
