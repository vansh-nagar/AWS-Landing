import { GetAccessButton } from "@/components/hero/get-access-button";
import { MainHeroReel } from "@/components/hero/main-hero-reel";
import { MainHeroScrollCue } from "@/components/hero/main-hero-scroll-cue";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// Lab for the hero's controls. The first screen reproduces the hero's
// geometry at 1440x900: CTA row at x=80, y≈529 on off-white, and the spiral
// column (black) starting at 50% + 8px with the scroll cue on its edge.
// `?video=<url>&preview=<url>` feeds the reel a test video / hover preview.
export default async function ButtonsLab(props: PageProps<"/lab/buttons">) {
  const query = await props.searchParams;
  const videoSrc = firstParam(query.video);
  const previewSrc = firstParam(query.preview);

  return (
    <main className="bg-off-white text-black">
      <section className="relative min-h-svh">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 hidden bg-black lg:block lg:left-[calc(50%_+_8px)]"
        />
        <div className="px-16 pt-160 lg:absolute lg:top-[529.4375px] lg:left-80 lg:w-[510.656px] lg:p-0">
          <div className="flex flex-wrap items-center gap-8">
            <GetAccessButton href="/#pricing" words={["Get", "access"]} />
            <MainHeroReel
              buttonText="Watch reel"
              videoSrc={videoSrc}
              previewSrc={previewSrc}
            />
          </div>
        </div>
        <MainHeroScrollCue className="absolute bottom-40 left-[calc(50%_+_8px)] hidden -translate-x-1/2 lg:flex" />
      </section>
      <section className="grid min-h-svh place-items-center bg-black font-mono text-caption-10 text-white/70 uppercase">
        Next section
      </section>
    </main>
  );
}
