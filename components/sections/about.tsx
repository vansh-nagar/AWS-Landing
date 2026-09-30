"use client";

import { useEffect, useMemo, useState } from "react";

import { AnimatedText } from "@/components/hero/animated-text";
import {
  usePrefersReducedMotion,
  useViewportGate,
} from "@/components/hero/text-motion-hooks";
import { Typewriter } from "@/components/hero/typewriter";
import { PixelIcon } from "@/components/sections/identity-strip";
import { TerminalWindow } from "@/components/ui/terminal-window";
import { about } from "@/content/story";
import { cx } from "@/lib/cx";

/* ------------------------------------------------------------------------ */
/* Typed terminal list (port of the reference's Terminal)                    */
/* ------------------------------------------------------------------------ */

type Row = { num?: string; left: string; right?: string };

const BLANK: Row = { left: " " };
/* Values copied from the original Terminal defaults. */
const CHAR_DELAY = 16;
const LINE_DELAY = 200;
const START_DELAY = 120;

const rowLength = (row: Row) => (row.num?.length ?? 0) + row.left.length;

function buildRows({
  command,
  lines,
  footer,
}: {
  command?: string;
  lines: { label: string; tag?: string }[];
  footer?: string;
}): Row[] {
  const rows: Row[] = [];
  if (command) rows.push({ left: `> ${command}` });
  if (command && lines.length) rows.push(BLANK);
  lines.forEach((line, i) =>
    rows.push({
      num: String(i + 1).padStart(3, "0"),
      left: line.label,
      right: line.tag,
    }),
  );
  if (footer) {
    if (rows.length) rows.push(BLANK);
    rows.push({ left: footer });
  }
  return rows;
}

/**
 * Types each row in (number first, then text), fading the right-hand tag in
 * once its row is done. Every row reserves its space up front, so the window
 * never changes size. Starts when scrolled into view; reduced motion shows
 * everything at once.
 */
