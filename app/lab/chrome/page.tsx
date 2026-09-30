import { FinalCta } from "@/components/sections/final-cta";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteNav } from "@/components/site/site-nav";

// Lab for the site chrome: fixed nav over a tall dummy page whose sections
// carry the real anchor ids (so the active highlight can be tested), then
// the final CTA and the footer (#contact).
const DUMMY_SECTIONS = [
  { id: "about", label: "About", dark: false },
  { id: "events", label: "Events", dark: false },
  { id: "community", label: "Community", dark: true },
  { id: "team", label: "Team", dark: true },
  { id: "resources", label: "Resources", dark: false },
  { id: "faq", label: "FAQ", dark: true },
];

export default function ChromeLab() {
  return (
    <>
      <SiteNav />
      <main>
        <section className="grid min-h-svh place-items-center bg-off-white px-16 font-mono text-caption-10 text-dark-grey uppercase">
          Hero placeholder
        </section>
        {DUMMY_SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className={
              section.dark
                ? "grid h-[120svh] place-items-center bg-black font-mono text-caption-10 text-white/60 uppercase"
                : "grid h-[120svh] place-items-center bg-off-white font-mono text-caption-10 text-dark-grey uppercase"
            }
          >
            #{section.id} · {section.label}
          </section>
        ))}
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
