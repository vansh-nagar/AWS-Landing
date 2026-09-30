"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type MotionViewport,
  usePrefersReducedMotion,
  useViewportGate,
} from "@/components/hero/text-motion-hooks";

type Position = { line: number; chunk: number; chars: number };

const START: Position = { line: 0, chunk: 0, chars: 0 };

export type TypewriterProps = {
  /** Lines of chunks. Chunks in a line are spread with justify-between. */
  lines: string[][];
  /** ms between characters. */
  charDelay?: number;
  /** ms pause after a chunk finishes (same line). */
  chunkDelay?: number;
  /** ms pause after a line finishes. */
  lineDelay?: number;
  /** ms before the first character once started. */
  startDelay?: number;
  /** Show the blinking block cursor on the active chunk. */
  cursor?: boolean;
  /** Flowing-paragraph variant (one text run, thin caret). */
  wrap?: boolean;
  /** Start when true (and in view, unless `viewport` is false). */
  play?: boolean;
  /**
   * Viewport gate, like the original's motion `viewport` prop. `undefined`
   * waits until the element scrolls into view (margin 0 0 -10% 0, once);
   * `false` starts on mount.
   */
  viewport?: MotionViewport | false;
  className?: string;
};

/** Character offset of the typing head in the `wrap` variant's joined text. */
function wrapIndex(
  lines: string[][],
  pos: Position,
  done: boolean,
  fullLength: number,
): number {
  if (done) return fullLength;
  let index = 0;
  for (let l = 0; l < lines.length; l++) {
    const chunks = lines[l] ?? [];
    for (let c = 0; c < chunks.length; c++) {
      const chunk = chunks[c] ?? "";
      const before = l < pos.line || (l === pos.line && c < pos.chunk);
      const active = l === pos.line && c === pos.chunk;
      if (before) index += chunk.length + 1;
      else if (active) return index + pos.chars;
      else return index;
    }
  }
  return index;
}

/** Port of the original Typewriter (grid + `wrap` variants). */
export function Typewriter({
  lines: linesProp,
  charDelay = 28,
  chunkDelay = 240,
  lineDelay = 420,
  startDelay = 0,
  cursor = true,
  wrap = false,
  play = true,
  viewport,
  className,
}: TypewriterProps) {
  const reduced = usePrefersReducedMotion();
  const { entered, ref } = useViewportGate<HTMLDivElement>(viewport);
  const [started, setStarted] = useState(false);
  const [pos, setPos] = useState<Position>(START);
  const [done, setDone] = useState(false);

  // Stable identity for inline array literals, so a parent re-render doesn't
  // restart the sequence (the original relied on the React Compiler for this).
  const linesKey = JSON.stringify(linesProp);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on content
  const lines = useMemo(() => linesProp, [linesKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- latch once gate + play are both open (mirrors the original)
    if (entered && play) setStarted(true);
  }, [entered, play]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced motion shows everything at once
      setDone(true);
      return;
    }
    if (!started) return;
    setPos(START);
    setDone(false);

    let cancelled = false;
    const wait = (ms: number, fn: () => void) => {
      timer = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };
    const step = (p: Position) => {
      const line = lines[p.line];
      if (!line) {
        setDone(true);
        return;
      }
      const chunk = line[p.chunk];
      if (chunk === undefined) {
        wait(lineDelay, () => step({ line: p.line + 1, chunk: 0, chars: 0 }));
        return;
      }
      setPos(p);
      if (p.chars < chunk.length) {
        wait(charDelay, () => step({ ...p, chars: p.chars + 1 }));
        return;
      }
      const lastChunk = p.chunk >= line.length - 1;
      const next = lastChunk
        ? { line: p.line + 1, chunk: 0, chars: 0 }
        : { line: p.line, chunk: p.chunk + 1, chars: 0 };
      wait(lastChunk ? lineDelay : chunkDelay, () => step(next));
    };
    wait(startDelay, () => step(START));

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [lines, charDelay, chunkDelay, lineDelay, startDelay, reduced, started]);

  const srText = lines.map((line) => line.join(" ")).join(". ");
  const fullText = lines.map((line) => line.join(" ")).join(" ");

  if (wrap) {
    const index = wrapIndex(lines, pos, done, fullText.length);
    const showCaret = cursor && !reduced;
    return (
      <div ref={ref} className={className}>
        <span className="sr-only">{srText}</span>
        <span aria-hidden="true" className="whitespace-pre-wrap">
          {fullText.slice(0, index)}
          {showCaret ? (
            <span className="relative inline">
              <span className="absolute top-[0.1em] left-0 inline-block h-[1.05em] w-[0.1em] animate-cursor-blink bg-current" />
            </span>
          ) : null}
          <span className="text-transparent">{fullText.slice(index)}</span>
        </span>
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <span className="sr-only">{srText}</span>
      <div aria-hidden="true" className="flex flex-col gap-y-4">
        {lines.map((line, lineIndex) => (
          <div
            key={lineIndex}
            className="flex flex-wrap items-baseline justify-between gap-x-16 gap-y-4"
          >
            {line.map((chunk, chunkIndex) => {
              const lineDone = lineIndex < pos.line;
              const onLine = lineIndex === pos.line;
              const chunkDone = onLine && chunkIndex < pos.chunk;
              const active = onLine && chunkIndex === pos.chunk;
              const shown =
                done || lineDone || chunkDone
                  ? chunk.length
                  : active
                    ? pos.chars
                    : 0;
              const showCursor = cursor && !reduced && started && active;
              return (
                <span
                  key={chunkIndex}
                  className="relative inline-block whitespace-pre"
                >
                  <span className="invisible">{chunk}</span>
                  <span className="absolute inset-y-0 left-0 whitespace-pre">
                    <span className="relative inline-block">
                      {"​"}
                      {chunk.slice(0, shown)}
                      {showCursor ? (
                        <span
                          aria-hidden="true"
                          className="absolute top-0 left-full ml-px h-[1em] w-[0.55em] translate-y-[0.15em] animate-cursor-blink bg-current"
                        />
                      ) : null}
                    </span>
                  </span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
