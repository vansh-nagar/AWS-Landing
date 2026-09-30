import type { ReactNode } from "react";
import { AnimatedText } from "@/components/hero/animated-text";
import { cx } from "@/lib/cx";

/*
 * Small pieces shared by the proof sections (past events, gallery, showcase,
 * resources). Class strings are copied from the reference sections.
 */

/** Program icon used as the ASCII fallback / empty-state image. */
export const PROGRAM_ICON_SRC = "/brand/program-icon/white.svg";

/** 04-showcase heading block: `mb-80 flex flex-col gap-16`. */
export function ProofHeading({
  title,
  intro,
  id,
  tone = "dark",
}: {
  title: string;
  intro?: string;
  /** id for the h2 (section aria-labelledby). */
  id: string;
  tone?: "dark" | "light";
}) {
  return (
    <div className="mb-80 flex flex-col gap-16">
      <h2 id={id} className="text-balance font-medium text-headline-10">
        <AnimatedText>{title}</AnimatedText>
      </h2>
      {intro ? (
        <div
          className={cx(
            "w-full max-w-600 text-body-20",
            tone === "dark" ? "text-ghost-grey" : "text-dark-grey",
          )}
        >
          <AnimatedText as="div" animationDelay={0.1}>
            {intro}
          </AnimatedText>
        </div>
      ) : null}
    </div>
  );
}

/** 06-pricing tag: mono caption pill on `bg-current/10`, optional accent dot. */
export function ProofTag({
  children,
  dot = false,
  className,
}: {
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex w-fit min-w-0 shrink-0 items-center whitespace-nowrap rounded-4 bg-current/10 px-6 py-4 font-mono text-caption-10 uppercase leading-none tracking-wide",
        dot ? "gap-8" : "gap-6",
        className,
      )}
    >
      {dot ? (
        <span aria-hidden="true" className="relative flex size-6">
          <span className="absolute inline-flex size-6 animate-status-ping rounded-full bg-accent motion-reduce:hidden" />
          <span className="relative inline-flex size-6 rounded-full bg-accent" />
        </span>
      ) : null}
      {children}
    </span>
  );
}

/** 12px up-right arrow for external links (square caps, pixel feel). */
export function ExternalArrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      fill="none"
      className={cx("size-12 shrink-0", className)}
    >
      <path
        d="M3.5 8.5 8.5 3.5M4 3.5h4.5V8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  );
}

/** Mono external text link used under showcase cards ("GITHUB ↗"). */
export function ProofLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-4 font-mono text-caption-10 uppercase text-ghost-grey underline decoration-dashed decoration-from-font underline-offset-3 transition-colors hover:text-white focus-visible:text-white"
    >
      {children}
      <ExternalArrow className="size-10" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
