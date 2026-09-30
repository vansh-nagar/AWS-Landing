"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import { Geometry, Mesh, Program, Renderer, Texture } from "ogl";
import { cx } from "@/lib/cx";
import { CursorLabel, setupCursorTracking } from "@/components/hero/cursor-label";
import { usePrefersReducedMotion } from "@/components/hero/text-motion-hooks";

/*
 * Port of the original GlyphField (BenefitsSectionBackground in 02-features,
 * GlyphFieldBackdrop behind 04/05/07): a WebGL grid of mono glyphs that
 * spells the phrases row by row at ~6% opacity, with a slow per-cell
 * "twinkle" that scrambles a few glyphs at a time. Optionally a bright
 * "model" image (e.g. the pixel program icon) is drawn into the field, the
 * way the original draws its orb.
 *
 * Motion: rAF runs only while the field is on screen and the tab is visible;
 * under prefers-reduced-motion one static frame is rendered.
 */

/* ------------------------------------------------------------------------ */
/* Constants (from the original)                                            */
/* ------------------------------------------------------------------------ */

const BACKGROUND = "#232323";
const COLOR = "#ffffff";
const GLYPH_ASPECT = 0.55;
const CELL_HEIGHT = 14;
const ATLAS_COLS = 4;
const ATLAS_CELL_H = 64;
const BASE_ATLAS = " ·.ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+*#@";
const BACKGROUND_BRIGHTNESS = 0.01;
const MAX_RIPPLES = 16;
const RIPPLE_DURATION = 1.8;
const ENTRANCE_DONE_AFTER = 2.35;
const BACKDROP_MAX_FPS = 30;
const LG_QUERY = "(min-width: 64rem)";

const BASE_QUAD_POSITION = new Float32Array([
  -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
]);
const BASE_QUAD_UV = new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]);

/* ------------------------------------------------------------------------ */
/* Helpers                                                                   */
/* ------------------------------------------------------------------------ */

function getMonoFontCss(sizePx: number, weight = 400) {
  const family =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-mono")
      .trim() || "ui-monospace, monospace";
  return `${weight} ${Math.floor(sizePx)}px ${family}`;
}

function hexToRgb01(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Phrase string + glyph atlas (base atlas plus any extra chars used). */
function buildPhraseData(phrases: string[]) {
  const phrase = `${phrases
    .map((p) => p.trim().toUpperCase())
    .filter(Boolean)
    .join(" · ")} · `;
  let atlas = BASE_ATLAS;
  for (const ch of phrase) if (!atlas.includes(ch)) atlas += ch;
  const indices = Array.from(phrase).map((ch) => atlas.indexOf(ch));
  return { atlas, indices };
}

function buildAtlasCanvas(atlas: string, rows: number, cellW: number) {
  const canvas = document.createElement("canvas");
  canvas.width = ATLAS_COLS * cellW;
  canvas.height = ATLAS_CELL_H * rows;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = getMonoFontCss(47.36, 500);
  const chars = Array.from(atlas);
  for (let i = 0; i < chars.length; i++) {
    const x = ((i % ATLAS_COLS) + 0.5) * cellW;
    const y = (Math.floor(i / ATLAS_COLS) + 0.58) * ATLAS_CELL_H;
    ctx.fillText(chars[i] ?? " ", x, y);
  }
  return canvas;
}

/** 1-row RGBA data whose red channel holds the atlas index of each phrase char. */
function buildPhraseData8(indices: number[]) {
  const data = new Uint8Array(Math.max(1, indices.length) * 4);
  for (let i = 0; i < indices.length; i++) {
    const v = indices[i] ?? 0;
    data[4 * i] = v;
    data[4 * i + 3] = 255;
  }
  return data;
}

/** Brightness map from an image's alpha (shape) scaled by `brightness`. */
function buildBrightnessCanvas(
  image: HTMLImageElement | null,
  brightness: number,
) {
  const canvas = document.createElement("canvas");
  const aspect =
    image && image.naturalWidth && image.naturalHeight
      ? image.naturalWidth / image.naturalHeight
      : 1;
  canvas.width = 256;
  canvas.height = Math.max(1, Math.round(256 / aspect));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return {
      data: new Uint8Array(canvas.width * canvas.height * 4),
      width: canvas.width,
      height: canvas.height,
      aspect,
    };
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (image) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  }
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < data.data.length; i += 4) {
    const a = ((data.data[i + 3] ?? 0) / 255) * brightness * 255;
    data.data[i] = a;
    data.data[i + 1] = a;
    data.data[i + 2] = a;
    data.data[i + 3] = 255;
  }
  return {
    data: new Uint8Array(data.data.buffer.slice(0)),
    width: canvas.width,
    height: canvas.height,
    aspect,
  };
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/* ------------------------------------------------------------------------ */
/* Shaders (ported from GlyphFieldScene)                                    */
/* ------------------------------------------------------------------------ */

