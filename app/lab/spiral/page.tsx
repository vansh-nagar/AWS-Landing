import { Spiral } from "@/components/hero/spiral";

// Lab: the spiral exactly as it sits in the hero's right column.
export default function SpiralLabPage() {
  return (
    <>
      <div
        data-page-builder-section="mainHeroSection"
        className="relative grid min-h-svh grid-cols-1 grid-rows-[auto_80vh] gap-x-16 bg-off-white text-black lg:grid-cols-12 lg:grid-rows-1"
      >
        <div className="flex flex-col gap-48 px-16 pt-160 pb-48 lg:col-span-5 lg:justify-center lg:pt-64 lg:pr-0 lg:pl-80" />
        <div className="relative overflow-hidden bg-black lg:col-span-6 lg:col-start-7 lg:aspect-auto">
          <div className="size-full absolute inset-0">
            <Spiral />
          </div>
        </div>
      </div>
      {/* Spacer so the page can scroll (scroll velocity spins the rings). */}
      <div className="h-[100vh] bg-off-white" />
    </>
  );
}
