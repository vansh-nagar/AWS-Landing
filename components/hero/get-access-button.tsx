import Link from "next/link";
import type { CSSProperties, HTMLAttributes } from "react";

import {
  ODOMETER_HOVER_TRIGGER,
  OdometerHoverText,
} from "@/components/hero/odometer-hover-text";
import { cx } from "@/lib/cx";

/* ------------------------------------------------------------------------ */
/* Button styles (port of the original's `Button` cva)                       */
/* ------------------------------------------------------------------------ */

const BUTTON_BASE = [
  "relative inline-flex w-fit min-w-0 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap",
  "font-mono text-body-10 uppercase",
  "*:data-text:inline-flex *:data-text:h-48 *:data-text:items-center *:data-text:rounded-8 *:data-text:px-20 lg:*:data-text:px-24",
  "*:data-connector:transition-colors *:data-text:transition-colors",
  ODOMETER_HOVER_TRIGGER,
  "disabled:pointer-events-none disabled:opacity-50 disabled:grayscale",
].join(" ");

const BUTTON_VARIANTS = {
  dark: "*:data-text:bg-black *:data-connector:text-black *:data-text:text-white [&:hover_[data-connector]]:text-black-deep [&:hover_[data-text]]:bg-black-deep",
  light:
    "*:data-text:bg-ghost-grey *:data-connector:text-ghost-grey *:data-text:text-black [&:hover_[data-connector]]:text-white [&:hover_[data-text]]:bg-white",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

/** Class string for the pill button. `data-text` children are the pills. */
export function buttonClassName(variant: ButtonVariant = "dark") {
  return cx(BUTTON_BASE, BUTTON_VARIANTS[variant]);
}

/* ------------------------------------------------------------------------ */
/* Connector (the notched bridge between two pills)                          */
/* ------------------------------------------------------------------------ */

// Each cap is a 6x4 (or 4x6) block with a concave half-circle bite, so the
// bridge reads as a notch between the two rounded pills.
const CONNECTOR_CLIP_PATHS = {
  top: 'path("M0 0H1C1 1.1046 1.8954 2 3 2C4.1046 2 5 1.1046 5 0H6V4H0Z")',
  bottom: 'path("M0 0H6V4H5C5 2.8954 4.1046 2 3 2C1.8954 2 1 2.8954 1 4H0Z")',
  left: 'path("M0 0H4V6H0V5C1.1046 5 2 4.1046 2 3C2 1.8954 1.1046 1 0 1Z")',
  right: 'path("M0 0H4V1C2.8954 1 2 1.8954 2 3C2 4.1046 2.8954 5 4 5V6H0Z")',
} as const;

type ConnectorProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  /** Length along the main axis (px number or CSS length). Default "100%". */
  length?: number | string;
  "data-connector"?: boolean;
};

/** Painted with `bg-current`, so its colour comes from the parent's `text-*`. */
export function Connector({
  orientation = "horizontal",
  length = "100%",
  className,
  style,
  ...rest
}: ConnectorProps) {
  const horizontal = orientation === "horizontal";
  const capClassName = cx(
    "shrink-0 bg-current",
    horizontal ? "h-full w-4" : "h-4 w-full",
  );
  const sizeStyle: CSSProperties = horizontal
    ? { width: length }
    : { height: length };

  return (
    <div
      aria-hidden="true"
      className={cx(
        "flex",
        horizontal ? "-my-px h-6 flex-row" : "-mx-px w-6 flex-col",
        className,
      )}
      style={{ ...sizeStyle, ...style }}
      {...rest}
    >
      <div
        className={capClassName}
        style={{
          clipPath: CONNECTOR_CLIP_PATHS[horizontal ? "left" : "top"],
        }}
      />
      <div
        className={cx(
          "grow bg-current",
          horizontal ? "-mx-px h-full" : "-my-px w-full",
        )}
      />
      <div
        className={capClassName}
        style={{
          clipPath: CONNECTOR_CLIP_PATHS[horizontal ? "right" : "bottom"],
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* GET | ACCESS                                                              */
/* ------------------------------------------------------------------------ */

// Hard-coded in the original Button (`length: 26`): the bridge is centred on
// the 48px pills, leaving 11px of the rounded ends free above and below.
const SPLIT_CONNECTOR_LENGTH = 26;

/**
 * The split black pill ("GET | ACCESS"): two pills joined by a notched
 * connector, with the orange status-ping dot in the top-right corner.
 */
export function GetAccessButton({
  href,
  words: [leftText, rightText],
}: {
  href: string;
  words: [string, string];
}) {
  return (
    <span className="contents">
      <Link className={buttonClassName("dark")} href={href}>
        <span data-text>
          <OdometerHoverText text={leftText} />
        </span>
        <Connector
          data-connector
          orientation="vertical"
          length={SPLIT_CONNECTOR_LENGTH}
        />
        <span data-text>
          <OdometerHoverText text={rightText} />
        </span>
        {/* PulseDot size-6 (classes already tailwind-merged, as on the live site). */}
        <span aria-hidden="true" className="flex size-6 absolute top-8 right-8">
          <span className="absolute animate-status-ping motion-reduce:hidden inline-flex rounded-full bg-accent size-6" />
          <span className="relative inline-flex rounded-full bg-accent size-6" />
        </span>
      </Link>
    </span>
  );
}