const FRAGMENT = /* glsl */ `#version 300 es
precision mediump float;

uniform sampler2D tAtlas;
uniform vec3 uColor;

in vec2 vUv;
in float vOpacity;

out vec4 fragColor;

void main() {
  vec4 sampled = texture(tAtlas, vUv);
  fragColor = vec4(uColor, sampled.a * vOpacity);
}
`;

const VERTEX = /* glsl */ `#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 position;
in vec2 uv;

uniform vec2 uGridSize;
uniform vec2 uAtlasGrid;
uniform float uTime;

// Phrase mapping: cell at linear position i renders phrase[i % uPhraseLen].
uniform sampler2D tPhrase;
uniform float uPhraseLen;

uniform vec2 uModelStart;
uniform vec2 uModelSize;
uniform float uBackgroundBrightness;
uniform float uBackgroundTwinkle;
uniform float uHasModel;
uniform sampler2D tSourceBrightness;

uniform vec2 uEntranceCenter;
uniform float uEntranceStart;

uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform float uMouseRadius;
uniform float uRippleMaxRadius;
uniform float uRippleWidth;
uniform float uRippleStarts[16];
uniform vec2 uRippleCenters[16];
uniform float uActiveRippleCount;

const float RIPPLE_DURATION_S = 1.8000;
const float ENTRANCE_FADE_S = 0.5000;
const float GLYPH_ASPECT_S = ${GLYPH_ASPECT.toFixed(4)};
const float GENTLE_FLIP_OSC_HZ_S = 0.1800;
const float GENTLE_FLIP_THRESHOLD_S = 0.9850;
const float GENTLE_FLIP_SCRAMBLE_HZ_S = 2.5000;

out vec2 vUv;
out float vOpacity;

float screenDist(vec2 cellOffset) {
  cellOffset.y /= GLYPH_ASPECT_S;
  return length(cellOffset);
}

float cellHash(vec2 cell) {
  return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
}

float hash1D(float x) {
  return fract(sin(x * 12.9898) * 43758.5453);
}

float pickRandomGlyph(float seed, float numGlyphs) {
  return 1.0 + floor(hash1D(seed) * (numGlyphs - 1.0));
}

void main() {
  int instanceID = gl_InstanceID;
  int cols = int(uGridSize.x);
  vec2 cell = vec2(float(instanceID % cols), float(instanceID / cols));

  vec2 modelOffset = cell - uModelStart;
  bool inModel = uHasModel > 0.5
              && modelOffset.x >= 0.0 && modelOffset.x < uModelSize.x
              && modelOffset.y >= 0.0 && modelOffset.y < uModelSize.y;

  int activeRippleCount = int(uActiveRippleCount);
  float rippleInfluence = 0.0;
  for (int r = 0; r < 16; r++) {
    if (r >= activeRippleCount) break;
    float start = uRippleStarts[r];
    float elapsed = uTime - start;
    if (elapsed < 0.0 || elapsed >= RIPPLE_DURATION_S) continue;
    float t = elapsed / RIPPLE_DURATION_S;
    float waveRadius = smoothstep(0.0, 1.0, t) * uRippleMaxRadius;
    float distToCenter = screenDist(cell - uRippleCenters[r]);
    float bell = 1.0 - smoothstep(0.0, uRippleWidth * 0.5, abs(distToCenter - waveRadius));
    float lifeFade = smoothstep(0.0, 0.22, t) * (1.0 - smoothstep(0.78, 1.0, t));
    rippleInfluence = max(rippleInfluence, bell * lifeFade);
  }

  float mouseDist = screenDist(cell - uMouse);
  float hoverInfluence = (1.0 - smoothstep(0.0, uMouseRadius, mouseDist)) * uMouseInfluence;
  float threshold = cellHash(cell);
  float dimMask = step(threshold, hoverInfluence * 2.5) * step(0.001, hoverInfluence);
  float boostMask = step(threshold, rippleInfluence * 0.5) * step(0.001, rippleInfluence);

  // Each row reads the phrase from a hashed offset, so identical claims don't stack in diagonal bands.
  float rowPhraseOffset = floor(hash1D(cell.y + 0.5) * uPhraseLen);
  int phraseIdx = int(mod(cell.x + rowPhraseOffset, uPhraseLen));
  float baseCharIdx = floor(texelFetch(tPhrase, ivec2(phraseIdx, 0), 0).r * 255.0 + 0.5);
  float numAtlasGlyphs = uAtlasGrid.x * uAtlasGrid.y;

  float flipPhase = uTime * GENTLE_FLIP_OSC_HZ_S + threshold * 6.2831853;
  float flipActive = step(GENTLE_FLIP_THRESHOLD_S, sin(flipPhase) * 0.5 + 0.5) * max(float(inModel), uBackgroundTwinkle);
  float flipFrame = floor(uTime * GENTLE_FLIP_SCRAMBLE_HZ_S);
  float flipChar = pickRandomGlyph(threshold * 17.13 + flipFrame * 1.7, numAtlasGlyphs);
  float charIdx = mix(baseCharIdx, flipChar, flipActive);

  float scrambleFrame = floor(uTime * 24.0);
  float scrambleChar = pickRandomGlyph(threshold * 7.13 + scrambleFrame, numAtlasGlyphs);
  charIdx = mix(charIdx, scrambleChar, boostMask);
  charIdx = clamp(charIdx, 0.0, numAtlasGlyphs - 1.0);

  float atlasCol = mod(charIdx, uAtlasGrid.x);
  float atlasRow = floor(charIdx / uAtlasGrid.x);
  vUv = vec2((atlasCol + uv.x) / uAtlasGrid.x, (atlasRow + (1.0 - uv.y)) / uAtlasGrid.y);

  float brightness = uBackgroundBrightness;
  if (inModel) {
    vec2 modelUV = (modelOffset + 0.5) / uModelSize;
    brightness = max(uBackgroundBrightness, texture(tSourceBrightness, modelUV).r);
  }

  float baseOpacity = pow(brightness, 0.6);
  float effectiveOpacity = baseOpacity * (1.0 - hoverInfluence);
  effectiveOpacity = mix(effectiveOpacity, 0.0, dimMask);
  effectiveOpacity = mix(effectiveOpacity, 1.0, boostMask);

  float entranceAlpha = 1.0;
  if (uEntranceStart > -1e8) {
    float arrivalDist = screenDist(cell - uEntranceCenter);
    float arrivalFrac = clamp((arrivalDist - uRippleWidth * 0.5) / uRippleMaxRadius, 0.0, 1.0);
    float invSmoothArg = clamp(1.0 - 2.0 * arrivalFrac, -1.0, 1.0);
    float arrival = (0.5 - sin(asin(invSmoothArg) / 3.0)) * RIPPLE_DURATION_S;
    entranceAlpha = clamp((uTime - uEntranceStart - arrival) / ENTRANCE_FADE_S, 0.0, 1.0);
  }
  vOpacity = effectiveOpacity * entranceAlpha;

  vec2 cellSize = 2.0 / uGridSize;
  vec2 cellCenter = -1.0 + (cell + 0.5) * cellSize;
  cellCenter.y = -cellCenter.y;
  vec2 worldPos = cellCenter + position * cellSize;

  gl_Position = vec4(worldPos, 0.0, 1.0);
}
`;

