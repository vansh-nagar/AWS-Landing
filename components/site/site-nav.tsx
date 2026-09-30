import { nav } from "@/content/chrome";
import { NavBody } from "./nav-body";

// The reference's DitherFrame: black-deep frame filled with a 4px
// checkerboard, around the black nav panel.
const DITHER_STYLE = {
  backgroundImage:
    "repeating-conic-gradient(rgba(255,255,255,0.22) 0% 25%, transparent 0% 50%)",
  backgroundSize: "4px 4px",
};

/**
 * Section 1: the fixed nav pill. Centered on desktop (logo, odometer links
 * with the active-section highlight, CTAs, announcement marquee); on mobile a
 * compact "Menu +" panel top-left that expands into the link list.
 */
export function SiteNav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-start p-8 lg:justify-center lg:p-16">
      <nav aria-label="Primary">
        <div
          className="pointer-events-auto rounded-8 bg-black-deep p-6 shadow-lg ring ring-black-deep lg:p-8"
          style={DITHER_STYLE}
        >
          <NavBody
            brand={nav.brand}
            links={nav.links}
            announcement={nav.announcement}
            primaryCta={nav.primaryCta}
            secondaryCta={nav.secondaryCta}
          />
        </div>
      </nav>
    </header>
  );
}
