import type { SVGProps } from "react";
import { cx } from "@/lib/cx";

/**
 * The AWS Student Builder Groups program icon (the pixel "chip" mark from
 * public/brand/program-icon), inlined so it paints with `currentColor`.
 * Decorative by default; pass `aria-label` + `role="img"` to expose it.
 */
export function ProgramMark({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 3000 3000"
      fill="currentColor"
      aria-hidden={rest["aria-label"] ? undefined : true}
      className={cx("size-[1em] shrink-0", className)}
      {...rest}
    >
      <path d="M2333.33 3000H2000V2666.67H1666.67V3000H1333.33V2666.67H1000V3000H666.667V2333.33H2333.33V3000ZM666.667 2333.33H0V2000H333.333V1666.67H0V1333.33H333.333V1000H0V666.667H666.667V2333.33ZM3000 1000H2666.67V1333.33H3000V1666.67H2666.67V2000H3000V2333.33H2333.33V666.667H3000V1000ZM1000 333.333H1333.33V0H1666.67V333.333H2000V0H2333.33V666.667H666.667V0H1000V333.333Z" />
    </svg>
  );
}
