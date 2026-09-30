import { MainHero } from "@/components/hero/main-hero";
import { About } from "@/components/sections/about";
import { BuilderCenter } from "@/components/sections/builder-center";
import { BuilderJourney } from "@/components/sections/builder-journey";
import { CommunityStats } from "@/components/sections/community-stats";
import { CoreTeam } from "@/components/sections/core-team";
import { Faq } from "@/components/sections/faq";
import { FeaturedEvent } from "@/components/sections/featured-event";
import { FinalCta } from "@/components/sections/final-cta";
import { Founding } from "@/components/sections/founding";
import { Gallery } from "@/components/sections/gallery";
import { IdentityStrip } from "@/components/sections/identity-strip";
import { JoinCommunity } from "@/components/sections/join-community";
import { PastEvents } from "@/components/sections/past-events";
import { Resources } from "@/components/sections/resources";
import { Showcase } from "@/components/sections/showcase";
import { SiteFooter } from "@/components/sections/site-footer";
import { WhatWeDo } from "@/components/sections/what-we-do";
import { WhyJoin } from "@/components/sections/why-join";
import { SiteNav } from "@/components/site/site-nav";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <MainHero />
        <IdentityStrip />
        <About />
        <FeaturedEvent />
        <WhatWeDo />
        <BuilderJourney />
        <JoinCommunity />
        <WhyJoin />
        <BuilderCenter />
        <CoreTeam />
        <Founding />
        <CommunityStats />
        <PastEvents />
        <Gallery />
        <Showcase />
        <Resources />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
