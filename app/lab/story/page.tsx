import { About } from "@/components/sections/about";
import { FeaturedEvent } from "@/components/sections/featured-event";
import { IdentityStrip } from "@/components/sections/identity-strip";

/** Lab for the "story" sections: identity strip, About, featured event. */
export default function StoryLab() {
  return (
    <main>
      <div className="flex h-200 items-end bg-off-white px-16 pb-16 font-mono text-caption-10 text-dark-grey uppercase lg:px-80">
        lab / story (hero above)
      </div>
      <IdentityStrip />
      <About />
      <FeaturedEvent />
    </main>
  );
}
