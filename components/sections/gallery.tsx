import { ProofAsciiImage } from "@/components/sections/proof-ascii-image";
import { ProofHeading } from "@/components/sections/proof-parts";
import { type GalleryPhoto, gallery, gallerySection } from "@/content/proof";

/**
 * 16. Gallery (off-white). Hidden (renders null) until campus photos are
 * added to `gallery` in content/proof.ts. Masonry columns of dithered ASCII
 * frames (photo revealed on hover) with "001 / CAPTION" mono captions.
 */
export function Gallery({ photos = gallery }: { photos?: GalleryPhoto[] }) {
  if (photos.length === 0) return null;
  const s = gallerySection;
  const titleId = `${s.id}-title`;

  return (
    <section
      id={s.id}
      aria-labelledby={titleId}
      className="bg-off-white px-16 py-72 text-black lg:px-80 lg:py-160"
    >
      <ProofHeading id={titleId} title={s.title} intro={s.intro} tone="light" />
      <ul className="columns-1 gap-x-24 sm:columns-2 lg:columns-3">
        {photos.map((photo, index) => (
          <li key={photo.src} className="mb-32 break-inside-avoid">
            <figure className="group">
              <ProofAsciiImage
                className="mb-12"
                src={photo.src}
                label={photo.alt}
                aspect={photo.width / photo.height}
                cols={96}
                revealOnHover
              />
              <figcaption className="font-mono text-caption-10 uppercase">
                <span inert className="text-dark-grey tabular-nums">
                  {String(index + 1).padStart(3, "0")} /
                </span>{" "}
                {photo.caption}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
