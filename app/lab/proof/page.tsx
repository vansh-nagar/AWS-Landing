import { Faq } from "@/components/sections/faq";
import { Gallery } from "@/components/sections/gallery";
import { PastEvents } from "@/components/sections/past-events";
import { Resources } from "@/components/sections/resources";
import { Showcase } from "@/components/sections/showcase";
import type { GalleryPhoto, PastEvent, ShowcaseProject } from "@/content/proof";

/*
 * Lab for sections 15-19 (agent "proof").
 * Default: the launch state (past events + gallery hidden, showcase empty).
 * `?sample=1`: FAKE sample data (lab only, never shipped) so the data-driven
 * cards, masonry and project cards can be verified.
 */

/** Clearly fake placeholder photo: gradient + shapes + "SAMPLE" label. */
function samplePhoto(seed: number, width: number, height: number, label: string) {
  const hue = (seed * 67) % 360;
  const cx = ((seed * 37) % 60) + 20;
  const cy = ((seed * 53) % 50) + 25;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 30% 18%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360} 45% 62%)"/></linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<circle cx="${cx}%" cy="${cy}%" r="${Math.min(width, height) * 0.22}" fill="hsl(${hue} 20% 88%)"/>
<rect x="8%" y="${height * 0.72}" width="46%" height="${height * 0.12}" fill="hsl(${hue} 15% 10%)"/>
<text x="50%" y="16%" font-family="monospace" font-size="${Math.round(height * 0.1)}" font-weight="700" fill="#fff" text-anchor="middle">SAMPLE · ${label}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const SAMPLE_EVENTS: PastEvent[] = [
  {
    title: "Sample event (fake)",
    date: "Month 2026",
    attendance: "00 students",
    recap:
      "Lab-only placeholder to check the card layout. Two lines of recap text so the clamp and rhythm can be verified at both viewports.",
    image: { src: samplePhoto(1, 1600, 900, "EVENT A"), alt: "Sample event photo", width: 1600, height: 900 },
    href: "#",
  },
  {
    title: "Another sample event (fake)",
    date: "Month 2026",
    recap: "Lab-only placeholder without attendance and without a link.",
    image: { src: samplePhoto(2, 1600, 900, "EVENT B"), alt: "Sample event photo", width: 1600, height: 900 },
  },
  {
    title: "Sample event, no photo",
    date: "Month 2026",
    attendance: "00 students",
    recap: "Falls back to the dithered program icon when there is no photo.",
  },
];

const GALLERY_SIZES: Array<[number, number, string]> = [
  [1200, 1600, "Workshop"],
  [1600, 900, "Group photo"],
  [1600, 1200, "Speaker session"],
  [1200, 1200, "Coding"],
  [1600, 1000, "Networking"],
  [1200, 1500, "Demo"],
  [1600, 900, "Fun"],
];

const SAMPLE_GALLERY: GalleryPhoto[] = GALLERY_SIZES.map(([w, h, caption], i) => ({
  src: samplePhoto(i + 3, w, h, caption.toUpperCase()),
  alt: `Sample ${caption.toLowerCase()} photo`,
  width: w,
  height: h,
  caption: `Sample · ${caption}`,
}));

const SAMPLE_PROJECTS: ShowcaseProject[] = [
  {
    name: "Sample project (fake)",
    builder: "Sample Builder",
    stack: ["AWS Lambda", "Bedrock", "DynamoDB"],
    description: "Lab-only placeholder to check the project card: one line of description.",
    image: { src: samplePhoto(11, 1600, 900, "PROJECT"), alt: "Sample project screenshot", width: 1600, height: 900 },
    github: "#",
    demo: "#",
  },
  {
    name: "Sample, no image",
    builder: "Team Sample",
    stack: ["Amazon S3", "CloudFront"],
    description: "Falls back to the dithered program icon; GitHub link only.",
    github: "#",
  },
];

export default async function ProofLab(props: PageProps<"/lab/proof">) {
  const query = await props.searchParams;
  const sample = query.sample === "1";

  return (
    <main className="bg-off-white text-black">
      <div className="px-16 py-24 font-mono text-caption-10 text-dark-grey uppercase lg:px-80">
        Lab · proof · {sample ? "sample data (fake)" : "launch state"} ·{" "}
        <a className="underline" href={sample ? "/lab/proof" : "/lab/proof?sample=1"}>
          {sample ? "show launch state" : "show sample data"}
        </a>
      </div>
      <PastEvents events={sample ? SAMPLE_EVENTS : undefined} />
      <Gallery photos={sample ? SAMPLE_GALLERY : undefined} />
      <Showcase projects={sample ? SAMPLE_PROJECTS : undefined} />
      <Resources />
      <Faq />
    </main>
  );
}
