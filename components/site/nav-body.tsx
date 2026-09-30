"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { buttonClassName } from "@/components/hero/get-access-button";
import {
  ODOMETER_HOVER_TRIGGER,
  OdometerHoverText,
} from "@/components/hero/odometer-hover-text";
import { cx } from "@/lib/cx";
import type { ChromeLink, NavLink } from "@/content/chrome";
import { scrollToHref, useActiveSection } from "./nav-active-section";
import { NavMarquee } from "./nav-marquee";
import { ProgramMark } from "./nav-program-mark";

type NavBodyProps = {
  brand: string;
  links: NavLink[];
  announcement?: string;
  primaryCta: ChromeLink;
  secondaryCta: ChromeLink;
};

/* The hero pill buttons, shrunk to the nav's 30px row. */
const SMALL_PILL =
  "text-caption-10! *:data-text:h-30! *:data-text:rounded-4! *:data-text:px-12! lg:*:data-text:px-12!";
const PRIMARY_PILL = cx(buttonClassName("light"), SMALL_PILL);
const SECONDARY_PILL = cx(
  buttonClassName("light"),
  SMALL_PILL,
  "*:data-text:bg-white/10! *:data-text:text-white! [&:hover_[data-text]]:bg-white/20!",
);

function PulseDot({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cx("flex size-6", className)}>
      <span className="absolute inline-flex size-6 animate-status-ping rounded-full bg-accent motion-reduce:hidden" />
      <span className="relative inline-flex size-6 rounded-full bg-accent" />
    </span>
  );
}

/**
 * Interactive part of the fixed nav: desktop link row with the sliding
 * active-section highlight, and the mobile "Menu +" drawer. Both share one
 * active-section tracker.
 */
export function NavBody({
  brand,
  links,
  announcement,
  primaryCta,
  secondaryCta,
}: NavBodyProps) {
  const sectionIds = links.flatMap((link) => (link.sectionId ? [link.sectionId] : []));
  const activeSection = useActiveSection(sectionIds);
  const activeHref =
    links.find((link) => link.sectionId && link.sectionId === activeSection)?.href ?? null;

  return (
    <>
      <DesktopNav
        brand={brand}
        links={links}
        activeHref={activeHref}
        announcement={announcement}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
      />
      <MobileNav
        brand={brand}
        links={links}
        activeHref={activeHref}
        announcement={announcement}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
      />
    </>
  );
}

type PartProps = NavBodyProps & { activeHref: string | null };

/* ------------------------------------------------------------------------ */
/* Desktop                                                                   */
/* ------------------------------------------------------------------------ */

function DesktopNav({
  brand,
  links,
  activeHref,
  announcement,
  primaryCta,
  secondaryCta,
}: PartProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  // The highlight stays on the last active link and fades out when no
  // section is active (the reference's layoutId pill does the same).
  const [lastHref, setLastHref] = useState<string | null>(null);
  if (activeHref && activeHref !== lastHref) setLastHref(activeHref);

  const [box, setBox] = useState<{
    left: number;
    width: number;
    /** False for the first placement, so the pill appears without sliding. */
    slide: boolean;
  } | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !lastHref) return;
    const measure = () => {
      const item = itemRefs.current.get(lastHref);
      if (!item) return;
      const left = item.offsetLeft;
      const width = item.offsetWidth;
      setBox((prev) =>
        prev && prev.left === left && prev.width === width
          ? prev
          : { left, width, slide: prev !== null },
      );
    };
    measure();
    // Widths change once the webfont loads.
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [lastHref]);

  const highlightStyle: CSSProperties = box
    ? {
        transform: `translateX(${box.left}px)`,
        width: box.width,
        opacity: activeHref ? 1 : 0,
        transitionProperty: box.slide ? "transform, width, opacity" : "opacity",
      }
    : { opacity: 0 };

  return (
    <div className="hidden flex-col gap-4 overflow-hidden rounded-4 bg-black p-4 ring-1 ring-white/10 lg:flex">
      <div className="flex items-center justify-between gap-16">
        <ul
          ref={listRef}
          className="relative flex items-center font-mono text-caption-10 uppercase"
        >
          <li className="nav-item-in mr-4" style={{ "--nav-i": 0 } as CSSProperties}>
            <Link
              href="/"
              aria-label={`${brand}, home`}
              onClick={(event) => scrollToHref(event, "/")}
              className="flex size-30 items-center justify-center text-white"
            >
              <ProgramMark className="size-24" />
            </Link>
          </li>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 h-full rounded-2 bg-white/8 ring-1 ring-white/15 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={highlightStyle}
          />
          {links.map((link, index) => {
            const current = link.href === activeHref;
            return (
              <li
                key={link.href}
                ref={(node) => {
                  if (node) itemRefs.current.set(link.href, node);
                  else itemRefs.current.delete(link.href);
                }}
                className="nav-item-in relative shrink-0"
                style={{ "--nav-i": index + 1 } as CSSProperties}
              >
                <a
                  href={link.href}
                  aria-current={current ? "true" : undefined}
                  onClick={(event) => scrollToHref(event, link.href)}
                  className={cx(
                    "relative z-1 flex h-30 items-center whitespace-nowrap px-12 transition-colors duration-300",
                    ODOMETER_HOVER_TRIGGER,
                    current ? "text-white" : "text-white/55 hover:text-white",
                  )}
                >
                  <OdometerHoverText text={link.label} />
                  {link.pulse ? <PulseDot className="absolute top-6 right-6" /> : null}
                </a>
              </li>
            );
          })}
        </ul>
        <div
          className="nav-item-in flex shrink-0 items-center gap-4"
          style={{ "--nav-i": links.length + 1 } as CSSProperties}
        >
          <a
            href={secondaryCta.href}
            onClick={(event) => scrollToHref(event, secondaryCta.href)}
            className={SECONDARY_PILL}
          >
            <span data-text>
              <OdometerHoverText text={secondaryCta.label} />
            </span>
          </a>
          <a
            href={primaryCta.href}
            onClick={(event) => scrollToHref(event, primaryCta.href)}
            className={PRIMARY_PILL}
          >
            <span data-text>
              <OdometerHoverText text={primaryCta.label} />
            </span>
          </a>
        </div>
      </div>
      {announcement ? <NavMarquee text={announcement} /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Mobile                                                                    */
/* ------------------------------------------------------------------------ */

const MENU_EASE = "cubic-bezier(0.42, 0, 0.58, 1)"; // easeInOut, 320ms
const ITEM_EASE = "cubic-bezier(0, 0, 0.58, 1)"; // easeOut

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="relative grid size-24 shrink-0 place-items-center rounded-2 bg-white/10 transition-colors group-hover:bg-white/20"
    >
      <span className="h-px w-10 bg-current" />
      <span
        className="absolute h-10 w-px bg-current motion-safe:transition-transform"
        style={{
          transform: open ? "rotate(90deg)" : "none",
          transitionDuration: "320ms",
          transitionTimingFunction: MENU_EASE,
        }}
      />
    </span>
  );
}

