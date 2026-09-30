import Link from "next/link";

import { AnimatedContent } from "@/components/hero/animated-content";
import { AnimatedText } from "@/components/hero/animated-text";
import {
  buttonClassName,
  GetAccessButton,
} from "@/components/hero/get-access-button";
import { MainHeroScrollCue } from "@/components/hero/main-hero-scroll-cue";
import { MainHeroTypewriter } from "@/components/hero/main-hero-typewriter";
import { OdometerHoverText } from "@/components/hero/odometer-hover-text";
import { Spiral } from "@/components/hero/spiral";
import { hero } from "@/content/hero";

export function MainHero() {
  return (
    <div
      id="home"
      data-page-builder-section="mainHeroSection"
      className="relative grid min-h-svh grid-cols-1 grid-rows-[auto_80vh] gap-x-16 bg-off-white text-black lg:grid-cols-12 lg:grid-rows-1"
    >
      <div className="flex flex-col gap-48 px-16 pt-160 pb-48 lg:col-span-5 lg:justify-center lg:pt-64 lg:pr-0 lg:pl-80">
        <div className="my-auto">
          <p className="mb-20 font-mono text-caption-20 uppercase">
            <AnimatedText>{hero.eyebrow}</AnimatedText>
          </p>
          <h1 className="mb-32 whitespace-pre-line text-balance font-medium text-headline-20">
            <AnimatedText animationDelay={0.1}>{hero.title}</AnimatedText>
          </h1>
          <div className="w-full text-body-20 text-dark-grey">
            <AnimatedText
              animationDelay={0.2}
              as="div"
              splitSelector="[data-text]"
              className="flex w-full flex-col gap-[1em] [&_[data-text]>*:not(:first-child)]:indent-0"
            >
              <div className="empty:h-[1lh] text-black" data-text>
                {hero.subtitle}
              </div>
              <div className="empty:h-[1lh]" data-text>
                {hero.description}
              </div>
            </AnimatedText>
          </div>
          <AnimatedContent className="mt-32" animationDelay={0.3}>
            <div className="flex flex-wrap items-center gap-8">
              <GetAccessButton
                href={hero.primaryCta.href}
                words={hero.primaryCta.words}
              />
              <Link
                className={buttonClassName("light")}
                href={hero.secondaryCta.href}
              >
                <span data-text>
                  <OdometerHoverText text={hero.secondaryCta.text} />
                </span>
              </Link>
            </div>
            <p className="mt-16 font-mono text-caption-10 text-dark-grey uppercase">
              {hero.note}
            </p>
          </AnimatedContent>
        </div>
        <div className="hidden lg:block">
          <MainHeroTypewriter chunks={hero.ticker} />
        </div>
      </div>
      <div className="relative overflow-hidden bg-black lg:col-span-6 lg:col-start-7 lg:aspect-auto">
        <div className="size-full absolute inset-0">
          <Spiral />
        </div>
      </div>
      <MainHeroScrollCue className="absolute bottom-40 left-[calc(50%_+_8px)] hidden -translate-x-1/2 lg:flex" />
    </div>
  );
}
