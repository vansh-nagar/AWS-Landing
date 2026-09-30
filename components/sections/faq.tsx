import Link from "next/link";
import { buttonClassName, Connector } from "@/components/hero/get-access-button";
import { OdometerHoverText } from "@/components/hero/odometer-hover-text";
import { AsciiBackground } from "@/components/ui/ascii-background";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { type FaqItem, faqItems, faqSection } from "@/content/proof";

/** Same bridge length as the hero's split button (26px on 48px pills). */
const SPLIT_CONNECTOR_LENGTH = 26;

/**
 * 19. FAQ (black, #faq). Port of the reference 07-faq: ASCII field behind,
 * left column (lg: sticky) with the headline and a light split CTA, right
 * column the "Q.001 / QUESTION" accordion. Emits FAQPage JSON-LD like the
 * reference.
 */
export function Faq({ items = faqItems }: { items?: FaqItem[] }) {
  const s = faqSection;
  const titleId = `${s.id}-title`;
  const [leftWord, rightWord] = s.cta.words;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer.join("\n\n") },
    })),
  };

  return (
    <section
      id={s.id}
      aria-labelledby={titleId}
      className="relative isolate bg-black px-16 py-72 text-white lg:px-80 lg:py-160"
    >
      <AsciiBackground phrases={s.backgroundPhrases} />
      <script
        type="application/ld+json"
        // Escape "<" so answer text can never close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="grid grid-cols-1 gap-x-16 gap-y-64 lg:grid-cols-12 lg:gap-y-32">
        <div className="contents lg:sticky lg:top-80 lg:col-span-4 lg:flex lg:max-h-[calc(100svh-(--spacing(160)))] lg:flex-col lg:justify-between lg:self-stretch">
          <h2 id={titleId} className="text-balance font-medium text-headline-10">
            {s.title}
          </h2>
          <div className="order-last lg:order-0">
            <Link
              className={buttonClassName("light")}
              href={s.cta.href}
              aria-label={`${leftWord} ${rightWord}`}
            >
              <span data-text>
                <OdometerHoverText text={leftWord} />
              </span>
              <Connector
                data-connector
                orientation="vertical"
                length={SPLIT_CONNECTOR_LENGTH}
              />
              <span data-text>
                <OdometerHoverText text={rightWord} />
              </span>
            </Link>
          </div>
        </div>
        <FaqAccordion items={items} className="lg:col-span-7 lg:col-start-6" />
      </div>
    </section>
  );
}
