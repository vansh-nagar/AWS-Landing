"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";

/*
 * Port of the reference `AsciiImage` (showcase grid): the image drawn as a
 * 120-column field of mono glyphs ".:-=+*#%@", brightness mapped to glyph
 * density + alpha. The reference precomputes the cells on the server; here we
 * sample the image in the browser (same-origin or CORS-enabled sources).
 * With `revealOnHover`, the real image fades in over it on hover/focus of the
 * nearest `.group` (same classes/timings as the reference).
 */

const GLYPHS = ".:-=+*#%@";
const DEFAULT_COLS = 120;
const DEFAULT_LEVELS = 64;
/** Mono glyph cell height/width ratio used for rows (120 cols @16:9 = 37 rows). */
const CELL_RATIO = 0.55;

type Fit = "cover" | "contain";

export type ProofAsciiImageProps = {
  src: string;
  /** Accessible label for the ASCII canvas (the image's alt text). */
  label: string;
  /** width / height of the frame. */
  aspect: number;
  cols?: number;
  levels?: number;
  /** "contain" draws the whole image centred (logos/icons). */
  fit?: Fit;
  /** Fraction of the frame the image fills when fit="contain". */
  containScale?: number;
  revealOnHover?: boolean;
  /** Force bright-on-dark (true) or dark-on-light (false). Default: from background. */
  invert?: boolean;
  className?: string;
};

function backgroundLuminance(el: HTMLElement | null) {
  for (let node = el; node; node = node.parentElement) {
    const match = /rgba?\(([^)]+)\)/.exec(getComputedStyle(node).backgroundColor);
    if (!match?.[1]) continue;
    const [r, g, b, a = 1] = match[1].split(",").map((v) => Number.parseFloat(v));
    if (r === undefined || g === undefined || b === undefined) continue;
    if (a > 0) return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }
  return 1;
}

/** Samples the image into cols x rows brightness levels (0..levels-1). */
function sampleCells(
  image: HTMLImageElement,
  cols: number,
  rows: number,
  levels: number,
  aspect: number,
  fit: Fit,
  containScale: number,
): Uint8Array | null {
  // Sample at 2x per cell, then average, for smoother levels.
  const sw = cols * 2;
  const sh = rows * 2;
  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, sw, sh);

  const iw = image.naturalWidth || 1;
  const ih = image.naturalHeight || 1;
  const imageAspect = iw / ih;
  // Work in frame units (frame = aspect x 1), then scale to the sample grid,
  // whose cells are not square (x: sw/aspect, y: sh per unit).
  let imageH: number;
  if (fit === "cover") {
    imageH = imageAspect > aspect ? 1 : aspect / imageAspect;
  } else {
    imageH = Math.min(aspect / imageAspect, 1) * containScale;
  }
  const dw = ((imageAspect * imageH) / aspect) * sw;
  const dh = imageH * sh;
  ctx.drawImage(image, (sw - dw) / 2, (sh - dh) / 2, dw, dh);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, sw, sh).data;
  } catch {
    return null; // tainted canvas (no CORS)
  }

  const lum = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let sum = 0;
      for (let oy = 0; oy < 2; oy++) {
        for (let ox = 0; ox < 2; ox++) {
          const i = ((y * 2 + oy) * sw + (x * 2 + ox)) * 4;
          sum +=
            (0.2126 * (data[i] ?? 0) +
              0.7152 * (data[i + 1] ?? 0) +
              0.0722 * (data[i + 2] ?? 0)) /
            255;
        }
      }
      lum[y * cols + x] = sum / 4;
    }
  }

  // Stretch contrast between the 2nd and 98th percentile.
  const sorted = Float32Array.from(lum).sort();
  const lo = sorted[Math.floor(sorted.length * 0.02)] ?? 0;
  const hi = sorted[Math.floor(sorted.length * 0.98)] ?? 1;
  const range = Math.max(hi - lo, 0.05);
  const cells = new Uint8Array(cols * rows);
  for (let i = 0; i < lum.length; i++) {
    const t = Math.min(1, Math.max(0, ((lum[i] ?? 0) - lo) / range));
    cells[i] = Math.round(t * (levels - 1));
  }
  return cells;
}

