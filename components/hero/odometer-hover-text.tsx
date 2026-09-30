import type { CSSProperties } from "react";

/**
 * Put this on the hover target (a button or link). Hovering sets
 * `--odometer-progress` to 1, which rolls every OdometerHoverText inside it.
 */
export const ODOMETER_HOVER_TRIGGER =
  "[--odometer-progress:0] motion-safe:hover:[--odometer-progress:1]";

const GLYPH_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const GLYPH_COUNT = 4;
const STAGGER_MS = 28;
const ROW_STYLE: CSSProperties = { height: "1em", lineHeight: "1em" };

/**
 * The 4 filler glyphs a column rolls through, seeded by the character and its
 * position. Same arithmetic as the original (plain `*` for the seed, then two
 * Math.imul mixing rounds), so the glyphs match the live site exactly.
 */
export function getOdometerGlyphs(char: string, index: number): string[] {
  const code = char.charCodeAt(0);
  return Array.from({ length: GLYPH_COUNT }, (_, n) => {
    let hash = (0x466f45d * index) ^ (0x127409f * n) ^ (0x4f9ffb7 * code);
    hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
    hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
    hash ^= hash >>> 16;
    return GLYPH_ALPHABET[Math.abs(hash) % GLYPH_ALPHABET.length] ?? "X";
  });
}

function OdometerChar({ char, index }: { char: string; index: number }) {
  if (char === " ") {
    return (
      <span aria-hidden="true" className="inline-block" style={ROW_STYLE}>
        {" "}
      </span>
    );
  }

  const column = [char, ...getOdometerGlyphs(char, index), char];
  const columnStyle: CSSProperties = {
    transform: `translateY(calc(var(--odometer-progress, 0) * ${-(column.length - 1)}em))`,
    transitionDuration: "520ms",
    transitionDelay: `calc(var(--odometer-progress, 0) * ${STAGGER_MS * index}ms)`,
    transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
  };

  return (
    <span
      aria-hidden="true"
      className="relative inline-block overflow-hidden align-baseline"
      style={ROW_STYLE}
    >
      {/* Sizes the 1em window to the real character's width. */}
      <span className="invisible">{char}</span>
      <span
        className="absolute inset-x-0 top-0 flex flex-col motion-safe:transition-transform"
        style={columnStyle}
      >
        {column.map((glyph, n) => (
          // Empty on purpose: the global [data-odometer-glyph]::before rule draws the glyph.
          <span
            key={`${n}-${glyph}`}
            data-odometer-glyph={glyph}
            className="block"
            style={ROW_STYLE}
          />
        ))}
      </span>
    </span>
  );
}

/**
 * Text that rolls each character through random glyphs back to itself when a
 * parent with ODOMETER_HOVER_TRIGGER is hovered (characters stagger by 28ms).
 */
export function OdometerHoverText({ text }: { text: string }) {
  const chars = [...text];
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="flex items-center">
        {chars.map((char, index) => (
          <OdometerChar key={`${index}-${char}`} char={char} index={index} />
        ))}
      </span>
    </>
  );
}
