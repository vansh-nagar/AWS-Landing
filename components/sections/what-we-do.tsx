import { AnimatedText } from "@/components/hero/animated-text";
import { AsciiBackground } from "@/components/ui/ascii-background";
import {
  BRAND_ICON_SHAPES,
  type BrandIcon,
  type BrandIconColor,
  whatWeDo,
} from "@/content/activity";
import { cx } from "@/lib/cx";

// Static class names so Tailwind picks them up.
const ICON_BG: Record<BrandIconColor, string> = {
  amber: "bg-brand-amber",
  blue: "bg-brand-blue",
  "grey-850": "bg-brand-grey-850",
  magenta: "bg-brand-magenta",
  mint: "bg-brand-mint",
  purple: "bg-brand-purple",
  white: "bg-white",
};

/**
 * A brand pixel icon (decorative), painted in its brand colour through a CSS
 * mask of the kit's SVG shape. Set the height with `className` (e.g. h-14);
 * the width follows the shape's aspect ratio.
 */
export function PixelIcon({
  icon,
  className,
}: {
  icon: BrandIcon;
  className?: string;
}) {
  const shape = BRAND_ICON_SHAPES[icon.name];
  const mask = `url("${shape.src}") center / contain no-repeat`;
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-block shrink-0",
        ICON_BG[icon.color],
        className,
      )}
      style={{
        aspectRatio: `${shape.width} / ${shape.height}`,
        mask,
        WebkitMask: mask,
      }}
    />
  );
}

// 02-features staggers its items across three offsets.
const ITEM_OFFSETS = ["lg:ml-0", "lg:ml-[20%]", "lg:ml-[40%]"] as const;

function pad(n: number) {
  return String(n).padStart(3, "0");
}

/**
 * Section 6, "What happens here" (black). Built like 02-features: an
 * interactive ASCII field (with the pixel program mark as its bright figure),
 * a big headline, then staggered "001 / TITLE" items.
 */
export function WhatWeDo() {
  const { id, title, intro, items, later, laterLabel, backgroundPhrases } =
    whatWeDo;
  const laterOffset = ITEM_OFFSETS[items.length % ITEM_OFFSETS.length];

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      // Below lg the pixel mark sits at the bottom of the field at full
      // width (a square), so leave room for it under the content.
      className="relative isolate min-h-svh pt-72 pb-[calc(100vw+32px)] text-white lg:py-160"
    >
      <AsciiBackground
        phrases={backgroundPhrases}
        model={{ src: "/brand/program-icon/white.svg" }}
        interactive
        sticky
      />
      <div className="pointer-events-none grid grid-cols-1 gap-16 px-16 lg:grid-cols-12 lg:px-80">
        <div className="lg:col-span-5">
          <div className="flex flex-col gap-32">
            <h2
              id={`${id}-title`}
              className="pointer-events-auto whitespace-pre-line text-balance font-medium text-headline-10"
            >
              <AnimatedText>{title}</AnimatedText>
            </h2>
            <div className="pointer-events-auto w-full text-body-20 text-ghost-grey">
              <AnimatedText as="div" animationDelay={0.1}>
                {intro}
              </AnimatedText>
            </div>
          </div>

          <ul className="mt-80 flex flex-col gap-64">
            {items.map((item, i) => (
              <li
                key={item.title}
                className={cx(
                  "pointer-events-auto flex flex-col gap-12 lg:max-w-1/2",
                  ITEM_OFFSETS[i % ITEM_OFFSETS.length],
                )}
              >
                <PixelIcon icon={item.icon} className="mb-4 h-16 self-start" />
                <h3 className="font-mono text-caption-20 uppercase">
                  <AnimatedText>{`${pad(i + 1)} / ${item.title}`}</AnimatedText>
                </h3>
                <p className="text-body-10 text-ghost-grey">
                  <AnimatedText animationDelay={0.1}>{item.text}</AnimatedText>
                </p>
              </li>
            ))}

            <li
              className={cx(
                "pointer-events-auto flex flex-col gap-12 lg:max-w-1/2",
                laterOffset,
              )}
            >
              <h3 className="font-mono text-caption-10 text-dark-grey uppercase">
                <AnimatedText>{laterLabel}</AnimatedText>
              </h3>
              <ol className="flex flex-col gap-4 font-mono text-caption-10 uppercase">
                {later.map((format, i) => (
                  <li key={format} className="flex gap-24">
                    <span inert className="text-dark-grey tabular-nums">
                      {pad(items.length + i + 1)}
                    </span>
                    <span className="text-ghost-grey">{format}</span>
                  </li>
                ))}
              </ol>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
