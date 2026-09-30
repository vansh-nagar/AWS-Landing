import { AnimatedContent } from "@/components/hero/animated-content";
import { AnimatedText } from "@/components/hero/animated-text";
import { MainHeroTypewriter } from "@/components/hero/main-hero-typewriter";
import { Typewriter } from "@/components/hero/typewriter";

const TYPEWRITER_CHUNKS = [
  "NEXT 16.x",
  "ASTRO 7.x",
  "SANITY v6",
  "TS: STRICT",
  "AGENTS.MD: LOADED",
  "MCP: 2 SERVERS",
  "DRIFT: 0",
];

/** Lab for the hero's text motion: the hero's left column, buttons stubbed. */
export default function TextLab() {
  return (
    <>
      <div
        data-page-builder-section="mainHeroSection"
        className="relative grid min-h-svh grid-cols-1 grid-rows-[auto_80vh] gap-x-16 bg-off-white text-black lg:grid-cols-12 lg:grid-rows-1"
      >
        <div className="flex flex-col gap-48 px-16 pt-160 pb-48 lg:col-span-5 lg:justify-center lg:pt-64 lg:pr-0 lg:pl-80">
          <div className="my-auto">
            <p className="mb-20 font-mono text-caption-20 uppercase">
              <AnimatedText>Full-stack kit for Next.js and Astro.</AnimatedText>
            </p>
            <h1 className="mb-32 whitespace-pre-line text-balance font-medium text-headline-20">
              <AnimatedText animationDelay={0.1}>
                The stack agents don&apos;t reinvent.
              </AnimatedText>
            </h1>
            <div className="w-full text-body-20 text-dark-grey">
              <AnimatedText
                animationDelay={0.2}
                as="div"
                splitSelector="[data-text]"
                className="flex w-full flex-col gap-[1em] [&_[data-text]>*:not(:first-child)]:indent-0"
              >
                <div className="empty:h-[1lh]" data-text>
                  Frontend, Sanity schema, fetch layer, SEO, redirects, forms:
                  six years of decisions, committed. AGENTS.md and a dozen
                  skills load them before your first prompt, and two MCP
                  servers let the agent check its own work.
                </div>
              </AnimatedText>
            </div>
            <AnimatedContent className="mt-32" animationDelay={0.3}>
              <div className="flex flex-wrap items-center gap-8">
                {/* Placeholder for GET|ACCESS + WATCH REEL (buttons agent). */}
                <div className="h-48 w-[196px] rounded-4 bg-black" />
                <div className="h-48 w-[150px] rounded-4 bg-black" />
              </div>
            </AnimatedContent>
          </div>
          <div className="hidden lg:block">
            <MainHeroTypewriter chunks={TYPEWRITER_CHUNKS} />
          </div>
        </div>
        <div className="relative overflow-hidden bg-black lg:col-span-6 lg:col-start-7 lg:aspect-auto" />
      </div>

      {/* Below the fold: viewport-gated variants. */}
      <section className="flex flex-col gap-48 bg-off-white px-16 py-160 text-black lg:px-80">
        <p className="font-mono text-caption-20 uppercase">
          <AnimatedText>Viewport-gated line reveal.</AnimatedText>
        </p>
        <div className="max-w-[40ch] text-body-30 lg:text-headline-10">
          <Typewriter
            wrap
            charDelay={18}
            lines={[
              ["Frontend, Sanity schema, fetch layer, SEO, redirects, forms."],
              ["Six years of decisions, committed."],
            ]}
          />
        </div>
      </section>
    </>
  );
}
