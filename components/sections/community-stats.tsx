import { AnimatedText } from "@/components/hero/animated-text";
import { Odometer } from "@/components/sections/people/odometer";
import { type CommunityStat, communityStats } from "@/content/people";

const HAS_DIGIT = /\d/;

/**
 * Section 14 — Community numbers (off-white). Data-driven: pass real
 * counters later (`items`), values with digits roll in like the 06-pricing
 * odometer, words reveal like the headlines. Sits right under Founding, so
 * it has no top padding of its own.
 */
export function CommunityStats({
  items = communityStats.items,
}: {
  items?: CommunityStat[];
}) {
  return (
    <section
      id="stats"
      aria-labelledby="stats-title"
      className="bg-off-white px-16 pb-72 text-black lg:px-80 lg:pb-160"
    >
      <h2 id="stats-title" className="sr-only">
        {communityStats.title}
      </h2>
      <p className="mb-24 font-mono text-caption-10 text-dark-grey uppercase">
        <AnimatedText>{communityStats.eyebrow}</AnimatedText>
      </p>
      <dl className="grid grid-cols-2 gap-x-16 gap-y-40 lg:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className="flex min-w-0 flex-col-reverse justify-end gap-12 border-black/15 border-t pt-16"
          >
            <dt className="flex gap-12 font-mono text-caption-10 uppercase">
              <span className="text-dark-grey tabular-nums" aria-hidden="true">
                {String(i + 1).padStart(3, "0")}
              </span>
              <span>{item.label}</span>
            </dt>
            <dd className="text-headline-10 leading-none lg:text-headline-20">
              {HAS_DIGIT.test(item.value) ? (
                <Odometer>{item.value}</Odometer>
              ) : (
                <AnimatedText animationDelay={0.05 * i}>{item.value}</AnimatedText>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
