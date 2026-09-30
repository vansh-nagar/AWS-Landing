import {
  ODOMETER_HOVER_TRIGGER,
  OdometerHoverText,
} from "@/components/hero/odometer-hover-text";
import { ProgramMark } from "@/components/site/nav-program-mark";
import { AsciiBackground } from "@/components/ui/ascii-background";
import { type ChromeLink, footer } from "@/content/chrome";
import { cx } from "@/lib/cx";
import { SiteFooterReveal } from "./site-footer-reveal";

const LINK_CLASS = cx(
  "group inline-flex items-baseline gap-12 font-mono text-caption-20 uppercase text-white/70 transition-colors hover:text-white",
  ODOMETER_HOVER_TRIGGER,
);

function externalProps(link: ChromeLink) {
  return link.external && link.href.startsWith("http")
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
}

function ColumnTitle({ children }: { children: string }) {
  return (
    <p className="font-mono text-caption-10 text-white/40 uppercase tracking-wide">
      {children}
    </p>
  );
}

function Index({ n }: { n: number }) {
  return (
    <span aria-hidden="true" className="text-white/30 tabular-nums">
      {String(n).padStart(3, "0")}
    </span>
  );
}

/**
 * Section 21: the footer, in the reference footer's language (dark ASCII
 * field, mono uppercase links with odometer hover, thin rule, © line).
 * Carries id="contact" for the nav and the program's required disclaimer.
 */
export function SiteFooter() {
  const { contact } = footer;
  return (
    <footer
      id="contact"
      className="relative isolate overflow-hidden bg-black px-16 py-72 text-white lg:p-80"
    >
      <AsciiBackground phrases={footer.backgroundPhrases} />
      <SiteFooterReveal>
        <div className="flex flex-col gap-48 lg:gap-64">
          <div className="grid grid-cols-1 gap-48 lg:grid-cols-12 lg:gap-x-16">
            <div className="flex flex-col gap-16 lg:col-span-5">
              <ProgramMark className="size-40 text-brand-purple" />
              <p className="text-balance font-medium text-headline-10">
                {footer.brand}
              </p>
              <p className="w-full max-w-480 text-body-20 text-ghost-grey">
                {footer.tagline}
              </p>
            </div>

            <nav
              aria-label="Footer"
              className="grid grid-cols-1 gap-x-16 gap-y-40 sm:grid-cols-2 lg:col-span-7 lg:col-start-6 lg:flex lg:justify-end lg:gap-x-64"
            >
              {footer.columns.map((column) => (
                <div key={column.title} className="flex flex-col gap-16">
                  <ColumnTitle>{column.title}</ColumnTitle>
                  <ul className="flex flex-col gap-12">
                    {column.links.map((link, index) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className={LINK_CLASS}
                          {...externalProps(link)}
                        >
                          <Index n={index + 1} />
                          <OdometerHoverText text={link.label} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="flex flex-col gap-16">
                <ColumnTitle>{contact.title}</ColumnTitle>
                <address className="flex flex-col gap-12 not-italic">
                  <a
                    href={contact.instagram.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cx(LINK_CLASS, "normal-case")}
                  >
                    <span className="text-white/30">IG</span>
                    <span className="sr-only">Instagram: </span>
                    <OdometerHoverText text={contact.instagram.handle} />
                  </a>
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} className={cx(LINK_CLASS, "normal-case")}>
                      <span className="text-white/30">@</span>
                      <OdometerHoverText text={contact.email} />
                    </a>
                  ) : null}
                </address>
              </div>
            </nav>
          </div>

          <div className="flex flex-col gap-24">
            <div aria-hidden="true" className="h-px w-full bg-current/10" />
            <div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:justify-between lg:gap-64">
              <p className="font-mono text-caption-20 uppercase">{footer.copyright}</p>
              <p className="w-full max-w-560 font-mono text-caption-10 text-white/50 uppercase">
                {footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </SiteFooterReveal>
    </footer>
  );
}
