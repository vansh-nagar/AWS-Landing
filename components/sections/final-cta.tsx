import Link from "next/link";

import { AnimatedContent } from "@/components/hero/animated-content";
import { AnimatedText } from "@/components/hero/animated-text";
import {
  buttonClassName,
  GetAccessButton,
} from "@/components/hero/get-access-button";
import { OdometerHoverText } from "@/components/hero/odometer-hover-text";
import { TerminalWindow } from "@/components/ui/terminal-window";
import { FINAL_CTA_ASCII, finalCta } from "@/content/chrome";
import { cx } from "@/lib/cx";

// Geist Mono advances 0.6em per glyph, so `cols * 0.6` em fill the width.
// Same sizing as the reference callout: calc(100cqw / (cols * 0.6)).
const GLYPH_ADVANCE = 0.6;

function AsciiArt({
  art,
  className,
}: {
  art: { cols: number; lines: readonly string[] };
  className?: string;
}) {
  return (
    <pre
      aria-hidden="true"
      className={cx(
        "m-0 w-full overflow-hidden whitespace-pre font-mono font-normal leading-none",
        className,
      )}
      style={{ fontSize: `calc(100cqw / ${(art.cols * GLYPH_ADVANCE).toFixed(2)})` }}
    >
      {art.lines.join("\n")}
    </pre>
  );
}

/**
 * Section 20: the closing call to action, modelled on the reference's
 * calloutSection: "Ready to build?" set as figlet ASCII art inside the
 * dithered terminal window, then the sub copy, the two buttons and the
 * group's name. One line of art from lg up, two stacked lines below.
 */
export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="bg-off-white px-16 py-72 text-black lg:p-80"
    >
      <TerminalWindow
        title={finalCta.windowTitle}
        bodyClassName="@container overflow-hidden"
      >
        <h2 id="final-cta-title" className="m-0">
          <span className="sr-only">{finalCta.headline}</span>
          <AsciiArt art={FINAL_CTA_ASCII.wide} className="hidden lg:block" />
          <AsciiArt art={FINAL_CTA_ASCII.narrow} className="lg:hidden" />
        </h2>
      </TerminalWindow>

      <div className="mt-32 grid grid-cols-1 gap-24 lg:mt-48 lg:grid-cols-12 lg:items-start lg:gap-x-16">
        <div className="lg:col-span-5">
          <AnimatedText as="div" className="w-full text-body-20 text-dark-grey">
            {finalCta.body}
          </AnimatedText>
        </div>
        <AnimatedContent
          className="lg:col-span-6 lg:col-start-7"
          animationDelay={0.15}
        >
          <div className="flex flex-col gap-16 lg:items-end">
            <div className="flex flex-wrap items-center gap-8">
              <GetAccessButton
                href={finalCta.primaryCta.href}
                words={finalCta.primaryCta.words}
              />
              <Link
                className={buttonClassName("light")}
                href={finalCta.secondaryCta.href}
              >
                <span data-text>
                  <OdometerHoverText text={finalCta.secondaryCta.label} />
                </span>
              </Link>
            </div>
            <p className="font-mono text-caption-10 text-dark-grey uppercase">
              {finalCta.signature}
            </p>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}
