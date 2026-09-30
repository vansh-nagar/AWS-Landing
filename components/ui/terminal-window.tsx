import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * Dark "terminal" window with the dithered border, cloned from the reference
 * textTerminalSection / the-repo / calloutSection chrome:
 * a black-deep frame filled with a 4px checkerboard (the "dither"), an inner
 * #232323 panel with a 26px mono title bar, and a 16px-padded body.
 *
 * Server component. Pass `bodyClassName` to change the body padding/overflow
 * (e.g. `p-0` for full-bleed content).
 */
export function TerminalWindow({
  title,
  children,
  className,
  bodyClassName,
  titleId,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Optional id on the title span, for aria-labelledby. */
  titleId?: string;
}) {
  return (
    <div className={cx("relative", className)}>
      <div
        className="rounded-8 bg-black-deep p-6 shadow-lg ring ring-black-deep lg:p-8"
        style={{
          backgroundImage:
            "repeating-conic-gradient(rgba(255,255,255,0.22) 0% 25%, transparent 0% 50%)",
          backgroundSize: "4px 4px",
        }}
      >
        <div className="isolate flex flex-col overflow-hidden rounded-4 bg-black font-mono text-caption-10 text-white ring-1 ring-white/10">
          <div className="flex h-26 shrink-0 items-center border-white/10 border-b px-16">
            <span id={titleId} className="text-white/40 uppercase tracking-wide">
              {title}
            </span>
          </div>
          <div className={cx("p-16", bodyClassName)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
