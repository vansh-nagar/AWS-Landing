import { AsciiBackground } from "@/components/ui/ascii-background";
import { ProofAsciiImage } from "@/components/sections/proof-ascii-image";
import {
  ExternalArrow,
  PROGRAM_ICON_SRC,
  ProofHeading,
} from "@/components/sections/proof-parts";
import { type PastEvent, pastEvents, pastEventsSection } from "@/content/proof";

const FRAME_ASPECT = 16 / 9;

/**
 * 15. Past events (black). Hidden (renders null) until the first event is
 * added to `pastEvents` in content/proof.ts. Cards follow the reference
 * 04-showcase items: dithered ASCII frame that reveals the photo on hover,
 * mono caption below.
 */
export function PastEvents({ events = pastEvents }: { events?: PastEvent[] }) {
  if (events.length === 0) return null;
  const s = pastEventsSection;
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
        {events.map((event) => (
          <EventCard key={`${event.title}-${event.date}`} event={event} />
        ))}
      </ul>
    </section>
  );
}

function EventCard({ event }: { event: PastEvent }) {
  const meta = [event.attendance, event.date].filter(Boolean).join(" · ");
  const body = (
    <>
      <div className="mb-12">
        {event.image ? (
          <ProofAsciiImage
            src={event.image.src}
            label={event.image.alt}
            aspect={FRAME_ASPECT}
            revealOnHover
          />
        ) : (
          <ProofAsciiImage
            src={PROGRAM_ICON_SRC}
            label={event.title}
            aspect={FRAME_ASPECT}
            fit="contain"
            containScale={0.7}
          />
        )}
      </div>
      <h3 className="flex items-center gap-8 font-mono text-caption-20 uppercase">
        {event.title}
        {event.href ? <ExternalArrow className="text-mid-grey" /> : null}
      </h3>
      {meta ? (
        <p className="mt-4 font-mono text-caption-10 text-mid-grey uppercase">
          {meta}
        </p>
      ) : null}
      <p className="mt-12 line-clamp-2 max-w-600 text-body-20 text-ghost-grey">
        {event.recap}
      </p>
    </>
  );

  return (
    <li>
      {event.href ? (
        <a
          href={event.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          {body}
        </a>
      ) : (
        <div className="group block">{body}</div>
      )}
    </li>
  );
}
