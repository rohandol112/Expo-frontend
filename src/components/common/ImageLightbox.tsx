import { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * Full-screen image preview. Extracted from the Competition banner-review
 * flow so other review screens (e.g. Gift Request Details) can reuse it.
 */
export function ImageLightbox({ src, caption, onClose }: { src: string; caption?: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // The overlay covers the page; letting the list scroll behind it is jarring.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={caption || "Image preview"}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-6"
      onClick={onClose}
    >
      <div className="flex w-full max-w-5xl items-center justify-between pb-3 text-white">
        <p className="truncate text-sm font-semibold">{caption}</p>
        <div className="flex items-center gap-2">
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-white/15 px-2.5 py-1 text-xs hover:bg-white/25"
            onClick={(e) => e.stopPropagation()}
          >
            Open original
          </a>
          <button
            type="button"
            aria-label="Close preview"
            className="rounded-md bg-white/15 p-1.5 hover:bg-white/25"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <img
        src={src}
        alt={caption || "Preview"}
        className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <p className="pt-3 text-[11px] text-white/60">Click anywhere or press Esc to close</p>
    </div>
  );
}

/** Lightbox state shared across a page's thumbnails. */
export function useLightbox() {
  const [zoom, setZoom] = useState<{ src: string; caption: string } | null>(null);
  const openZoom = (src: string, caption: string) => setZoom({ src, caption });
  const lightbox = zoom ? <ImageLightbox src={zoom.src} caption={zoom.caption} onClose={() => setZoom(null)} /> : null;
  return { openZoom, lightbox };
}