export function ProofAsciiImage({
  src,
  label,
  aspect,
  cols = DEFAULT_COLS,
  levels = DEFAULT_LEVELS,
  fit = "cover",
  containScale = 0.8,
  revealOnHover = false,
  invert,
  className,
}: ProofAsciiImageProps) {
  const rows = Math.max(1, Math.round((cols / aspect) * CELL_RATIO));
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cells, setCells] = useState<Uint8Array | null>(null);
  const [width, setWidth] = useState(0);
  const [near, setNear] = useState(false);
  const [drawn, setDrawn] = useState(false);

  // Only work once the frame is within 400px of the viewport (as the original).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Debounced width.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(([entry]) => {
      const next = Math.round(entry?.contentRect.width ?? 0);
      clearTimeout(timer);
      timer = setTimeout(() => setWidth(next), 100);
    });
    ro.observe(el);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  // Load + sample the image.
  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      if (cancelled) return;
      setCells(sampleCells(image, cols, rows, levels, aspect, fit, containScale));
    };
    image.src = src;
    return () => {
      cancelled = true;
    };
  }, [near, src, cols, rows, levels, aspect, fit, containScale]);

  // Draw.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cells || width <= 0) return;
    let cancelled = false;
    const draw = () => {
      if (cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(width * dpr));
      const h = Math.max(1, Math.round((width / aspect) * dpr));
      canvas.width = w;
      canvas.height = h;
      const cw = w / cols;
      const ch = h / rows;
      const dark = invert ?? backgroundLuminance(canvas) < 0.5;
      const family = getComputedStyle(canvas).fontFamily || "ui-monospace, monospace";
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = getComputedStyle(canvas).color || (dark ? "#fff" : "#000");
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `400 ${Math.floor(ch)}px ${family}`;
      const mWidth = ctx.measureText("M").width || ch * 0.6;
      ctx.font = `400 ${Math.floor((cw / mWidth) * ch)}px ${family}`;

      const max = levels - 1;
      const glyphs: string[] = [];
      const alphas = new Float32Array(levels);
      for (let level = 0; level <= max; level++) {
        const t = level / max;
        const v = dark ? t : 1 - t;
        glyphs[level] =
          GLYPHS[Math.min(GLYPHS.length - 1, Math.round(v * (GLYPHS.length - 1)))] ?? ".";
        alphas[level] = 0.12 + 0.88 * v ** 0.85;
      }
      for (let y = 0; y < rows; y++) {
        const cy = (y + 0.5) * ch;
        for (let x = 0; x < cols; x++) {
          const level = Math.min(max, cells[y * cols + x] ?? 0);
          const glyph = glyphs[level];
          if (!glyph) continue;
          ctx.globalAlpha = alphas[level] ?? 1;
          ctx.fillText(glyph, (x + 0.5) * cw, cy);
        }
      }
      ctx.globalAlpha = 1;
      setDrawn(true);
    };
    if (document.fonts) {
      document.fonts.ready.then(draw);
    } else {
      draw();
    }
    return () => {
      cancelled = true;
    };
  }, [cells, width, aspect, cols, rows, levels, invert]);

  return (
    <div
      ref={wrapRef}
      className={cx("relative w-full", className)}
      style={{ aspectRatio: aspect }}
    >
      <div
        className={cx(
          "absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none",
          drawn ? "opacity-100" : "opacity-0",
        )}
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={label}
          className={cx(
            "pointer-events-none absolute inset-0 size-full font-mono transition-opacity duration-500 ease-out motion-reduce:transition-none",
            revealOnHover &&
              "group-hover:opacity-0 group-focus-within:opacity-0 group-data-[active=true]:opacity-0",
          )}
        />
      </div>
      {revealOnHover ? (
        // eslint-disable-next-line @next/next/no-img-element -- plain img: sources may be any URL; no next.config changes allowed
        <img
          src={src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute inset-0 size-full max-w-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-within:opacity-100 group-data-[active=true]:opacity-100 motion-reduce:transition-none"
        />
      ) : null}
    </div>
  );
}
