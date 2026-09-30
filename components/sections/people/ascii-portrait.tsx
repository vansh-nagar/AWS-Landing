"use client";

import { useEffect, useRef, useState } from "react";

import { cx } from "@/lib/cx";

/*
 * Port of the reference site's AsciiImage (04-showcase), plus a client-side
 * sampler that turns a photo, or a generated placeholder, into the `cells`
 * string the original received pre-computed from the server.
 *
 * `cells` format (same as the original): one char per cell, row-major,
 * charCode - 33 = brightness level (0 = darkest, levels - 1 = brightest).
 */

const RAMP = ".:-=+*#%@";
/** rows = cols / aspect * CELL_RATIO — the original's 120 x 37 at 16:9. */
const CELL_RATIO = 37 / (120 / (16 / 9));
/** The pixel chip of the program icon (public/brand/program-icon/*.svg), 3000x3000. */
const PROGRAM_ICON_PATH =
  "M2333.33 3000H2000V2666.67H1666.67V3000H1333.33V2666.67H1000V3000H666.667V2333.33H2333.33V3000ZM666.667 2333.33H0V2000H333.333V1666.67H0V1333.33H333.333V1000H0V666.667H666.667V2333.33ZM3000 1000H2666.67V1333.33H3000V1666.67H2666.67V2000H3000V2333.33H2333.33V666.667H3000V1000ZM1000 333.333H1333.33V0H1666.67V333.333H2000V0H2333.33V666.667H666.667V0H1000V333.333Z";

function monoFontCss(size: number, weight = 400) {
  const family =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-mono")
      .trim() || "ui-monospace, monospace";
  return `${weight} ${Math.floor(size)}px ${family}`;
}

/** Luminance (0..1) of the first ancestor with a visible background. */
function backgroundLuminance(el: Element | null): number {
  for (let node = el; node; node = node.parentElement) {
    const match = /rgba?\(([^)]+)\)/.exec(getComputedStyle(node).backgroundColor);
    if (!match?.[1]) continue;
    const [r, g, b, a = 1] = match[1].split(",").map((v) => Number.parseFloat(v));
    if (r === undefined || g === undefined || b === undefined) continue;
    if ([r, g, b].some(Number.isNaN) || a <= 0) continue;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }
  return 1;
}

