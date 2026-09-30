import type { CSSProperties } from "react";

import { AnimatedText } from "@/components/hero/animated-text";
import {
  BRAND_GROUP_HOVER_TEXT,
  identityItems,
  PIXEL_ICONS,
  type PixelIconName,
} from "@/content/story";
import { cx } from "@/lib/cx";

/**
 * A pixel icon from the brand kit, drawn as a CSS mask filled with
 * `currentColor`, so `text-*` sets its colour. Height comes from `className`
 * (e.g. `h-24`); width follows the icon's aspect ratio.
 */
export function PixelIcon({
  name,
  className,
}: {
  name: PixelIconName;
  className?: string;
}) {
  const { src, ratio } = PIXEL_ICONS[name];
  const style: CSSProperties = {
    aspectRatio: ratio,
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "left center",
    WebkitMaskPosition: "left center",
  };
  return (
    <span
      aria-hidden="true"
      className={cx("inline-block shrink-0 bg-current", className)}
      style={style}
    />
  );
}

/**
 * Section 3: four "001 / TITLE" spec items directly under the hero, each on
 * its own hairline rule. Icons are black at rest and take their brand colour
 * on hover.
 */
export function IdentityStrip() {
  return (
    <section
      aria-label="What AWS SBG BIT Jaipur is about"
      data-page-builder-section="identityStrip"
      className="bg-off-white pt-48 pb-24 text-black lg:pt-64 lg:pb-0"
    >
      <ul className="grid grid-cols-2 gap-x-16 gap-y-32 px-16 lg:grid-cols-4 lg:px-80">
        {identityItems.map((item, index) => (
          <li
            key={item.title}
            className="group flex flex-col gap-16 border-black/15 border-t pt-16 lg:gap-24 lg:pt-24"
          >
            <div className="flex items-center justify-between gap-16">
              <p className="font-mono text-caption-20 uppercase">
                <AnimatedText animationDelay={index * 0.05}>
                  {`${String(index + 1).padStart(3, "0")} / ${item.title}`}
                </AnimatedText>
              </p>
              <PixelIcon
                name={item.icon}
                className={cx(
                  "h-16 text-black transition-colors duration-300 lg:h-20",
                  BRAND_GROUP_HOVER_TEXT[item.color],
                )}
              />
            </div>
            <p className="max-w-[28ch] text-pretty text-body-20 text-dark-grey">
              <AnimatedText animationDelay={0.1 + index * 0.05}>
                {item.description}
              </AnimatedText>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
