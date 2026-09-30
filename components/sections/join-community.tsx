import type { ReactNode } from "react";

import { AnimatedContent } from "@/components/hero/animated-content";
import { AnimatedText } from "@/components/hero/animated-text";
import { Typewriter } from "@/components/hero/typewriter";
import { Connector, buttonClassName } from "@/components/hero/get-access-button";
import { OdometerHoverText } from "@/components/hero/odometer-hover-text";
import { PixelIcon } from "@/components/sections/what-we-do";
import { AsciiBackground } from "@/components/ui/ascii-background";
import { joinCommunity } from "@/content/activity";

// 05-reviews' dithered frame: a 4px checkerboard on black-deep.
const DITHER_STYLE = {
  backgroundImage:
    "repeating-conic-gradient(rgba(255,255,255,0.22) 0% 25%, transparent 0% 50%)",
  backgroundSize: "4px 4px",
};

function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

/** Plain anchor (external links open in a new tab). */
function ActionLink({
  href,
  className,
  label,
  children,
}: {
  href: string;
  className: string;
  label?: string;
  children: ReactNode;
}) {
  const external = isExternal(href);
  return (
    <a
      href={href}
      className={className}
      aria-label={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

/**
 * Section 8, "Join the community" (black, #community): the major CTA, built
 * like 05-reviews' big quote card: ASCII backdrop, dithered frame, large
 * typed headline, then the buttons and a figcaption-style signature.
 */
export function JoinCommunity() {
  const {
    id,
    eyebrow,
    tag,
    title,
    body,
    primary,
    secondary,
    signature,
    backgroundPhrases,
  } = joinCommunity;

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative isolate overflow-x-clip bg-black py-72 text-white lg:py-160"
    >
      <AsciiBackground phrases={backgroundPhrases} />

      <div className="px-16 lg:px-80">
        <AnimatedContent>
          <div
            className="rounded-8 bg-black-deep p-6 shadow-lg ring ring-black-deep lg:p-8"
            style={DITHER_STYLE}
          >
            <div className="flex min-h-420 flex-col justify-between gap-48 overflow-hidden rounded-4 bg-black p-24 ring-1 ring-white/10 lg:min-h-560 lg:gap-64 lg:p-48">
              <div className="flex flex-col gap-24 lg:gap-32">
                <div className="flex flex-wrap items-center justify-between gap-12">
                  <p className="font-mono text-caption-20 text-ghost-grey uppercase">
                    <AnimatedText>{eyebrow}</AnimatedText>
                  </p>
                  <span className="inline-flex w-fit min-w-0 shrink-0 items-center gap-8 whitespace-nowrap rounded-4 bg-current/10 px-6 py-4 font-mono text-caption-10 uppercase leading-none tracking-wide">
                    <span aria-hidden="true" className="relative flex size-6">
                      <span className="absolute inline-flex size-6 animate-status-ping rounded-full bg-accent motion-reduce:hidden" />
                      <span className="relative inline-flex size-6 rounded-full bg-accent" />
                    </span>
                    {tag}
                  </span>
                </div>
                <h2
                  id={`${id}-title`}
                  className="max-w-[22ch] text-balance font-medium text-headline-10 lg:text-[clamp(3rem,5vw,5.5rem)] lg:leading-[1.02]"
                >
                  <Typewriter
                    wrap
                    lines={[[title]]}
                    charDelay={32}
                    startDelay={300}
                  />
                </h2>
              </div>

              <div className="flex flex-col gap-32">
                <p className="max-w-[36rem] text-body-20 text-ghost-grey">
                  <AnimatedText animationDelay={0.2}>{body}</AnimatedText>
                </p>
                <div className="flex flex-col gap-32 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex flex-wrap items-center gap-12">
                    <ActionLink
                      href={primary.href}
                      label={primary.label}
                      className={buttonClassName("light")}
                    >
                      <span data-text>
                        <OdometerHoverText text={primary.words[0]} />
                      </span>
                      <Connector
                        data-connector
                        orientation="vertical"
                        length={26}
                      />
                      <span data-text>
                        <OdometerHoverText text={primary.words[1]} />
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute top-8 right-8 flex size-6"
                      >
                        <span className="absolute inline-flex size-6 animate-status-ping rounded-full bg-accent motion-reduce:hidden" />
                        <span className="relative inline-flex size-6 rounded-full bg-accent" />
                      </span>
                    </ActionLink>
                    {secondary.map((action) => (
                      <ActionLink
                        key={action.label}
                        href={action.href}
                        className={buttonClassName("light")}
                      >
                        <span data-text>
                          <OdometerHoverText text={action.label} />
                        </span>
                      </ActionLink>
                    ))}
                  </div>

                  <div className="flex shrink-0 items-center gap-16">
                    <div className="relative flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black-deep ring-1 ring-white/15">
                      <PixelIcon
                        icon={{ name: "program", color: "mint" }}
                        className="h-22"
                      />
                    </div>
                    <div className="min-w-0 font-mono text-caption-10 uppercase">
                      <p className="truncate text-white">{signature.name}</p>
                      <p className="truncate text-dark-grey">{signature.place}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}