/* ------------------------------------------------------------------------ */
/* Component                                                                 */
/* ------------------------------------------------------------------------ */

export type AsciiBackgroundModel = {
  /** Image whose alpha becomes the bright glyph figure (e.g. a brand SVG). */
  src: string;
  /**
   * "right" (vertically centred at the right edge), "bottom" (centred), or
   * "auto" (default, the original BenefitsSectionBackground): right at 55%
   * width from lg up, bottom at full width below.
   */
  layout?: "right" | "bottom" | "auto";
  /** Max model width as a fraction of the field width (0.05–1). Ignored for "auto". */
  maxWidth?: number;
  /** Peak brightness of the figure (0–1). Default 0.9. */
  brightness?: number;
};

export type AsciiBackgroundProps = {
  /** Phrases spelled across the field (uppercased, joined with " · "). */
  phrases: string[];
  className?: string;
  /** Optional bright figure drawn into the field (02-features' orb). */
  model?: AsciiBackgroundModel;
  /**
   * Hover dims glyphs around the cursor, click sends a ripple (02-features).
   * Default false (the non-interactive backdrop of 04/05/07). The field then
   * needs pointer events, so put `pointer-events-none` on the section content
   * and `pointer-events-auto` on its interactive children.
   */
  interactive?: boolean;
  /** Pin the field to the viewport while the section scrolls (lg+). */
  sticky?: boolean;
};

