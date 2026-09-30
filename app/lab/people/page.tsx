import { BuilderCenter } from "@/components/sections/builder-center";
import { CommunityStats } from "@/components/sections/community-stats";
import { CoreTeam } from "@/components/sections/core-team";
import { Founding } from "@/components/sections/founding";

// Lab for sections 10–14 (agent "people"), in page order.
export default function PeopleLab() {
  return (
    <main className="bg-off-white text-black">
      <BuilderCenter />
      <CoreTeam />
      <Founding />
      <CommunityStats />
    </main>
  );
}
