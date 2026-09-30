import { AnimatedText } from "@/components/hero/animated-text";
import { ExternalArrow, ProofTag } from "@/components/sections/proof-parts";
import {
  type LearningResource,
  resources as defaultResources,
  resourcesSection,
} from "@/content/proof";

/**
 * 18. Learning resources (off-white, #resources). Built in the reference
 * 06-pricing language: 12-col header (headline left, mono caption right),
 * then a black rounded-8 panel with the "001  ITEM" numbered list, each row
 * an external link with an arrow box.
 */
export function Resources({
  resources = defaultResources,
}: {
  resources?: LearningResource[];
}) {
  const s = resourcesSection;
  const titleId = `${s.id}-title`;

  return (
    <section
      id={s.id}
      aria-labelledby={titleId}
      className="bg-off-white py-72 text-black lg:py-160"
    >
      <div className="grid grid-cols-1 gap-x-16 gap-y-32 px-16 lg:grid-cols-12 lg:gap-y-64 lg:px-80">
        <h2
          id={titleId}
          className="text-balance font-medium text-headline-10 lg:col-span-6 lg:row-start-1"
        >
          <AnimatedText>{s.title}</AnimatedText>
        </h2>
        <p className="font-mono text-caption-10 text-dark-grey uppercase lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:self-end lg:justify-self-end">
          <AnimatedText>{s.caption}</AnimatedText>
        </p>

        <div className="mt-32 flex flex-col gap-16 rounded-8 bg-black p-16 text-white lg:col-span-12 lg:row-start-2 lg:mt-0 lg:gap-24 lg:p-32">
          <div className="flex items-center justify-between gap-12">
            <ProofTag>{s.panelTag}</ProofTag>
            <span className="hidden font-mono text-caption-10 text-dark-grey uppercase sm:inline">
              {String(resources.length).padStart(3, "0")} links
            </span>
          </div>
          <ul className="font-mono text-caption-10 uppercase">
            {resources.map((resource, index) => (
              <li key={resource.href} className="border-white/10 border-t">
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-24 gap-y-6 py-16 lg:grid-cols-[auto_minmax(0,4fr)_minmax(0,7fr)_auto] lg:py-20"
                >
                  <span inert className="text-dark-grey tabular-nums">
                    {String(index + 1).padStart(3, "0")}
                  </span>
                  <span className="flex flex-wrap items-center gap-x-12 gap-y-6 text-ghost-grey transition-colors group-hover:text-white">
                    {resource.name}
                    {resource.tag ? (
                      <ProofTag dot className="text-ghost-grey">
                        {resource.tag}
                      </ProofTag>
                    ) : null}
                  </span>
                  <span className="col-start-2 row-start-2 font-sans text-body-10 text-mid-grey normal-case lg:col-start-3 lg:row-start-1">
                    {resource.description}
                  </span>
                  <span
                    aria-hidden="true"
                    className="col-start-3 row-span-2 row-start-1 grid size-24 shrink-0 place-items-center self-center rounded-2 bg-white/10 transition-colors group-hover:bg-white/20 lg:col-start-4 lg:row-span-1"
                  >
                    <ExternalArrow className="transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:translate-x-1 motion-reduce:transition-none" />
                  </span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="font-mono text-mid-grey text-ui">{s.panelNote}</p>
        </div>
      </div>
    </section>
  );
}
