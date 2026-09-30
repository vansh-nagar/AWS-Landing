import { AnimatedContent } from "@/components/hero/animated-content";
import { AnimatedText } from "@/components/hero/animated-text";
import { GetAccessButton } from "@/components/hero/get-access-button";
import { TerminalWindow } from "@/components/ui/terminal-window";
import { builderCenter } from "@/content/people";

const { terminal } = builderCenter;

function Prompt() {
  return <span className="select-none text-white/40">{terminal.prompt} &gt; </span>;
}

/** Section 10 — AWS Builder Center (off-white). Text left, shell session right. */
export function BuilderCenter() {
  const external = builderCenter.cta.href.startsWith("http");

  return (
    <section
      id="builder-center"
      aria-labelledby="builder-center-title"
      className="bg-off-white py-72 text-black lg:py-160"
    >
      <div className="grid grid-cols-1 gap-x-16 gap-y-48 px-16 lg:grid-cols-12 lg:items-center lg:px-80">
        <div className="flex flex-col gap-32 lg:col-span-5">
          <h2
            id="builder-center-title"
            className="text-balance font-medium text-headline-10"
          >
            <AnimatedText>{builderCenter.title}</AnimatedText>
          </h2>
          <div className="w-full max-w-600 text-body-20 text-dark-grey">
            <AnimatedText as="div" animationDelay={0.1}>
              {builderCenter.body}
            </AnimatedText>
          </div>
          <AnimatedContent animationDelay={0.2}>
            <div className="flex flex-wrap items-center gap-8">
              <GetAccessButton
                href={builderCenter.cta.href}
                words={builderCenter.cta.words}
              />
            </div>
          </AnimatedContent>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <TerminalWindow title={terminal.title} bodyClassName="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto]">
              {/* Shell session */}
              <div className="min-w-0 px-16 py-16 leading-relaxed">
                <a
                  href={builderCenter.cta.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  aria-label={`${terminal.command}: ${builderCenter.cta.words.join(" ")}`}
                  className="group block whitespace-pre-wrap break-words text-white/80 no-underline"
                >
                  <Prompt />
                  <span className="text-[#d6a878] group-hover:underline">
                    {terminal.command}
                  </span>

                </a>
                <p className="text-white/40">{terminal.link}</p>
                <ol className="my-8 flex flex-col gap-2 uppercase">
                  {terminal.output.map((line, i) => (
                    <li key={line} className="flex gap-24">
                      <span className="text-dark-grey tabular-nums">
                        {String(i + 1).padStart(3, "0")}
                      </span>
                      <span className="text-ghost-grey">{line}</span>
                    </li>
                  ))}
                </ol>
                <p className="whitespace-pre-wrap text-white/80">
                  <Prompt />
                  {terminal.qrCommand}
                </p>
                <p className="flex items-center text-white/80">
                  <Prompt />
                  <span
                    aria-hidden="true"
                    className="ml-2 inline-block h-[1.1em] w-[0.6em] animate-cursor-blink bg-white/70"
                  />
                </p>
              </div>

              {/* QR slot — swap `terminal.qrSrc` for the real code later. */}
              <div className="flex items-center justify-center border-white/10 border-t p-16 sm:border-t-0 sm:border-l">
                {terminal.qrSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static QR image
                  <img
                    src={terminal.qrSrc}
                    alt="QR code: sign up for AWS Builder Center"
                    width={128}
                    height={128}
                    className="size-128 rounded-4 bg-white p-6"
                  />
                ) : (
                  <div
                    role="img"
                    aria-label="QR code coming soon"
                    className="relative flex size-128 items-center justify-center rounded-4 border border-dashed border-white/25 text-center text-white/40 uppercase"
                  >
                    <span aria-hidden="true" className="absolute top-6 left-6 size-12 border-white/40 border-t border-l" />
                    <span aria-hidden="true" className="absolute top-6 right-6 size-12 border-white/40 border-t border-r" />
                    <span aria-hidden="true" className="absolute bottom-6 left-6 size-12 border-white/40 border-b border-l" />
                    <span aria-hidden="true" className="absolute right-6 bottom-6 size-12 border-white/40 border-r border-b" />
                    <span className="px-16 leading-snug">{terminal.qrPlaceholder}</span>
                  </div>
                )}
              </div>
            </div>
          </TerminalWindow>
        </div>
      </div>
    </section>
  );
}
