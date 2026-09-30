"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import "./nav.css";

// Reference AnnouncementMarquee: speed 0.4, i.e. 40px per second.
const PX_PER_SECOND = 40;

/**
 * The ghost-grey announcement strip under the nav links. Port of the
 * reference's `marqy` marquee: two identical tracks, each holding enough
 * copies of the item to fill the strip, slide left by 100% and loop.
 * Pauses on hover; static under reduced motion.
 */
export function NavMarquee({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ root: 0, item: 0 });

  useEffect(() => {
    const root = rootRef.current;
    const item = itemRef.current;
    if (!root || !item) return;
    const measure = () =>
      setSize({ root: root.offsetWidth, item: item.offsetWidth });
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(item);
    measure();
    return () => observer.disconnect();
  }, []);

  const count = size.item > 0 ? Math.max(1, Math.ceil(size.root / size.item)) : 1;
  const measured = size.item > 0;
  const duration = `${(size.item * count) / PX_PER_SECOND}s`;

  return (
    <div
      className={cx(
        "relative h-18 overflow-hidden rounded-2 bg-ghost-grey font-mono text-black text-ui uppercase",
        className,
      )}
    >
      <div className="absolute inset-0 flex items-center">
        <div
          ref={rootRef}
          data-marqy=""
          data-pause-on-hover=""
          data-marqy-static={measured ? undefined : ""}
          className="w-full motion-safe:animate-fade-in"
        >
          <div data-marqy-inner="">
            {[0, 1].map((track) => (
              <div
                key={track}
                data-marqy-content=""
                style={{ animationDuration: duration }}
              >
                {Array.from({ length: count }, (_, n) => {
                  const first = track === 0 && n === 0;
                  return (
                    <div
                      key={n}
                      ref={first ? itemRef : undefined}
                      aria-hidden={first ? undefined : true}
                      data-marqy-item=""
                    >
                      <div className="flex w-auto flex-row items-center gap-[1em] whitespace-nowrap px-[1em]">
                        {text}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