function MobileNav({
  brand,
  links,
  activeHref,
  announcement,
  primaryCta,
  secondaryCta,
}: PartProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const items: Array<{ key: string; node: ReactNode }> = [
    ...links.map((link) => {
      const current = link.href === activeHref;
      return {
        key: link.href,
        node: (
          <a
            href={link.href}
            aria-current={current ? "true" : undefined}
            onClick={(event) => {
              scrollToHref(event, link.href);
              setOpen(false);
            }}
            className={cx(
              "flex w-fit items-center gap-8 py-6 transition-colors duration-300",
              current ? "text-white" : "text-white/55 hover:text-white",
            )}
          >
            {link.label}
            {link.pulse ? <PulseDot className="relative" /> : null}
          </a>
        ),
      };
    }),
    {
      key: "ctas",
      node: (
        <div className="mt-6 flex flex-col gap-4 border-white/10 border-t pt-8 pb-2">
          <a
            href={primaryCta.href}
            onClick={(event) => {
              scrollToHref(event, primaryCta.href);
              setOpen(false);
            }}
            className={cx(PRIMARY_PILL, "w-full *:data-text:w-full")}
          >
            <span data-text>
              <OdometerHoverText text={primaryCta.label} />
            </span>
          </a>
          <a
            href={secondaryCta.href}
            onClick={(event) => {
              scrollToHref(event, secondaryCta.href);
              setOpen(false);
            }}
            className={cx(SECONDARY_PILL, "w-full *:data-text:w-full")}
          >
            <span data-text>
              <OdometerHoverText text={secondaryCta.label} />
            </span>
          </a>
        </div>
      ),
    },
  ];

  return (
    <div ref={rootRef} className="relative font-mono text-caption-10 uppercase lg:hidden">
      <div className="flex w-fit min-w-160 flex-col overflow-hidden rounded-4 bg-black p-4 ring-1 ring-white/10">
        <div className="flex items-center">
          <Link
            href="/"
            aria-label={`${brand}, home`}
            onClick={(event) => {
              scrollToHref(event, "/");
              setOpen(false);
            }}
            className="flex size-24 items-center justify-center text-white"
          >
            <ProgramMark className="size-18" />
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="site-nav-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className="group flex flex-1 cursor-pointer items-center justify-between gap-24 pl-12 text-white"
          >
            <span>Menu</span>
            <MenuIcon open={open} />
          </button>
        </div>
        <div
          id="site-nav-menu"
          inert={!open}
          className="grid motion-safe:transition-[grid-template-rows,opacity]"
          style={{
            gridTemplateRows: open ? "1fr" : "0fr",
            opacity: open ? 1 : 0,
            transitionDuration: "320ms",
            transitionTimingFunction: MENU_EASE,
          }}
        >
          <div className="min-h-0 overflow-hidden">
            <ul className="mt-4 flex flex-col border-white/10 border-t pt-4">
              {items.map((item, index) => (
                <li
                  key={item.key}
                  className="motion-safe:transition-[opacity,transform]"
                  style={{
                    opacity: open ? 1 : 0,
                    transform: open ? "none" : "translateX(-8px)",
                    transitionDuration: "320ms",
                    transitionTimingFunction: ITEM_EASE,
                    transitionDelay: open ? `${80 + 50 * index}ms` : "0ms",
                  }}
                >
                  {item.node}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {announcement ? <NavMarquee text={announcement} className="mt-4" /> : null}
      </div>
    </div>
  );
}
