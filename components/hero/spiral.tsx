"use client";

import dynamic from "next/dynamic";
import { cx } from "@/lib/cx";

export function SpiralLoader({ className }: { className?: string }) {
  return <div className={cx("size-full bg-black", className)} />;
}

// WebGL only runs in the browser, so the scene is client-only; the loader
// paints the same #232323 block until the chunk arrives.
export const Spiral = dynamic(
  () => import("./spiral-scene").then((mod) => mod.SpiralScene),
  {
    loading: () => <SpiralLoader />,
    ssr: false,
  },
);
