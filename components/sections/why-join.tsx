import { AnimatedContent } from "@/components/hero/animated-content";
import { AnimatedText } from "@/components/hero/animated-text";
import { PixelIcon } from "@/components/sections/what-we-do";
import { whyJoin } from "@/content/activity";

function pad(n: number) {
  return String(n).padStart(3, "0");
}

const TAG =
  "inline-flex w-fit min-w-0 shrink-0 items-center gap-6 whitespace-nowrap rounded-4 px-6 py-4 font-mono text-caption-10 uppercase leading-none tracking-wide bg-current/10";

/** 06-pricing's bridge between the stacked blocks of a card. */
function CardConnector() {
  return (
    <div aria-hidden="true" className="flex justify-center">
      <div className="h-4 w-[90%] border-x border-black" />
    </div>
  );
}

/**
 * Section 9, "Why join?" (off-white): six cards styled like 06-pricing
 * (stacked black blocks joined by thin lines, mono tags, numbered list),
 * each with a pixel icon in its own brand colour.
 */
export function WhyJoin() {
  const { id, title, aside, cards, membersLabel, members, footnote } = whyJoin;
  const half = Math.ceil(members.length / 2);
  const columns = [members.slice(0, half), members.slice(half)];

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="bg-off-white py-72 text-black lg:py-160"
    >
      <div className="grid grid-cols-1 gap-x-16 gap-y-64 px-16 lg:grid-cols-12 lg:px-80">
        <h2
          id={`${id}-title`}
          className="whitespace-pre-line text-balance font-medium text-headline-10 lg:col-span-6 lg:row-start-1"
        >
          <AnimatedText>{title}</AnimatedText>
        </h2>

        <p className="flex items-center gap-12 font-mono text-caption-10 text-dark-grey uppercase lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:self-end lg:justify-self-end">
          <span aria-hidden="true" className="relative flex size-6">
            <span className="absolute inline-flex size-6 animate-status-ping rounded-full bg-accent motion-reduce:hidden" />
            <span className="relative inline-flex size-6 rounded-full bg-accent" />
          </span>
          <AnimatedText>{aside}</AnimatedText>
        </p>

        <ul className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:col-span-12 lg:row-start-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <li key={card.title} className="h-full">
              <AnimatedContent animationDelay={0.06 * (i % 3)} className="h-full">
                <article className="relative isolate flex h-full flex-col text-white">
                  <div className="flex flex-col gap-24 rounded-8 bg-black p-16 lg:gap-32 lg:p-32">
                    <div className="flex items-center justify-between gap-12">
                      <span className={TAG}>{pad(i + 1)}</span>
                      <PixelIcon icon={card.icon} className="h-16" />
                    </div>
                    <h3 className="text-balance font-medium text-body-30 lg:min-h-[2.5em]">
                      {card.title}
                    </h3>
                  </div>
                  <CardConnector />
                  <div className="flex flex-1 rounded-8 bg-black p-16 lg:p-32">
                    <p className="font-mono text-caption-10 text-ghost-grey uppercase">
                      {card.text}
                    </p>
                  </div>
                </article>
              </AnimatedContent>
            </li>
          ))}
        </ul>

        <AnimatedContent className="lg:col-span-12 lg:row-start-3">
          <div className="flex flex-col gap-24 rounded-8 bg-black p-16 text-white lg:p-32">
            <p className="font-mono text-caption-10 text-dark-grey uppercase">
              {membersLabel}
            </p>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-16">
              {columns.map((column, c) => (
                <ol
                  key={c}
                  start={c * half + 1}
                  className="flex flex-col gap-4 font-mono text-caption-10 uppercase"
                >
                  {column.map((member, j) => (
                    <li key={member} className="flex gap-24">
                      <span inert className="text-dark-grey tabular-nums">
                        {pad(c * half + j + 1)}
                      </span>
                      <span className="text-ghost-grey">{member}</span>
                    </li>
                  ))}
                </ol>
              ))}
            </div>
            <p className="font-mono text-caption-10 text-ghost-grey">{footnote}</p>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}
