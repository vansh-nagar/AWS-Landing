import { AsciiBackground } from "@/components/ui/ascii-background";
import { ProofAsciiImage } from "@/components/sections/proof-ascii-image";
import {
  PROGRAM_ICON_SRC,
  ProofHeading,
  ProofLink,
  ProofTag,
} from "@/components/sections/proof-parts";
import {
  type ShowcaseProject,
  showcaseProjects,
  showcaseSection,
} from "@/content/proof";

const FRAME_ASPECT = 16 / 9;

/**
 * 17. Builder showcase (black). Modelled on the reference 04-showcase: ASCII
 * field behind, heading + intro, then a two-column grid of dithered ASCII
 * frames with mono captions. With no projects yet it shows an honest empty
 * state in the same card frame.
 */
export function Showcase({
  projects = showcaseProjects,
}: {
  projects?: ShowcaseProject[];
}) {
  const s = showcaseSection;
  const titleId = `${s.id}-title`;

  return (
    <section
      id={s.id}
      aria-labelledby={titleId}
      className="relative isolate bg-black px-16 py-72 text-white lg:px-80 lg:py-160"
    >
      <AsciiBackground phrases={s.backgroundPhrases} />
      <ProofHeading id={titleId} title={s.title} intro={s.intro} />
      <ul className="grid grid-cols-1 gap-x-24 gap-y-32 lg:grid-cols-2 lg:gap-y-64">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))
        ) : (
          <EmptyState />
        )}
      </ul>
    </section>
  );
}

function ProjectCard({ project }: { project: ShowcaseProject }) {
  const { labels } = showcaseSection;
  const hasLinks = Boolean(project.github || project.demo);

  return (
    <li className="group block">
      <div className="mb-12">
        {project.image ? (
          <ProofAsciiImage
            src={project.image.src}
            label={project.image.alt}
            aspect={FRAME_ASPECT}
            revealOnHover
          />
        ) : (
          <ProofAsciiImage
            src={PROGRAM_ICON_SRC}
            label={project.name}
            aspect={FRAME_ASPECT}
            fit="contain"
            containScale={0.7}
          />
        )}
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-16 gap-y-8">
        <h3 className="font-mono text-caption-20 uppercase">{project.name}</h3>
        {hasLinks ? (
          <div className="flex items-center gap-16">
            {project.github ? (
              <ProofLink href={project.github}>{labels.github}</ProofLink>
            ) : null}
            {project.demo ? (
              <ProofLink href={project.demo}>{labels.demo}</ProofLink>
            ) : null}
          </div>
        ) : null}
      </div>
      <p className="mt-4 font-mono text-caption-10 text-mid-grey uppercase">
        {project.builder}
      </p>
      <p className="mt-12 max-w-600 text-body-20 text-ghost-grey">
        {project.description}
      </p>
      {project.stack.length > 0 ? (
        <ul aria-label="Stack" className="mt-12 flex flex-wrap gap-6 text-ghost-grey">
          {project.stack.map((item) => (
            <li key={item}>
              <ProofTag>{item}</ProofTag>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function EmptyState() {
  const { empty } = showcaseSection;

  return (
    <>
      <li className="block">
        <div className="mb-12 border border-dashed border-white/15">
          <ProofAsciiImage
            src={PROGRAM_ICON_SRC}
            label="AWS Student Builder Group program icon"
            aspect={FRAME_ASPECT}
            fit="contain"
            containScale={0.72}
          />
        </div>
        <h3 className="font-mono text-caption-20 uppercase">{empty.title}</h3>
        <p className="mt-4 font-mono text-caption-10 text-mid-grey uppercase">
          {empty.note}
        </p>
      </li>
      <li className="block">
        <div
          className="mb-12 flex flex-col justify-center border border-dashed border-white/15 p-16 lg:p-32"
          style={{ aspectRatio: FRAME_ASPECT }}
        >
          <ol className="flex flex-col gap-4 font-mono text-caption-10 uppercase">
            {empty.steps.map((step, index) => (
              <li key={step} className="flex gap-24">
                <span inert className="text-dark-grey tabular-nums">
                  {String(index + 1).padStart(3, "0")}
                </span>
                <span className="text-ghost-grey">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <h3 className="font-mono text-caption-20 uppercase">{empty.stepsTitle}</h3>
      </li>
    </>
  );
}
