"use client";

import { useMemo } from "react";
import { Typewriter } from "@/components/hero/typewriter";
import { useBreakpoint } from "@/components/hero/use-media-query";

/**
 * Port of the original MainHeroTypewriter: on lg+ the status chunks split
 * into two justified rows (first row gets the extra chunk), else one row.
 */
export function MainHeroTypewriter({ chunks }: { chunks: string[] }) {
  const isLg = useBreakpoint("lg", { initializeWithValue: true });
  const lines = useMemo(() => {
    if (!isLg) return [chunks];
    const half = Math.ceil(chunks.length / 2);
    return [chunks.slice(0, half), chunks.slice(half)].filter(
      (line) => line.length > 0,
    );
  }, [chunks, isLg]);

  return (
    <Typewriter
      lines={lines}
      startDelay={400}
      viewport={false}
      className="font-mono text-caption-10 uppercase"
    />
  );
}
