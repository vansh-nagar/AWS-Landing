import { BuilderJourney } from "@/components/sections/builder-journey";
import { JoinCommunity } from "@/components/sections/join-community";
import { WhatWeDo } from "@/components/sections/what-we-do";
import { WhyJoin } from "@/components/sections/why-join";

/** Lab for sections 6–9 (agent "activity"), in page order. */
export default function ActivityLab() {
  return (
    <main className="flex flex-col">
      <WhatWeDo />
      <BuilderJourney />
      <JoinCommunity />
      <WhyJoin />
    </main>
  );
}
