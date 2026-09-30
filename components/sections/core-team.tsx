import { AnimatedText } from "@/components/hero/animated-text";
import { AsciiPortrait } from "@/components/sections/people/ascii-portrait";
import { AsciiBackground } from "@/components/ui/ascii-background";
import { coreTeam, facultyAdvisor, type Person } from "@/content/people";
import { cx } from "@/lib/cx";

const PORTRAIT_ASPECT = 4 / 5;
const BACKGROUND_PHRASES = ["Learn", "Build", "Connect", "AWS SBG BIT Jaipur"];
const TAG =
  "inline-flex w-fit min-w-0 shrink-0 items-center gap-6 whitespace-nowrap rounded-4 px-6 py-4 font-mono text-caption-10 uppercase leading-none tracking-wide";

/** LinkedIn "in" mark drawn on the brand icons' pixel grid. */
function LinkedInIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 8 8"
      className="size-12"
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      <rect x="1" y="1" width="1" height="1" />
      <rect x="1" y="3" width="1" height="4" />
      <rect x="3" y="3" width="1" height="4" />
      <rect x="4" y="3" width="2" height="1" />
      <rect x="6" y="4" width="1" height="3" />
    </svg>
  );
}

function PersonCard({ person, tag }: { person: Person; tag: string }) {
  return (
    <li className="group relative block min-w-0">
      <div className="relative mb-12">
        <AsciiPortrait
          label={person.photo ? person.name : `${person.name} — portrait placeholder`}
          src={person.photo}
          initials={person.initials}
          aspect={PORTRAIT_ASPECT}
          cols={64}
        />
        {person.placeholder ? (
          <span
            className={cx(TAG, "absolute top-8 left-8 bg-black text-white/60 ring-1 ring-white/10")}
          >
            {tag}
          </span>
        ) : null}
      </div>
      <div className="flex items-start justify-between gap-12">
        <div className="flex min-w-0 flex-col gap-4">
          <h3 className="font-mono text-caption-20 uppercase">
            <AnimatedText>{person.name}</AnimatedText>
          </h3>
          <p className="font-mono text-caption-10 text-white/40 uppercase">
            {person.role}
          </p>
        </div>
        {person.linkedin ? (
          <a
            href={person.linkedin}
            target={person.linkedin.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            aria-label={`${person.name} on LinkedIn`}
            className="flex size-24 shrink-0 items-center justify-center rounded-4 bg-white/10 text-white/60 transition-colors hover:bg-white hover:text-black focus-visible:bg-white focus-visible:text-black focus-visible:outline-none"
          >
            <LinkedInIcon />
          </a>
        ) : null}
      </div>
      <p className="mt-8 max-w-[40ch] text-body-10 text-ghost-grey">
        {person.line}
      </p>
    </li>
  );
}

/**
 * Sections 11 + 12 — Core team (black, #team) with the faculty advisor
 * beneath. Portraits get the 04-showcase ASCII treatment; seats not filled
 * yet show a generated placeholder and a "To be announced" tag.
 */
export function CoreTeam() {
  return (
    <section
      id="team"
      aria-labelledby="team-title"
      className="relative isolate bg-black px-16 py-72 text-white lg:px-80 lg:py-160"
    >
      <AsciiBackground phrases={BACKGROUND_PHRASES} />
      <div className="mb-80 flex flex-col gap-16">
        <h2 id="team-title" className="text-balance font-medium text-headline-10">
          <AnimatedText>{coreTeam.title}</AnimatedText>
        </h2>
        <div className="w-full max-w-600 text-body-20 text-ghost-grey">
          <AnimatedText as="div" animationDelay={0.1}>
            {coreTeam.intro}
          </AnimatedText>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-x-16 gap-y-40 lg:grid-cols-3 lg:gap-x-24 lg:gap-y-64">
        {coreTeam.members.map((person, i) => (
          <PersonCard key={`${person.role}-${i}`} person={person} tag={coreTeam.placeholderTag} />
        ))}
      </ul>

      <div
        aria-labelledby="faculty-title"
        role="group"
        className="mt-80 grid grid-cols-2 gap-x-16 gap-y-32 border-white/10 border-t pt-32 lg:mt-160 lg:grid-cols-3 lg:gap-x-24"
      >
        <h3
          id="faculty-title"
          className="col-span-2 text-balance font-medium text-body-30 lg:col-span-3"
        >
          <AnimatedText>{facultyAdvisor.title}</AnimatedText>
        </h3>
        <ul className="min-w-0">
          <PersonCard person={facultyAdvisor.person} tag={coreTeam.placeholderTag} />
        </ul>
      </div>
    </section>
  );
}
