import { AnimatedContent } from "@/components/hero/animated-content";
import { AnimatedText } from "@/components/hero/animated-text";
import { Typewriter } from "@/components/hero/typewriter";
import { PixelIcon } from "@/components/sections/what-we-do";
import { builderJourney } from "@/content/activity";

function pad(n: number) {
  return String(n).padStart(3, "0");
}

const TAG =
  "inline-flex w-fit min-w-0 shrink-0 items-center gap-6 whitespace-nowrap rounded-4 px-6 py-4 font-mono text-caption-10 uppercase leading-none tracking-wide bg-current/10";

/**
 * The thin two-line bridge between stacked cards (06-pricing's
 * `h-4 border-x border-black`), turned horizontal between cards from lg up.
 */
function StepConnector() {
  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 justify-center lg:flex-col lg:justify-center"
    >
      <div className="h-12 w-[90%] border-x border-black lg:h-[90%] lg:w-12 lg:border-x-0 lg:border-y" />
    </div>
  );
}

/**
 * Section 7, "Builder journey" (off-white): Discover → Learn → Build → Share
 * → Connect → Grow as six black step cards joined by thin connector lines.
 * Horizontal from lg up, a vertical pipeline below.
 */
export function BuilderJourney() {
  const { id, eyebrow, title, body, steps } = builderJourney;

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="bg-off-white py-72 text-black lg:py-160"
    >
      <div className="grid grid-cols-1 gap-x-16 gap-y-48 px-16 lg:grid-cols-12 lg:gap-y-64 lg:px-80">
        <div className="flex flex-col gap-20 lg:col-span-6">
          <p className="font-mono text-caption-20 uppercase">
            <AnimatedText>{eyebrow}</AnimatedText>
          </p>
          <h2
            id={`${id}-title`}
            className="whitespace-pre-line text-balance font-medium text-headline-10"
          >
            <AnimatedText animationDelay={0.1}>{title}</AnimatedText>
          </h2>
        </div>

        <div className="flex flex-col gap-24 lg:col-span-5 lg:col-start-8 lg:self-end">
          <p className="text-body-20 text-dark-grey">
            <AnimatedText animationDelay={0.2}>{body}</AnimatedText>
          </p>
          <Typewriter
            wrap
            lines={[steps.map((s, i) => (i === 0 ? s.title : `→ ${s.title}`))]}
            charDelay={36}
            startDelay={400}
            className="font-mono text-caption-10 uppercase"
          />
        </div>

        <ol className="flex flex-col lg:col-span-12 lg:flex-row lg:items-stretch">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col lg:flex-1 lg:flex-row">
              {i > 0 ? <StepConnector /> : null}
              <AnimatedContent
                animationDelay={0.08 * i}
                className="lg:flex-1"
              >
                <article className="flex w-full flex-col justify-between gap-16 rounded-8 bg-black p-16 text-white lg:min-h-248 lg:gap-32 lg:p-24">
                  <div className="flex items-center justify-between gap-12">
                    <span className={TAG}>
                      {i === 0 ? (
                        <span
                          aria-hidden="true"
                          className="relative flex size-6"
                        >
                          <span className="absolute inline-flex size-6 animate-status-ping rounded-full bg-accent motion-reduce:hidden" />
                          <span className="relative inline-flex size-6 rounded-full bg-accent" />
                        </span>
                      ) : null}
                      {pad(i + 1)}
                      {i === 0 ? <span className="sr-only"> (start here)</span> : null}
                    </span>
                    <PixelIcon icon={step.icon} className="h-14" />
                  </div>
                  <div className="flex flex-col gap-8">
                    <h3 className="font-medium text-body-30">{step.title}</h3>
                    <p className="text-body-10 text-ghost-grey">{step.text}</p>
                  </div>
                </article>
              </AnimatedContent>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
