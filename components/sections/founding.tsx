import Link from "next/link";

import { AnimatedContent } from "@/components/hero/animated-content";
import { AnimatedText } from "@/components/hero/animated-text";
import { buttonClassName, Connector } from "@/components/hero/get-access-button";
import { OdometerHoverText } from "@/components/hero/odometer-hover-text";
import { AvatarStack } from "@/components/sections/people/avatar-stack";
import { Odometer } from "@/components/sections/people/odometer";
import { founding } from "@/content/people";
import { cx } from "@/lib/cx";

const TAG =
  "inline-flex w-fit min-w-0 shrink-0 items-center whitespace-nowrap rounded-4 px-6 py-4 font-mono text-caption-10 uppercase leading-none tracking-wide bg-current/10";

/** The small bridge between stacked card panels (06-pricing). */
function PanelJoint() {
  return (
    <div aria-hidden="true" className="flex justify-center">
      <div className="h-4 border-black border-x" style={{ width: "90%" }} />
    </div>
  );
}

/** Section 13 — Founding community (off-white), modelled on 06-pricing's top. */
export function Founding() {
  const { card, cta } = founding;

  return (
    <section
      id="founding"
      aria-labelledby="founding-title"
      className="bg-off-white py-72 text-black lg:py-160"
    >
      <div className="grid grid-cols-1 gap-x-16 gap-y-48 px-16 lg:grid-cols-12 lg:gap-y-64 lg:px-80">
        <h2
          id="founding-title"
          className="whitespace-pre-line text-balance font-medium text-headline-10 lg:col-span-6 lg:row-start-1"
        >
          <AnimatedText>{founding.title}</AnimatedText>
        </h2>

        <div className="group flex items-center gap-12 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:self-end lg:justify-self-end">
          <AvatarStack />
          <p className="font-mono text-caption-10 text-dark-grey uppercase">
            <AnimatedText>{founding.stackLabel}</AnimatedText>
          </p>
        </div>

        <div className="w-full max-w-600 text-body-20 text-dark-grey lg:col-span-5 lg:row-start-2">
          <AnimatedText as="div" animationDelay={0.1}>
            {founding.body}
          </AnimatedText>
        </div>

        <AnimatedContent
          className="lg:col-span-6 lg:col-start-7 lg:row-start-2"
          animationDelay={0.2}
        >
          <div className="relative isolate flex h-full flex-col text-white">
            <div className="flex flex-col gap-12 rounded-8 bg-black p-16 lg:p-32">
              <div className="flex items-center justify-between gap-12">
                <span className={cx(TAG, "gap-6")}>{card.tag}</span>
                <span className={cx(TAG, "gap-8")}>
                  <span aria-hidden="true" className="relative flex size-6">
                    <span className="absolute inline-flex size-6 animate-status-ping rounded-full bg-accent motion-reduce:hidden" />
                    <span className="relative inline-flex size-6 rounded-full bg-accent" />
                  </span>
                  {card.status}
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-16 gap-y-12">
                <Odometer className="text-headline-20 leading-none">{card.figure}</Odometer>
                <span className="font-mono text-caption-10 text-white/60 uppercase">
                  {card.figureLabel}
                </span>
              </div>
            </div>
            <PanelJoint />
            <ul className="flex flex-1 flex-col gap-4 rounded-8 bg-black p-16 font-mono text-caption-10 uppercase lg:p-32">
              {card.points.map((point, i) => (
                <li key={point} className="flex gap-24">
                  <span className="text-dark-grey tabular-nums" inert>
                    {String(i + 1).padStart(3, "0")}
                  </span>
                  <span className="text-ghost-grey">{point}</span>
                </li>
              ))}
            </ul>
            <PanelJoint />
            <div className="flex flex-col gap-12 rounded-8 bg-black p-16 lg:p-32">
              <Link className={buttonClassName("light")} href={cta.href}>
                <span data-text>
                  <OdometerHoverText text={cta.words[0]} />
                </span>
                <Connector data-connector orientation="vertical" length={26} />
                <span data-text>
                  <OdometerHoverText text={cta.words[1]} />
                </span>
              </Link>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}