/**
 * Drifting ASCII text field for dark sections. Render it as the first child
 * of a `relative isolate` section; it fills the section behind the content
 * (`absolute inset-0 -z-1`) with the #232323 base plus the black-deep/30 veil.
 */
export function AsciiBackground({
  phrases,
  className,
  model,
  interactive = false,
  sticky = false,
}: AsciiBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      style={{ backgroundColor: BACKGROUND }}
      className={cx(
        "absolute inset-0 -z-1",
        !interactive && "pointer-events-none",
        className,
      )}
    >
      <div className={cx("size-full", sticky && "lg:sticky lg:top-0 lg:h-svh")}>
        <GlyphField
          phrases={phrases}
          model={model}
          interactive={interactive}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black-deep/30"
      />
    </div>
  );
}

function GlyphField({
  phrases,
  model,
  interactive,
}: {
  phrases: string[];
  model?: AsciiBackgroundModel;
  interactive: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const reduced = usePrefersReducedMotion();

  const phraseKey = phrases.join("\u0000");
  const modelSrc = model?.src;
  const modelLayout = model?.layout ?? "auto";
  const modelMaxWidth = model?.maxWidth ?? 1;
  const modelBrightness = model?.brightness ?? 0.9;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const abort = new AbortController();
    const { signal } = abort;
    let teardown: (() => void) | null = null;

    // DeferredMount: only build the WebGL scene once the field is within
    // 400px of the viewport.
    const mountObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        mountObserver.disconnect();
        const imagePromise = modelSrc
          ? loadImage(modelSrc)
          : Promise.resolve(null);
        imagePromise.then((image) => {
          if (signal.aborted) return;
          teardown = mountScene({
            container,
            signal,
            phrases: phraseKey.split("\u0000"),
            image,
            hasModel: Boolean(modelSrc),
            modelLayout,
            modelMaxWidth,
            modelBrightness,
            interactive,
            labelRef,
            setIsHovering,
          });
        });
      },
      { rootMargin: "400px" },
    );
    mountObserver.observe(container);

    return () => {
      abort.abort();
      mountObserver.disconnect();
      teardown?.();
    };
  }, [
    phraseKey,
    modelSrc,
    modelLayout,
    modelMaxWidth,
    modelBrightness,
    interactive,
  ]);

  return (
    <div
      ref={containerRef}
      style={{ backgroundColor: BACKGROUND }}
      className={cx(
        "relative size-full overflow-hidden",
        interactive && !reduced && "cursor-pointer",
      )}
    >
      {interactive ? (
        <CursorLabel labelRef={labelRef} isHovering={isHovering} />
      ) : null}
    </div>
  );
}

