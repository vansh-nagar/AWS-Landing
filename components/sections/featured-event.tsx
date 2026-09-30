import Link from "next/link";
import type { ReactNode } from "react";

import { AnimatedText } from "@/components/hero/animated-text";
import { buttonClassName, Connector } from "@/components/hero/get-access-button";
import { OdometerHoverText } from "@/components/hero/odometer-hover-text";
import { PixelIcon } from "@/components/sections/identity-strip";
import { featuredEvent, upcomingEvents } from "@/content/story";
import { cx } from "@/lib/cx";

/* Tag pill from the reference pricing cards ("NEXT.JS", "AVAILABLE NOW"). */
const TAG =
  "inline-flex w-fit min-w-0 shrink-0 items-center whitespace-nowrap rounded-4 bg-current/10 px-6 py-4 font-mono text-caption-10 uppercase leading-none tracking-wide";

function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx(TAG, "gap-6", className)}>{children}</span>;
}

/** Orange ping dot + label, as in the reference "AVAILABLE NOW" tag. */
function StatusTag({ children }: { children: ReactNode }) {
  return (
    <span className={cx(TAG, "gap-8")}>
      <span aria-hidden="true" className="relative flex size-6">
        <span className="absolute inline-flex size-6 animate-status-ping rounded-full bg-accent motion-reduce:hidden" />
        <span className="relative inline-flex size-6 rounded-full bg-accent" />
      </span>
      {children}
    </span>
  );
}

/** The notched bridge between stacked card blocks (reference pricing card). */
function CardSeam() {
  return (
    <div aria-hidden="true" className="flex justify-center">
      <div className="h-4 border-black border-x" style={{ width: "90%" }} />
    </div>
  );
}

/** Light split pill ("REGISTER | ON MEETUP"), same build as the pricing card's GET | ACCESS. */
function SplitLightButton({ href, words }: { href: string; words: [string, string] }) {
  return (
    <Link className={buttonClassName("light")} href={href}>
      <span data-text>
        <OdometerHoverText text={words[0]} />
      </span>
      <Connector data-connector orientation="vertical" length={26} />
      <span data-text>
        <OdometerHoverText text={words[1]} />
      </span>
    </Link>
  );
}

const pad = (n: number) => String(n).padStart(3, "0");

/**
 * Section 5 (id="events"): modelled on the reference pricing section. A dark
 * featured-event card built from three stacked blocks (title, numbered meta,
 * actions), then three smaller upcoming-event cards.
 */
export function FeaturedEvent() {
  const event = featuredEvent;
  return (
    <section
      id="events"
      aria-labelledby="events-title"
      data-page-builder-section="featuredEventSection"
      className="bg-off-white py-72 text-black lg:py-160"
    >
      <div className="grid grid-cols-1 gap-x-16 gap-y-64 px-16 lg:grid-cols-12 lg:px-80">
        <h2
          id="events-title"
          className="whitespace-pre-line text-balance font-medium text-headline-10 lg:col-span-6 lg:row-start-1"
        >
          <AnimatedText>{event.heading}</AnimatedText>
        </h2>
        <div className="flex items-center gap-12 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:self-end lg:justify-self-end">
          <PixelIcon name="program" className="h-20 text-black" />
          <p className="font-mono text-caption-10 text-dark-grey uppercase">
            <AnimatedText>{event.note}</AnimatedText>
          </p>
        </div>

        {/* Featured event card */}
        <article
          aria-labelledby="featured-event-title"
          className="relative isolate flex flex-col text-white lg:col-span-12 lg:row-start-2"
        >
          <div className="flex flex-col gap-12 rounded-8 bg-black p-16 lg:gap-24 lg:p-32">
            <div className="flex items-center justify-between gap-12">
              <Tag>{event.tag}</Tag>
              <StatusTag>{event.status}</StatusTag>
            </div>
            <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-12">
              <h3
                id="featured-event-title"
                className="text-balance text-headline-10 lg:col-span-7"
              >
                {event.title}
              </h3>
              <p className="max-w-[52ch] text-body-20 text-mid-grey lg:col-span-5 lg:self-end">
                {event.description}
              </p>
            </div>
          </div>
          <CardSeam />
          <div className="rounded-8 bg-black p-16 lg:p-32">
            <dl className="font-mono text-caption-10 uppercase lg:columns-2 lg:gap-x-64">
              {event.meta.map((item, i) => (
                <div key={item.label} className="flex break-inside-avoid gap-24 py-2">
                  <dt className="flex shrink-0 gap-24 text-dark-grey">
                    <span inert className="tabular-nums">
                      {pad(i + 1)}
                    </span>
                    <span className="w-[9ch]">{item.label}</span>
                  </dt>
                  <dd className="text-ghost-grey">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <CardSeam />
          <div className="flex flex-wrap items-center gap-x-24 gap-y-16 rounded-8 bg-black p-16 lg:p-32">
            <SplitLightButton href={event.register.href} words={event.register.words} />
            <Link
              href={event.view.href}
              className="font-mono text-body-10 text-ghost-grey uppercase underline decoration-dashed decoration-from-font underline-offset-3 transition-colors hover:text-white"
            >
              {event.view.text}
            </Link>
          </div>
        </article>

        {/* Upcoming events */}
        <div className="flex flex-col gap-24 lg:col-span-12 lg:row-start-3">
          <h3 className="font-mono text-caption-20 uppercase">
            <Link
              href={upcomingEvents.href}
              className="group inline-flex items-center gap-8"
            >
              {upcomingEvents.heading}
              <span
                aria-hidden="true"
                className="transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-4"
              >
                →
              </span>
            </Link>
          </h3>
          <ul className="grid grid-cols-1 gap-16 md:grid-cols-3">
            {upcomingEvents.items.map((item, i) => (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className="group flex h-full min-h-160 flex-col justify-between gap-32 rounded-8 bg-black p-16 text-white transition-colors duration-300 hover:bg-black-deep lg:min-h-240 lg:p-32"
                >
                  <span className="flex items-center justify-between gap-12">
                    <Tag className="tabular-nums">{pad(i + 1)}</Tag>
                    <Tag>{item.date}</Tag>
                  </span>
                  <span className="flex flex-col gap-12">
                    <span className="text-balance text-body-30">{item.title}</span>
                    <span className="font-mono text-caption-10 text-dark-grey uppercase">
                      {item.location}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
