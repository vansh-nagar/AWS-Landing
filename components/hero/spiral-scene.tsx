"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Geometry, Mesh, Program, Renderer, Texture } from "ogl";
import { cx } from "@/lib/cx";
import { CursorLabel, setupCursorTracking } from "./cursor-label";
import { useIsTouchDevice } from "./use-media-query";

/* -------------------------------------------------------------------------- */
/* Math helpers (ported from the original spiral utils module)                */
/* -------------------------------------------------------------------------- */

const BASE_QUAD_POSITION = new Float32Array([
  -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
]);
const BASE_QUAD_UV = new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]);

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

/** Cubic smoothstep; edges may be reversed (edge0 > edge1) for a falling ramp. */
function smoothstep01(edge0: number, edge1: number, x: number) {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Inverse of smoothstep on [0, 1], solved with 6 Newton steps. */
function smoothstepInverse(y: number) {
  if (y <= 0) return 0;
  if (y >= 1) return 1;
  let t = y;
  for (let i = 0; i < 6; i++) {
    const t2 = t * t;
    const f = 3 * t2 - 2 * t2 * t - y;
    const df = 6 * t - 6 * t2;
    if (df === 0) break;
    t -= f / df;
  }
  return Math.max(0, Math.min(1, t));
}

function wrapAngle(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const TEXT = "AWS STUDENT BUILDER GROUP · BIT JAIPUR.";
const DOT_CHAR_IDX = TEXT.indexOf(".");
const LETTER_CHAR_INDICES = Array.from(TEXT)
  .map((_, i) => i)
  .filter((i) => i !== DOT_CHAR_IDX);
const ATLAS_COLS = 8;
const ATLAS_CELL = 64;
const ATLAS_ROWS = Math.ceil(TEXT.length / ATLAS_COLS);
const BAND_CENTER_SPREAD = 0.65 * Math.PI;
const LABELS = {
  idle: "Click & hold",
  holding: "Keep holding",
  charged: "Release",
} as const;
const BACKGROUND = "#232323";

const RING_COUNT = 30;
const MAX_RIPPLES = 16;
const PX_TO_DESIGN = 0.001851851851851852; // 1 / 540
const RIPPLE_DURATION = 1.8;
const RIPPLE_MAX_RADIUS = 1.6;
const RIPPLE_HALF_WIDTH = 0.425;
const ENTRANCE_RADIUS_OFFSET = 0.425;
const REDUCED_MOTION_TIME = 2.3;

type Phase = keyof typeof LABELS;

type Ring = {
  radius: number;
  charsCount: number;
  speed: number;
  letterSizePx: number;
  bandCenter: number;
  bandHalfWidth: number;
  bandSoftness: number;
};

type Ripple = { start: number; strength: number };

/** 512 x (64 * rows) glyph atlas: one 64px cell per character, the "." drawn as a disc. */
function buildAtlas() {
  const canvas = document.createElement("canvas");
  canvas.width = ATLAS_COLS * ATLAS_CELL;
  canvas.height = ATLAS_CELL * ATLAS_ROWS;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = getMonoFontCss(57.6);
  for (let i = 0; i < TEXT.length; i++) {
    const x = ((i % ATLAS_COLS) + 0.5) * ATLAS_CELL;
    const y = (Math.floor(i / ATLAS_COLS) + 0.55) * ATLAS_CELL;
    const char = TEXT[i];
    if (char === ".") {
      ctx.beginPath();
      ctx.arc(x, y, 5.76, 0, 2 * Math.PI);
      ctx.fill();
      continue;
    }
    ctx.fillText(char ?? "", x, y);
  }
  return canvas;
}

function buildRings(): Ring[] {
  const rings: Ring[] = new Array(RING_COUNT);
  for (let i = 0; i < RING_COUNT; i++) {
    const t = i / (RING_COUNT - 1);
    const radius = 0.06 + 1.39 * t;
    const speed =
      (i % 2 === 0 ? 1 : -1) * (0.006 + (1 - t) * 0.029000000000000005);
    const letterSizePx = 14 + 16 * t;
    const charsCount = Math.max(
      8,
      Math.floor((2 * Math.PI * radius) / (0.6 * letterSizePx * PX_TO_DESIGN)),
    );
    const bandCenter =
      Math.random() < 0.15
        ? Math.random() * Math.PI * 2
        : 0.25 + (Math.random() - 0.5) * BAND_CENTER_SPREAD;
    const bandWidth =
      Math.random() < 0.1
        ? 0.05 + 0.15 * Math.random()
        : 0.25 + 0.35 * t + 0.3 * Math.random();
    rings[i] = {
      radius,
      charsCount,
      speed,
      letterSizePx,
      bandCenter,
      bandHalfWidth: Math.min(0.98, bandWidth) * Math.PI,
      bandSoftness: Math.PI * (0.07 + 0.13 * Math.random()),
    };
  }
  return rings;
}

/** Letters run through the text in order, separated by random 1-3 slot gaps. */
function buildLetterSequence(count: number) {
  const isLetter = new Uint8Array(count);
  const letterIdx = new Uint16Array(count);
  let slot = 0;
  while (slot < count) {
    for (let j = 0; j < LETTER_CHAR_INDICES.length && slot < count; j++) {
      isLetter[slot] = 1;
      letterIdx[slot] = LETTER_CHAR_INDICES[j] ?? 0;
      slot++;
    }
    const gap = 1 + Math.floor(3 * Math.random());
    for (let j = 0; j < gap && slot < count; j++) slot++;
  }
  return { isLetter, letterIdx };
}

function buildInstances(rings: Ring[]) {
  let total = 0;
  for (const ring of rings) total += ring.charsCount;
  const aRadius = new Float32Array(total);
  const aTheta0 = new Float32Array(total);
  const aSpeed = new Float32Array(total);
  const aSize = new Float32Array(total);
  const aCharIdx = new Float32Array(total);
  const aRingIdx = new Float32Array(total);
  let k = 0;
  for (let r = 0; r < rings.length; r++) {
    const ring = rings[r];
    if (!ring) continue;
    const { isLetter, letterIdx } = buildLetterSequence(ring.charsCount);
    const phase = Math.random() * Math.PI * 2;
    const step = (2 * Math.PI) / ring.charsCount;
    const bandOuter = ring.bandHalfWidth + ring.bandSoftness;
    const bandInner = Math.max(0, ring.bandHalfWidth - ring.bandSoftness);
    for (let c = 0; c < ring.charsCount; c++) {
      const jitter = (Math.random() - 0.5) * step * 0;
      const theta = phase + c * step + jitter;
      const distFromBand = Math.abs(wrapAngle(theta - ring.bandCenter));
      const bandWeight = smoothstep01(bandOuter, bandInner, distFromBand);
      const showLetter =
        isLetter[c] === 1 &&
        (bandWeight > 0.7 ||
          (!(bandWeight < 0.3) && Math.random() < bandWeight));
      aRadius[k] = ring.radius;
      aTheta0[k] = theta;
      aSpeed[k] = ring.speed;
      aRingIdx[k] = r;
      if (showLetter) {
        aCharIdx[k] = letterIdx[c] ?? 0;
        aSize[k] = ring.letterSizePx * (0.85 + 0.15 * bandWeight);
      } else {
        aCharIdx[k] = DOT_CHAR_IDX;
        aSize[k] = 5;
      }
      k++;
    }
  }
  return { aRadius, aTheta0, aSpeed, aSize, aCharIdx, aRingIdx, total };
}

/* -------------------------------------------------------------------------- */
/* Shaders (verbatim)                                                         */
/* -------------------------------------------------------------------------- */

const VERTEX = `#version 300 es
precision highp float;

in vec2 position;
in vec2 uv;
in float aRadius;
in float aTheta0;
in float aSpeed;
in float aSize;
in float aCharIdx;
in float aRingIdx;

uniform float uTime;
uniform vec2 uFitScale;
uniform vec2 uCenter;
uniform vec2 uAtlasGrid;
uniform float uPxToDesign;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform float uMouseRadius;
uniform float uRingCharge[30];
uniform float uRingGather[30];
uniform float uRippleStarts[16];
uniform float uRingOffsets[30];
uniform float uRingArrivalTime[30];

const float RIPPLE_DURATION_S = 1.8000;
const float RIPPLE_MAX_RADIUS_S = 1.6000;
const float RIPPLE_WIDTH_S = 0.8500;
const float RIPPLE_RADIAL_PUSH_S = 0.0450;
const float RIPPLE_SCALE_BOOST_S = 0.5000;
const float DOT_SIZE_PX_S = 5.0000;
const float ENTRANCE_FADE_S = 0.5000;
const float HOLD_GATHER_SCALE_S = 0.1200;
const float HOLD_SHAKE_AMPLITUDE_S = 0.0020;
const float HOLD_SHAKE_FRACTION_S = 0.1800;
const float HOLD_GLITCH_RATE_S = 9.0000;
const float HOLD_GLITCH_FRACTION_S = 0.1500;

out vec2 vUv;
out float vRingT;
out float vAlpha;

void main() {
  // Reveal strength from any active wavefront (-1 = empty slot), smoothed three ways (eased radius, bell, life fade) to swell.
  float rippleInfluence = 0.0;
  for (int r = 0; r < 16; r++) {
    float start = uRippleStarts[r];
    if (start < 0.0) continue;
    float elapsed = uTime - start;
    if (elapsed < 0.0 || elapsed >= RIPPLE_DURATION_S) continue;
    float t = elapsed / RIPPLE_DURATION_S;
    float waveRadius = smoothstep(0.0, 1.0, t) * RIPPLE_MAX_RADIUS_S;
    float bell = 1.0 - smoothstep(0.0, RIPPLE_WIDTH_S * 0.5, abs(aRadius - waveRadius));
    float lifeFade = smoothstep(0.0, 0.22, t) * (1.0 - smoothstep(0.78, 1.0, t));
    rippleInfluence = max(rippleInfluence, bell * lifeFade);
  }

  // Push and size use the influence directly: the envelope is already shaped, and extra sharpening brings back the hard edge.
  // Hold: uRingCharge is fast tension, uRingGather slow zoom creep; each ring's pair decays as the release wave arrives.
  float holdCharge = uRingCharge[int(aRingIdx)];
  float gatherAmt = uRingGather[int(aRingIdx)];
  float effectiveRadius = aRadius * (1.0 - gatherAmt * HOLD_GATHER_SCALE_S) + rippleInfluence * RIPPLE_RADIAL_PUSH_S;

  float theta = aTheta0 + uTime * aSpeed + uRingOffsets[int(aRingIdx)];
  float c = cos(theta);
  float s = sin(theta);
  vec2 ringCenter = vec2(c, s) * effectiveRadius;

  // Pure bell falloff from the cursor, so dissolution is a continuous gradient rather than a hard disc snapping with movement.
  float mouseDist = length(ringCenter - uMouse);
  float hoverInfluence = (1.0 - smoothstep(0.0, uMouseRadius, mouseDist)) * uMouseInfluence;

  // Both dissolve chars to dots; hover is 2.5x stronger, so it converts more than a passing ripple.
  float strength = max(hoverInfluence * 2.5, rippleInfluence);
  float seed = aTheta0 * 7.13 + aRadius * 13.97;
  float threshold = fract(sin(seed * 12.9898) * 43758.5453);
  float isDot = step(threshold, strength);

  // Hold glitch: sparse slots blink letter to dot, re-rolled each tick, so the frozen spiral stays tense instead of dead.
  float glitchTick = floor(uTime * HOLD_GLITCH_RATE_S);
  float glitchNoise = fract(sin(seed * 91.7 + glitchTick * 7.31) * 43758.5453);
  isDot = max(isDot, step(glitchNoise, holdCharge * HOLD_GLITCH_FRACTION_S));
  float charIdxNow = mix(aCharIdx, ${DOT_CHAR_IDX}.0, isDot);
  // A dissolved letter shrinks to dot size, and the same envelope inflates glyphs as the wave passes.
  float sizePx = mix(aSize, DOT_SIZE_PX_S, isDot) * (1.0 + rippleInfluence * RIPPLE_SCALE_BOOST_S);

  // Tangent rotation (theta + π/2) reuses (c, s): cos becomes -sin and sin becomes cos, saving two trig calls.
  float designSize = sizePx * uPxToDesign;
  vec2 rotated = vec2(
    -position.x * s - position.y * c,
    position.x * c - position.y * s
  ) * designSize;

  // Hold shiver: a hashed subset trembles at detuned phases, scaled by charge until the release wave calms it ring by ring.
  float shakeSeed = fract(sin(aTheta0 * 91.17 + aRadius * 47.91) * 24634.6345);
  float shakes = step(shakeSeed, HOLD_SHAKE_FRACTION_S);
  vec2 tremor = vec2(
    sin(uTime * (38.0 + shakeSeed * 14.0) + shakeSeed * 271.0),
    cos(uTime * (34.0 + shakeSeed * 17.0) + shakeSeed * 113.0)
  ) * (holdCharge * shakes * HOLD_SHAKE_AMPLITUDE_S);

  vec2 worldPos = (ringCenter + rotated + tremor) * uFitScale + uCenter;

  float col = mod(charIdxNow, uAtlasGrid.x);
  float row = floor(charIdxNow / uAtlasGrid.x);
  vUv = vec2((col + uv.x) / uAtlasGrid.x, (row + (1.0 - uv.y)) / uAtlasGrid.y);

  vRingT = clamp(aRadius, 0.0, 1.2);

  // Each ring fades in as the entrance ripple's edge reaches it, then vAlpha stays at 1.
  float arrival = uRingArrivalTime[int(aRingIdx)];
  vAlpha = clamp((uTime - arrival) / ENTRANCE_FADE_S, 0.0, 1.0);

  gl_Position = vec4(worldPos, 0.0, 1.0);
}
`;

const FRAGMENT = `#version 300 es
precision mediump float;

uniform sampler2D tAtlas;

in vec2 vUv;
in float vRingT;
in float vAlpha;

out vec4 fragColor;

void main() {
  vec4 sampled = texture(tAtlas, vUv);
  float dim = mix(0.85, 1.0, smoothstep(0.0, 0.85, vRingT));
  fragColor = vec4(vec3(dim), sampled.a * vAlpha);
}
`;

/* -------------------------------------------------------------------------- */
/* Scroll velocity (stands in for Lenis)                                      */
/* -------------------------------------------------------------------------- */

/**
 * The original reads `lenis.velocity` via `useLenis`. Lenis (default lerp 0.1)
 * eases its animated scroll toward the target with `damp(x, to, 60 * lerp, dt)`
 * and reports velocity as the animated-scroll delta per frame, zeroing it when
 * the animation settles. This replays that model on top of native window
 * scroll, so the value has the same sign and px-per-frame scale.
 */
function useScrollVelocity(velocityRef: RefObject<number>) {
  useEffect(() => {
    const LAMBDA = 60 * 0.1;
    let target = window.scrollY;
    let animated = target;
    let lastTime = 0;
    let raf = 0;

    const tick = (now: number) => {
      const dt = Math.max(0, (now - lastTime) * 0.001);
      lastTime = now;
      const k = 1 - Math.exp(-LAMBDA * dt);
      let next = (1 - k) * animated + k * target;
      const settled = Math.round(next) === Math.round(target);
      if (settled) next = target;
      velocityRef.current = settled ? 0 : next - animated;
      animated = next;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = window.scrollY;
      if (raf === 0) {
        lastTime = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf !== 0) cancelAnimationFrame(raf);
    };
  }, [velocityRef]);
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function SpiralScene({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const isTouch = useIsTouchDevice();
  const scrollVelocityRef = useRef(0);

  useScrollVelocity(scrollVelocityRef);

  const labelText = phase === "idle" && isTouch ? "Tap & hold" : LABELS[phase];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const renderer = new Renderer({
      webgl: 2,
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      dpr,
      powerPreference: "high-performance",
    });
    const gl = renderer.gl;
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

    const abort = new AbortController();
    const { signal } = abort;

    const atlas = new Texture(gl, {
      image: buildAtlas(),
      generateMipmaps: true,
      premultiplyAlpha: false,
      flipY: false,
    });

    const rings = buildRings();
    const ringArrivalTime = new Array<number>(RING_COUNT).fill(0);
    for (let i = 0; i < RING_COUNT; i++) {
      const ring = rings[i];
      if (!ring) continue;
      const distance = Math.max(0, ring.radius - ENTRANCE_RADIUS_OFFSET);
      ringArrivalTime[i] =
        RIPPLE_DURATION *
        smoothstepInverse(Math.min(1, distance / RIPPLE_MAX_RADIUS));
    }

    const { aRadius, aTheta0, aSpeed, aSize, aCharIdx, aRingIdx } =
      buildInstances(rings);

    const geometry = new Geometry(gl, {
      position: { size: 2, data: BASE_QUAD_POSITION },
      uv: { size: 2, data: BASE_QUAD_UV },
      aRadius: { instanced: 1, size: 1, data: aRadius },
      aTheta0: { instanced: 1, size: 1, data: aTheta0 },
      aSpeed: { instanced: 1, size: 1, data: aSpeed },
      aSize: { instanced: 1, size: 1, data: aSize },
      aCharIdx: { instanced: 1, size: 1, data: aCharIdx },
      aRingIdx: { instanced: 1, size: 1, data: aRingIdx },
    });

    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      cullFace: false,
      uniforms: {
        uTime: { value: 0 },
        uFitScale: { value: new Float32Array([1, 1]) },
        uCenter: { value: new Float32Array([0, 0]) },
        uAtlasGrid: { value: new Float32Array([ATLAS_COLS, ATLAS_ROWS]) },
        uPxToDesign: { value: PX_TO_DESIGN },
        uMouse: { value: new Float32Array([999, 999]) },
        uMouseInfluence: { value: 0 },
        uMouseRadius: { value: 0.35 },
        uRingCharge: { value: new Array<number>(RING_COUNT).fill(0) },
        uRingGather: { value: new Array<number>(RING_COUNT).fill(0) },
        uRippleStarts: { value: new Array<number>(MAX_RIPPLES).fill(-1) },
        uRingOffsets: { value: new Array<number>(RING_COUNT).fill(0) },
        uRingArrivalTime: { value: ringArrivalTime },
        tAtlas: { value: atlas },
      },
    });

    const mesh = new Mesh(gl, { geometry, program, frustumCulled: false });

    const loseContext = () => {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };

    if (!program.uniformLocations || !program.attributeLocations) {
      console.error("[Spiral] shader failed to compile/link", {
        vsLog: gl.getShaderInfoLog(program.vertexShader),
        fsLog: gl.getShaderInfoLog(program.fragmentShader),
        linkLog: gl.getProgramInfoLog(program.program),
      });
      try {
        container.removeChild(canvas);
      } catch {}
      loseContext();
      return;
    }

    const uTime = program.uniforms.uTime as { value: number };
    const uFitScale = program.uniforms.uFitScale as { value: Float32Array };
    const uCenter = program.uniforms.uCenter as { value: Float32Array };
    const uMouse = program.uniforms.uMouse as { value: Float32Array };
    const uMouseInfluence = program.uniforms.uMouseInfluence as {
      value: number;
    };
    const uRingCharge = program.uniforms.uRingCharge as { value: number[] };
    const uRingGather = program.uniforms.uRingGather as { value: number[] };
    const uRippleStarts = program.uniforms.uRippleStarts as { value: number[] };
    const uRingOffsets = program.uniforms.uRingOffsets as { value: number[] };

    // Container size in CSS px; the scene is "cover"-fit so 1 design unit = max(w, h) / 2.
    let width = 1;
    let height = 1;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      renderer.setSize(
        Math.max(1, Math.floor(rect.width)),
        Math.max(1, Math.floor(rect.height)),
      );
      const aspect = width / height;
      if (aspect >= 1) {
        uFitScale.value[0] = 1;
        uFitScale.value[1] = aspect;
      } else {
        uFitScale.value[0] = 1 / aspect;
        uFitScale.value[1] = 1;
      }
    };
    resize();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let isInView = true;
    let isPageVisible = !document.hidden;
    let motionAllowed = !reducedMotion.matches;
    let lastFrame = performance.now();
    let time = 0;
    const ripples: Ripple[] = [];
    const targetOffsets = new Float32Array(RING_COUNT);
    const smoothedOffsets = new Float32Array(RING_COUNT);
    let hoverTarget = 0;
    const mouseTarget = new Float32Array([999, 999]);
    let isHolding = false;
    let isCharged = false;
    let charge = 0;
    let gather = 0;
    let scrollInfluence = 0;
    let releaseTime = -1;
    const ringChargeState = new Float32Array(RING_COUNT);
    const ringGatherState = new Float32Array(RING_COUNT);
    const holdSpin = new Float32Array(RING_COUNT);

    const render = () => {
      uTime.value = time;
      renderer.render({
        scene: mesh,
        update: false,
        sort: false,
        frustumCull: false,
      });
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - lastFrame) * 0.001);
      lastFrame = now;
      if (motionAllowed) time += dt;

      while (ripples.length > 0) {
        const first = ripples[0];
        if (!first || time - first.start < RIPPLE_DURATION) break;
        ripples.shift();
      }
      const rippleStarts = uRippleStarts.value;
      for (let i = 0; i < MAX_RIPPLES; i++) {
        const ripple = ripples[i];
        rippleStarts[i] = ripple ? ripple.start : -1;
      }

      const hoverEase = 1 - Math.exp(-6 * dt);
      uMouseInfluence.value =
        uMouseInfluence.value +
        (hoverTarget - uMouseInfluence.value) * hoverEase;
      const mouseEase = 1 - Math.exp(-14 * dt);
      uMouse.value[0] =
        uMouse.value[0] + (mouseTarget[0] - uMouse.value[0]) * mouseEase;
      uMouse.value[1] =
        uMouse.value[1] + (mouseTarget[1] - uMouse.value[1]) * mouseEase;

      if (isHolding) {
        charge = Math.min(1, charge + dt / 0.9);
        gather = 1 - (1 - gather) * Math.exp(-dt / 4);
        if (!isCharged && charge >= 1) {
          isCharged = true;
          setPhase("charged");
        }
      } else {
        charge *= Math.exp(-10 * dt);
        gather *= Math.exp(-10 * dt);
      }

      // After release, each ring keeps its charge until the release wavefront passes it.
      const releaseDecay = Math.exp(-10 * dt);
      const sinceRelease = time - releaseTime;
      const releaseActive = releaseTime >= 0 && sinceRelease < RIPPLE_DURATION;
      const releaseFront = releaseActive
        ? RIPPLE_MAX_RADIUS *
            smoothstep01(0, 1, sinceRelease / RIPPLE_DURATION) +
          RIPPLE_HALF_WIDTH
        : Infinity;
      const chargeUniform = uRingCharge.value;
      const gatherUniform = uRingGather.value;
      for (let i = 0; i < RING_COUNT; i++) {
        const ring = rings[i];
        if (!ring) continue;
        let ringCharge = ringChargeState[i] ?? 0;
        let ringGather = ringGatherState[i] ?? 0;
        if (isHolding) {
          const ease = 1 - Math.exp(-14 * dt);
          ringCharge += (charge - ringCharge) * ease;
          ringGather +=
            (smoothstep01(0, 1, charge) * gather - ringGather) * ease;
        } else if (!releaseActive || releaseFront >= ring.radius) {
          ringCharge *= releaseDecay;
          ringGather *= releaseDecay;
        }
        ringChargeState[i] = ringCharge;
        ringGatherState[i] = ringGather;
        gatherUniform[i] = ringGather;
        const easedCharge = smoothstep01(0, 1, ringCharge);
        chargeUniform[i] = easedCharge;
        holdSpin[i] = (holdSpin[i] ?? 0) - easedCharge * ring.speed * dt;
      }

      scrollVelocityRef.current = scrollVelocityRef.current * Math.exp(-5 * dt);
      const scrollSpeed = Math.min(40, +Math.abs(scrollVelocityRef.current));
      scrollInfluence +=
        (scrollSpeed - scrollInfluence) * (1 - Math.exp(-4 * dt));

      const offsetEase = 1 - Math.exp(-3 * dt);
      const offsets = uRingOffsets.value;
      for (let i = 0; i < RING_COUNT; i++) {
        const ring = rings[i];
        if (!ring) continue;
        let push = 0;
        for (const ripple of ripples) {
          const elapsed = time - ripple.start;
          if (elapsed < 0 || elapsed >= RIPPLE_DURATION) continue;
          const t = elapsed / RIPPLE_DURATION;
          const waveRadius = RIPPLE_MAX_RADIUS * smoothstep01(0, 1, t);
          const influence =
            (1 -
              smoothstep01(
                0,
                RIPPLE_HALF_WIDTH,
                Math.abs(ring.radius - waveRadius),
              )) *
            (smoothstep01(0, 0.22, t) * (1 - smoothstep01(0.78, 1, t))) *
            ripple.strength;
          if (influence > push) push = influence;
        }
        const direction = Math.sign(ring.speed) || 1;
        targetOffsets[i] =
          targetOffsets[i] +
          (0.55 * push * direction + ring.speed * scrollInfluence) * dt;
        const smoothed =
          smoothedOffsets[i] +
          (targetOffsets[i] - smoothedOffsets[i]) * offsetEase;
        smoothedOffsets[i] = smoothed;
        offsets[i] = smoothed + (holdSpin[i] ?? 0);
      }

      render();
      raf =
        isInView && isPageVisible && motionAllowed
          ? requestAnimationFrame(frame)
          : 0;
    };

    const stop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const sync = () => {
      if (isInView && isPageVisible && motionAllowed) {
        if (raf === 0) {
          lastFrame = performance.now();
          raf = requestAnimationFrame(frame);
        }
      } else {
        stop();
        render();
      }
    };

    document.fonts.ready.then(() => {
      if (signal.aborted) return;
      atlas.image = buildAtlas();
      atlas.needsUpdate = true;
      render();
    });

    // Resize: leading call, then a trailing call 150ms after the last event.
    // While off-screen, defer until the container is visible again.
    let resizePending = false;
    let resizeTimer: number | null = null;
    let resizeTrailing = false;
    const applyResize = () => {
      resize();
      if (raf === 0) render();
    };
    const resizeObserver = new ResizeObserver(() => {
      if (!isInView) {
        resizePending = true;
        return;
      }
      if (resizeTimer === null) {
        applyResize();
      } else {
        window.clearTimeout(resizeTimer);
        resizeTrailing = true;
      }
      resizeTimer = window.setTimeout(() => {
        resizeTimer = null;
        if (resizeTrailing) {
          resizeTrailing = false;
          applyResize();
        }
      }, 150);
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isInView = entry.isIntersecting;
        if (isInView && resizePending) {
          resizePending = false;
          resize();
        }
        sync();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(container);

    document.addEventListener(
      "visibilitychange",
      () => {
        isPageVisible = !document.hidden;
        sync();
      },
      { signal },
    );
    reducedMotion.addEventListener(
      "change",
      () => {
        motionAllowed = !reducedMotion.matches;
        sync();
      },
      { signal },
    );

    // Container px -> design space (inverse of worldPos = design * uFitScale + uCenter).
    const toDesign = (x: number, y: number): [number, number] => {
      const clipY = -((y / height) * 2 - 1);
      return [
        ((x / width) * 2 - 1 - uCenter.value[0]) / uFitScale.value[0],
        (clipY - uCenter.value[1]) / uFitScale.value[1],
      ];
    };

    setupCursorTracking({
      container,
      signal,
      labelRef,
      setIsHovering,
      onPointerMove: (x, y) => {
        const [dx, dy] = toDesign(x, y);
        mouseTarget[0] = dx;
        mouseTarget[1] = dy;
      },
      onPointerEnter: (x, y) => {
        const [dx, dy] = toDesign(x, y);
        mouseTarget[0] = dx;
        mouseTarget[1] = dy;
        uMouse.value[0] = mouseTarget[0];
        uMouse.value[1] = mouseTarget[1];
        hoverTarget = 1;
      },
      onPointerLeave: () => {
        hoverTarget = 0;
        isHolding = false;
        isCharged = false;
        setPhase("idle");
      },
      onPointerDown: () => {
        isHolding = true;
        isCharged = false;
        setPhase("holding");
      },
      onPointerUp: () => {
        if (!isHolding) return;
        isHolding = false;
        if (isCharged) {
          releaseTime = time;
          ripples.push({ start: time, strength: 0.7 + 0.6 * gather });
          while (ripples.length > MAX_RIPPLES) ripples.shift();
        }
        isCharged = false;
        setPhase("idle");
      },
    });

    // Entrance ripple from the centre; reduced motion shows a settled frame instead.
    if (motionAllowed) ripples.push({ start: 0, strength: 1 });
    else time = REDUCED_MOTION_TIME;
    render();
    sync();

    return () => {
      stop();
      abort.abort();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      try {
        container.removeChild(canvas);
      } catch {}
      loseContext();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ backgroundColor: BACKGROUND }}
      className={cx(
        "relative size-full cursor-pointer select-none overflow-hidden",
        className,
      )}
    >
      <CursorLabel
        labelRef={labelRef}
        isHovering={isHovering}
        text={labelText}
      />
    </div>
  );
}