type MountOptions = {
  container: HTMLDivElement;
  signal: AbortSignal;
  phrases: string[];
  image: HTMLImageElement | null;
  hasModel: boolean;
  modelLayout: "right" | "bottom" | "auto";
  modelMaxWidth: number;
  modelBrightness: number;
  interactive: boolean;
  labelRef: RefObject<HTMLDivElement | null>;
  setIsHovering: (hovering: boolean) => void;
};

type Ripple = { start: number; centerX: number; centerY: number };

function mountScene({
  container,
  signal,
  phrases,
  image,
  hasModel,
  modelLayout,
  modelMaxWidth,
  modelBrightness,
  interactive,
  labelRef,
  setIsHovering,
}: MountOptions): () => void {
  const backgroundOnly = !hasModel;
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const maxFps = backgroundOnly ? BACKDROP_MAX_FPS : 0;
  // Entrance ripple only for the featured (model) variant, like the original.
  const entrance = hasModel && !reducedQuery.matches;

  const { atlas, indices } = buildPhraseData(phrases);
  const atlasRows = Math.ceil(atlas.length / ATLAS_COLS);
  const atlasCellW = Math.max(8, Math.round(ATLAS_CELL_H * GLYPH_ASPECT));
  const brightness = buildBrightnessCanvas(image, modelBrightness);
  const sourceAspect = brightness.aspect;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let renderer: Renderer;
  try {
    renderer = new Renderer({
      webgl: 2,
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      dpr,
      powerPreference: "high-performance",
    });
  } catch {
    return () => {};
  }
  const gl = renderer.gl;
  if (!gl) return () => {};
  const [bgR, bgG, bgB] = hexToRgb01(BACKGROUND);
  gl.clearColor(bgR, bgG, bgB, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const canvas = gl.canvas;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  for (const child of Array.from(container.children)) {
    if (child instanceof HTMLCanvasElement) container.removeChild(child);
  }
  container.appendChild(canvas);

  const atlasTexture = new Texture(gl, {
    image: buildAtlasCanvas(atlas, atlasRows, atlasCellW),
    generateMipmaps: true,
    premultiplyAlpha: false,
    flipY: false,
  });
  const phraseTexture = new Texture(gl, {
    image: buildPhraseData8(indices),
    width: Math.max(1, indices.length),
    height: 1,
    generateMipmaps: false,
    premultiplyAlpha: false,
    flipY: false,
    minFilter: gl.NEAREST,
    magFilter: gl.NEAREST,
    wrapS: gl.CLAMP_TO_EDGE,
    wrapT: gl.CLAMP_TO_EDGE,
  });
  const brightnessTexture = new Texture(gl, {
    image: brightness.data,
    width: brightness.width,
    height: brightness.height,
    generateMipmaps: false,
    premultiplyAlpha: false,
    flipY: false,
    minFilter: gl.NEAREST,
    magFilter: gl.NEAREST,
    wrapS: gl.CLAMP_TO_EDGE,
    wrapT: gl.CLAMP_TO_EDGE,
  });

  const geometry = new Geometry(gl, {
    position: { size: 2, data: BASE_QUAD_POSITION },
    uv: { size: 2, data: BASE_QUAD_UV },
    aInstance: { instanced: 1, size: 1, data: new Float32Array(1) },
  });

  const program = new Program(gl, {
    vertex: VERTEX,
    fragment: FRAGMENT,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    cullFace: false,
    uniforms: {
      tAtlas: { value: atlasTexture },
      tPhrase: { value: phraseTexture },
      uPhraseLen: { value: indices.length },
      uColor: { value: new Float32Array(hexToRgb01(COLOR)) },
      tSourceBrightness: { value: brightnessTexture },
      uHasModel: { value: hasModel ? 1 : 0 },
      uGridSize: { value: new Float32Array([1, 1]) },
      uAtlasGrid: { value: new Float32Array([ATLAS_COLS, atlasRows]) },
      uModelStart: { value: new Float32Array([0, 0]) },
      uModelSize: { value: new Float32Array([1, 1]) },
      uEntranceCenter: { value: new Float32Array([0, 0]) },
      uEntranceStart: { value: entrance ? 1e9 : -1e9 },
      uBackgroundBrightness: { value: BACKGROUND_BRIGHTNESS },
      uBackgroundTwinkle: { value: backgroundOnly ? 1 : 0 },
      uTime: { value: 0 },
      uMouse: { value: new Float32Array([-999, -999]) },
      uMouseInfluence: { value: 0 },
      uMouseRadius: { value: 1 },
      uRippleMaxRadius: { value: 1 },
      uRippleWidth: { value: 1 },
      uRippleStarts: { value: new Array<number>(MAX_RIPPLES).fill(-1) },
      uRippleCenters: {
        value: Array.from({ length: MAX_RIPPLES }, () => [0, 0]),
      },
      uActiveRippleCount: { value: 0 },
    },
  });

  const mesh = new Mesh(gl, { geometry, program, frustumCulled: false });

  const loseContext = () => {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };

  if (!program.uniformLocations) {
    console.error("[AsciiBackground] shader failed to compile/link", {
      vsLog: gl.getShaderInfoLog(program.vertexShader),
      fsLog: gl.getShaderInfoLog(program.fragmentShader),
      linkLog: gl.getProgramInfoLog(program.program),
    });
    try {
      container.removeChild(canvas);
    } catch {}
    loseContext();
    return () => {};
  }

  type U<T> = { value: T };
  const u = program.uniforms as Record<string, U<unknown>>;
  const uTime = u.uTime as U<number>;
  const uGridSize = u.uGridSize as U<Float32Array>;
  const uModelStart = u.uModelStart as U<Float32Array>;
  const uModelSize = u.uModelSize as U<Float32Array>;
  const uEntranceCenter = u.uEntranceCenter as U<Float32Array>;
  const uEntranceStart = u.uEntranceStart as U<number>;
  const uMouseRadius = u.uMouseRadius as U<number>;
  const uRippleMaxRadius = u.uRippleMaxRadius as U<number>;
  const uRippleWidth = u.uRippleWidth as U<number>;
  const uMouse = u.uMouse as U<Float32Array>;
  const uMouseInfluence = u.uMouseInfluence as U<number>;
  const uRippleStarts = u.uRippleStarts as U<number[]>;
  const uRippleCenters = u.uRippleCenters as U<number[][]>;
  const uActiveRippleCount = u.uActiveRippleCount as U<number>;

  // Grid state (cell sizes in CSS px).
  let cellW = 1;
  let cellH = 1;
  let cols = 1;
  let rows = 1;
  let lastW = 0;
  let lastH = 0;

  /** Returns true when the drawing buffer changed size. */
  const layout = (extraRows = 0) => {
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    cellH = CELL_HEIGHT;
    cellW = cellH * GLYPH_ASPECT;
    cols = Math.max(8, Math.round(width / cellW));
    cellW = width / cols;
    let bufferH: number;
    if (backgroundOnly) {
      // Rows snap up in blocks of 16 so small height changes (mobile URL bar)
      // don't re-flow the whole field.
      const needed = Math.max(8, Math.ceil(height / cellH));
      if (needed > rows || rows - needed > 32) {
        rows = 16 * Math.ceil((needed + extraRows) / 16);
      }
      bufferH = rows * cellH;
    } else {
      rows = Math.max(8, Math.round(height / cellH));
      cellH = height / rows;
      bufferH = Math.max(1, Math.floor(height));
    }
    const w = Math.max(1, Math.floor(width));
    const changed = w !== lastW || bufferH !== lastH;
    if (changed) {
      lastW = w;
      lastH = bufferH;
      renderer.setSize(w, bufferH);
      // Keep the canvas at its buffer height so the field never stretches.
      canvas.style.height = `${bufferH}px`;
    }

    let mx = 0;
    let my = 0;
    let mw = 0;
    let mh = 0;
    if (hasModel) {
      const isLg =
        modelLayout === "auto" && window.matchMedia(LG_QUERY).matches;
      const placement =
        modelLayout === "auto" ? (isLg ? "right" : "bottom") : modelLayout;
      const maxWidth =
        modelLayout === "auto" ? (isLg ? 0.55 : 1) : modelMaxWidth;
      const cellAspect = sourceAspect / GLYPH_ASPECT;
      const maxCols = cols * Math.min(1, Math.max(0.05, maxWidth));
      const fitRows = Math.min(rows, maxCols / cellAspect);
      mh = Math.max(1, Math.round(fitRows));
      mw = Math.max(1, Math.min(cols, Math.round(fitRows * cellAspect)));
      if (placement === "bottom") {
        mx = Math.round((cols - mw) / 2);
        my = rows - mh;
      } else {
        mx = cols - mw;
        my = Math.round((rows - mh) / 2);
      }
    }
    uGridSize.value[0] = cols;
    uGridSize.value[1] = rows;
    uModelStart.value[0] = mx;
    uModelStart.value[1] = my;
    uModelSize.value[0] = mw;
    uModelSize.value[1] = mh;
    uEntranceCenter.value[0] = backgroundOnly ? cols / 2 : mx + mw / 2;
    uEntranceCenter.value[1] = backgroundOnly
      ? Math.min(rows, height / cellH) / 2
      : my + mh / 2;
    const half = cols / 2;
    uMouseRadius.value = 0.35 * half;
    uRippleMaxRadius.value = 1.6 * half;
    uRippleWidth.value = 0.85 * half;
    geometry.setInstancedCount(cols * rows);
    return changed;
  };
  layout();

  let raf = 0;
  let inView = true;
  let pageVisible = !document.hidden;
  let motionAllowed = !reducedQuery.matches;
  let lastFrame = performance.now();
  let simTime = 0;
  const ripples: Ripple[] = [];
  let mouseTarget = 0;
  const mouseGoal = new Float32Array([-999, -999]);
  let lastRender = -Infinity;
  let entranceTriggered = !entrance;

  const render = () => {
    uTime.value = simTime;
    renderer.render({ scene: mesh, update: false, sort: false, frustumCull: false });
  };

  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - lastFrame) * 0.001);
    lastFrame = now;
    if (motionAllowed) simTime += dt;
    while (ripples[0] && simTime - ripples[0].start >= RIPPLE_DURATION) {
      ripples.shift();
    }
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const center = uRippleCenters.value[i];
      if (!center) continue;
      const r = ripples[i];
      uRippleStarts.value[i] = r ? r.start : -1;
      center[0] = r?.centerX ?? 0;
      center[1] = r?.centerY ?? 0;
    }
    uActiveRippleCount.value = ripples.length;

    const es = uEntranceStart.value;
    const entranceRunning = es > -1e8 && es < 1e8;
    if (entranceRunning && simTime - es > ENTRANCE_DONE_AFTER) {
      uEntranceStart.value = -1e9;
    }

    const kInfluence = 1 - Math.exp(-6 * dt);
    uMouseInfluence.value += (mouseTarget - uMouseInfluence.value) * kInfluence;
    const kMouse = 1 - Math.exp(-14 * dt);
    uMouse.value[0] += (mouseGoal[0]! - uMouse.value[0]!) * kMouse;
    uMouse.value[1] += (mouseGoal[1]! - uMouse.value[1]!) * kMouse;

    const busy =
      ripples.length > 0 || uMouseInfluence.value > 0.001 || entranceRunning;
    if (!maxFps || busy || now - lastRender >= 1000 / maxFps) {
      lastRender = now;
      render();
    }
    raf = inView && pageVisible && motionAllowed ? requestAnimationFrame(tick) : 0;
  };

  const stop = () => {
    if (raf !== 0) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const sync = () => {
    if (inView && pageVisible && motionAllowed) {
      if (raf === 0) {
        lastFrame = performance.now();
        raf = requestAnimationFrame(tick);
      }
    } else {
      stop();
      render();
    }
  };

  const startEntrance = () => {
    if (entranceTriggered) return;
    entranceTriggered = true;
    uEntranceStart.value = simTime;
    ripples.push({
      start: simTime,
      centerX: uEntranceCenter.value[0]!,
      centerY: uEntranceCenter.value[1]!,
    });
  };

  let pendingResize = false;
  let resizeTimer: number | null = null;
  let resizeTrailing = false;
  const relayout = (extraRows = 0) => {
    if (layout(extraRows) || raf === 0) render();
  };

  const resizeObserver = new ResizeObserver(() => {
    if (!inView) {
      pendingResize = true;
      return;
    }
    if (resizeTimer === null) {
      relayout(16);
    } else {
      window.clearTimeout(resizeTimer);
      resizeTrailing = true;
    }
    resizeTimer = window.setTimeout(() => {
      resizeTimer = null;
      if (resizeTrailing) {
        resizeTrailing = false;
        relayout();
      }
    }, 150);
  });
  resizeObserver.observe(container);

  const viewObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) return;
      inView = entry.isIntersecting;
      if (inView && pendingResize) {
        pendingResize = false;
        relayout();
      }
      sync();
    },
    { threshold: 0 },
  );
  viewObserver.observe(container);

  // Entrance ripple fires when ~10% of the field is on screen (the original's
  // viewport gate), or is skipped outright under reduced motion.
  let entranceObserver: IntersectionObserver | null = null;
  if (!entranceTriggered) {
    entranceObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          entranceObserver?.disconnect();
          startEntrance();
          sync();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    entranceObserver.observe(container);
  }

  document.addEventListener(
    "visibilitychange",
    () => {
      pageVisible = !document.hidden;
      sync();
    },
    { signal },
  );
  reducedQuery.addEventListener(
    "change",
    () => {
      motionAllowed = !reducedQuery.matches;
      if (!motionAllowed) {
        // Snap to the finished state.
        uEntranceStart.value = -1e9;
        ripples.length = 0;
      }
      sync();
    },
    { signal },
  );

  if (interactive) {
    setupCursorTracking({
      container,
      signal,
      labelRef,
      setIsHovering,
      onPointerMove: (x, y) => {
        mouseGoal[0] = x / cellW;
        mouseGoal[1] = y / cellH;
      },
      onPointerEnter: (x, y) => {
        mouseGoal[0] = x / cellW;
        mouseGoal[1] = y / cellH;
        uMouse.value[0] = mouseGoal[0];
        uMouse.value[1] = mouseGoal[1];
        mouseTarget = motionAllowed ? 1 : 0;
        sync();
      },
      onPointerLeave: () => {
        mouseTarget = 0;
      },
      onClick: (x, y) => {
        if (!motionAllowed) return;
        ripples.push({ start: simTime, centerX: x / cellW, centerY: y / cellH });
        while (ripples.length > MAX_RIPPLES) ripples.shift();
        sync();
      },
    });
  }

  // Re-render the atlas once the mono font has loaded.
  document.fonts.ready.then(() => {
    if (signal.aborted) return;
    atlasTexture.image = buildAtlasCanvas(atlas, atlasRows, atlasCellW);
    atlasTexture.needsUpdate = true;
    render();
  });

  render();
  sync();

  return () => {
    stop();
    resizeObserver.disconnect();
    viewObserver.disconnect();
    entranceObserver?.disconnect();
    if (resizeTimer !== null) window.clearTimeout(resizeTimer);
    try {
      container.removeChild(canvas);
    } catch {}
    loseContext();
  };
}