function TerminalTyping() {
  const { title, command, lines, footer } = about.terminal;
  const rows = useMemo(
    () => buildRows({ command, lines, footer }),
    [command, lines, footer],
  );
  const reduced = usePrefersReducedMotion();
  const { entered, ref } = useViewportGate<HTMLDivElement>(undefined);
  const [pos, setPos] = useState({ row: 0, chars: 0 });
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced motion shows everything at once
      setDone(true);
      return;
    }
    if (!entered) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const wait = (ms: number, fn: () => void) => {
      timer = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };
    const step = (p: { row: number; chars: number }) => {
      const row = rows[p.row];
      if (!row) {
        setDone(true);
        return;
      }
      setPos(p);
      if (p.chars < rowLength(row)) {
        wait(CHAR_DELAY, () => step({ ...p, chars: p.chars + 1 }));
      } else {
        wait(LINE_DELAY, () => step({ row: p.row + 1, chars: 0 }));
      }
    };
    wait(START_DELAY, () => step({ row: 0, chars: 0 }));
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [entered, reduced, rows]);

  const srText = rows
    .map((row) => [row.num, row.left, row.right].filter(Boolean).join(" "))
    .join(". ");

  return (
    <div ref={ref}>
      <TerminalWindow title={title} bodyClassName="overflow-x-auto">
        <span className="sr-only">{srText}</span>
        <div aria-hidden="true" className="flex min-w-max flex-col gap-y-2">
          {rows.map((row, i) => {
            const rowDone = done || i < pos.row;
            const active = !done && i === pos.row;
            const numLength = row.num?.length ?? 0;
            const typed = rowDone ? rowLength(row) : active ? pos.chars : 0;
            const numShown = row.num ? row.num.slice(0, Math.min(typed, numLength)) : "";
            const leftShown = row.left.slice(0, Math.max(0, typed - numLength));
            const showCursor = !reduced && entered && active;
            return (
              <div
                key={i}
                className="flex items-baseline justify-between gap-x-16 whitespace-pre"
              >
                <span className={cx("flex items-baseline", row.num ? "gap-24" : null)}>
                  {row.num ? (
                    <span className="relative inline-block whitespace-pre text-dark-grey tabular-nums">
                      <span className="invisible">{row.num}</span>
                      <span className="absolute inset-y-0 left-0 whitespace-pre">
                        {numShown}
                      </span>
                    </span>
                  ) : null}
                  <span className="relative inline-block whitespace-pre">
                    <span className="invisible">{row.left || " "}</span>
                    <span className="absolute inset-y-0 left-0 whitespace-pre">
                      {leftShown}
                      {showCursor ? (
                        <span className="ml-px inline-block h-[1em] w-[0.55em] translate-y-[0.15em] animate-cursor-blink bg-current align-baseline" />
                      ) : null}
                    </span>
                  </span>
                </span>
                {row.right !== undefined ? (
                  <span
                    className={cx(
                      "whitespace-pre transition-opacity duration-200",
                      rowDone ? "opacity-100" : "opacity-0",
                    )}
                  >
                    {row.right}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </TerminalWindow>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Quote card (one reviews-style card, not a carousel)                        */
/* ------------------------------------------------------------------------ */

function QuoteCard() {
  const { quote } = about;
  return (
    <div
      className="h-full rounded-8 bg-black-deep p-6 shadow-lg ring ring-black-deep lg:p-8"
      style={{
        backgroundImage:
          "repeating-conic-gradient(rgba(255,255,255,0.22) 0% 25%, transparent 0% 50%)",
        backgroundSize: "4px 4px",
      }}
    >
      <figure className="flex h-full min-h-300 flex-col justify-between gap-24 overflow-hidden rounded-4 bg-black p-24 text-white ring-1 ring-white/10 lg:min-h-360 lg:gap-48 lg:p-48">
        <div className="flex flex-col gap-16 lg:gap-24">
          <blockquote>
            <Typewriter
              wrap
              lines={[[`“${quote.text}”`]]}
              charDelay={40}
              startDelay={200}
              className="text-body-30 text-white lg:text-headline-10"
            />
          </blockquote>
          <p className="max-w-[48ch] text-body-20 text-mid-grey">{quote.body}</p>
        </div>
        <figcaption className="flex items-center gap-16">
          <span className="relative flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/15">
            <PixelIcon name="program" className="h-20 text-brand-purple" />
          </span>
          <span className="min-w-0 flex-1 font-mono text-caption-10 uppercase">
            <span className="block truncate text-white">{quote.author}</span>
            <span className="block truncate text-dark-grey">{quote.role}</span>
          </span>
        </figcaption>
      </figure>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Section                                                                   */
/* ------------------------------------------------------------------------ */

/**
 * Section 4 (id="about"): the reference textTerminalSection layout (typed
 * terminal on the left, headline + body on the right), followed by one
 * reviews-style quote card offset to the right.
 */
export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      data-page-builder-section="aboutSection"
      className="bg-off-white py-72 text-black lg:py-160"
    >
      <div className="grid grid-cols-1 gap-x-16 gap-y-32 px-16 lg:grid-cols-12 lg:px-0">
        <div className="order-2 lg:order-1 lg:col-span-5 lg:pl-100">
          <TerminalTyping />
        </div>
        <div className="order-1 flex flex-col gap-32 lg:order-2 lg:col-span-6 lg:col-start-7 lg:pr-80">
          <h2 id="about-title" className="text-balance font-medium text-headline-10">
            <AnimatedText>{about.title}</AnimatedText>
          </h2>
          <div className="w-full text-body-20 text-dark-grey">
            <AnimatedText
              as="div"
              animationDelay={0.1}
              splitSelector="[data-text]"
              className="flex w-full flex-col gap-[1em] [&_[data-text]>*:not(:first-child)]:indent-0"
            >
              {about.body.map((paragraph) => (
                <div key={paragraph} className="empty:h-[1lh]" data-text>
                  {paragraph}
                </div>
              ))}
            </AnimatedText>
          </div>
        </div>
        <div className="order-3 mt-40 lg:col-span-7 lg:col-start-6 lg:mt-128 lg:pr-80">
          <QuoteCard />
        </div>
      </div>
    </section>
  );
}