/** Small deterministic PRNG so a placeholder's grain is stable per label. */
function seeded(seedText: string) {
  let h = 2166136261;
  for (const ch of seedText) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/** Draws the placeholder "portrait": initials, or the program icon, on a soft glow. */
function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  initials: string | undefined,
) {
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, Math.max(w, h) * 0.75);
  glow.addColorStop(0, "#484848");
  glow.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const fill = ctx.createLinearGradient(0, h * 0.2, w, h * 0.85);
  fill.addColorStop(0, "#ffffff");
  fill.addColorStop(1, "#8a8a8a");
  ctx.fillStyle = fill;

  if (initials) {
    const size = Math.min(h * 0.5, (w * 0.8) / Math.max(1, initials.length * 0.62));
    ctx.font = `600 ${Math.floor(size)}px ${getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim() || "sans-serif"}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, w * 0.5, h * 0.54);
    return;
  }

  const size = Math.min(w, h) * 0.46;
  ctx.save();
  ctx.translate((w - size) / 2, (h - size) / 2);
  ctx.scale(size / 3000, size / 3000);
  ctx.fill(new Path2D(PROGRAM_ICON_PATH));
  ctx.restore();
}

/** Samples a source into cols x rows brightness levels, encoded as `cells`. */
function sampleCells(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  aspect: number,
  cols: number,
  rows: number,
  levels: number,
  seed: string,
  grain: number,
): string {
  // Render the source at its true aspect, then squash it onto the cell grid.
  const srcW = 480;
  const srcH = Math.round(srcW / aspect);
  const src = document.createElement("canvas");
  src.width = srcW;
  src.height = srcH;
  const sctx = src.getContext("2d");
  const grid = document.createElement("canvas");
  grid.width = cols;
  grid.height = rows;
  const gctx = grid.getContext("2d", { willReadFrequently: true });
  if (!sctx || !gctx) return "";
  draw(sctx, srcW, srcH);
  gctx.imageSmoothingQuality = "high";
  gctx.drawImage(src, 0, 0, cols, rows);
  const { data } = gctx.getImageData(0, 0, cols, rows);

  const lum = new Float32Array(cols * rows);
  let min = 1;
  let max = 0;
  for (let i = 0; i < lum.length; i++) {
    const r = data[i * 4] ?? 0;
    const g = data[i * 4 + 1] ?? 0;
    const b = data[i * 4 + 2] ?? 0;
    const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    lum[i] = l;
    if (l < min) min = l;
    if (l > max) max = l;
  }
  const range = Math.max(0.001, max - min);
  const rand = seeded(seed);
  let cells = "";
  for (let i = 0; i < lum.length; i++) {
    const n = ((lum[i] ?? 0) - min) / range + (rand() - 0.5) * grain;
    const level = Math.round(Math.min(1, Math.max(0, n)) * (levels - 1));
    cells += String.fromCharCode(33 + level);
  }
  return cells;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCover(img: HTMLImageElement) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.filter = "grayscale(1) contrast(1.1)";
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  };
}

export type AsciiPortraitProps = {
  /** Accessible label (the person's name). */
  label: string;
  /** Same-origin photo. Omit for the generated placeholder. */
  src?: string;
  /** Placeholder: initials to draw. Without them, the program icon is drawn. */
  initials?: string;
  /** Width / height. */
  aspect?: number;
  cols?: number;
  levels?: number;
  /** Fade the ASCII out on hover to show the photo (only with `src`). */
  revealOnHover?: boolean;
  className?: string;
};

/**
 * ASCII / dithered portrait. The canvas fades in once drawn, redraws on
 * resize (debounced 100ms) and only draws within 400px of the viewport.
 */
export function AsciiPortrait({
  label,
  src,
  initials,
  aspect = 1,
  cols = 72,
  levels = 64,
  revealOnHover = true,
  className,
}: AsciiPortraitProps) {
  const rows = Math.max(1, Math.round((cols / aspect) * CELL_RATIO));
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawnKey = useRef("");
  const [width, setWidth] = useState(0);
  const [near, setNear] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [cells, setCells] = useState("");
  const [drawn, setDrawn] = useState(false);

  // Debounced element width (the original's useElementSize + 100ms debounce).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(([entry]) => {
      const next = entry?.contentRect.width ?? 0;
      clearTimeout(timer);
      timer = setTimeout(() => setWidth(next), 100);
    });
    ro.observe(el);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setNear(entry?.isIntersecting ?? false),
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Source -> cells.
  useEffect(() => {
    if (!fontsReady) return;
    let cancelled = false;
    const seed = `${label}:${cols}x${rows}`;
    const placeholder = () =>
      sampleCells((c, w, h) => drawPlaceholder(c, w, h, initials), aspect, cols, rows, levels, seed, 0.06);
    // A missing/broken photo falls back to the placeholder.
    const job = src
      ? loadImage(src).then(
          (img) => sampleCells(drawCover(img), aspect, cols, rows, levels, seed, 0.04),
          placeholder,
        )
      : Promise.resolve().then(placeholder);
    job.then((next) => {
      if (!cancelled) setCells(next);
    });
    return () => {
      cancelled = true;
    };
  }, [src, initials, label, aspect, cols, rows, levels, fontsReady]);

  // Cells -> canvas (straight port of the original draw loop).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || !fontsReady || !cells || !near) return;
    const key = `${width}:${levels}:${cols}:${rows}:${aspect}:${cells}`;
    if (drawnKey.current === key) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(width * dpr));
    const h = Math.max(1, Math.round((width / aspect) * dpr));
    canvas.width = w;
    canvas.height = h;
    const cellW = w / cols;
    const cellH = h / rows;
    const onDark = backgroundLuminance(canvas) < 0.5;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = getComputedStyle(canvas).color || (onDark ? "#fff" : "#000");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = monoFontCss(cellH);
    const mWidth = ctx.measureText("M").width || cellH * 0.6;
    ctx.font = monoFontCss((cellW / mWidth) * cellH);
    const top = levels - 1;
    const glyphs: string[] = new Array(levels);
    const alphas = new Float32Array(levels);
    for (let i = 0; i <= top; i++) {
      const t = i / top;
      const v = onDark ? t : 1 - t;
      glyphs[i] = RAMP[Math.min(RAMP.length - 1, Math.round(v * (RAMP.length - 1)))] ?? RAMP[0] ?? "";
      alphas[i] = 0.12 + 0.88 * v ** 0.85;
    }
    for (let r = 0; r < rows; r++) {
      const y = (r + 0.5) * cellH;
      for (let c = 0; c < cols; c++) {
        const level = Math.min(top, Math.max(0, cells.charCodeAt(r * cols + c) - 33));
        const glyph = glyphs[level];
        if (!glyph) continue;
        ctx.globalAlpha = alphas[level] ?? 1;
        ctx.fillText(glyph, (c + 0.5) * cellW, y);
      }
    }
    ctx.globalAlpha = 1;
    drawnKey.current = key;
    setDrawn(true);
  }, [width, fontsReady, cells, near, levels, cols, rows, aspect]);

  const reveal = Boolean(src) && revealOnHover;

  return (
    <div className={cx("relative w-full", className)} style={{ aspectRatio: aspect }}>
      <div
        ref={rootRef}
        className={cx(
          "absolute inset-0 w-full transition-opacity duration-500 ease-out motion-reduce:transition-none",
          drawn ? "opacity-100" : "opacity-0",
        )}
        style={{ aspectRatio: aspect }}
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={label}
          className={cx(
            "pointer-events-none absolute inset-0 size-full transition-opacity duration-500 ease-out motion-reduce:transition-none",
            reveal && "group-hover:opacity-0 group-focus-within:opacity-0",
          )}
        />
      </div>
      {src && reveal ? (
        // eslint-disable-next-line @next/next/no-img-element -- mirrors the original's hover-revealed picture
        <img
          src={src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute inset-0 size-full max-w-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
        />
      ) : null}
    </div>
  );
}
