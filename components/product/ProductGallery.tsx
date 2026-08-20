"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
<<<<<<< HEAD
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ListingImage, ThumbnailImage } from "@/app/api/listings";

type Props = {
  images: ListingImage[];
  thumbnail?: ThumbnailImage;
  title: string;
};

export default function ProductGallery({ images, thumbnail, title }: Props) {
  // Sort by sortOrder, primary first
  const sorted = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.sortOrder - b.sortOrder;
  });

  // Fall back to thumbnail if no images
  const allImages: { uuid: string; uri: string; label: string }[] =
    sorted.length > 0
      ? sorted.map((img) => ({ uuid: img.uuid, uri: img.uri, label: title }))
      : thumbnail
      ? [{ uuid: thumbnail.uuid, uri: thumbnail.uri, label: title }]
      : [];

  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const active = allImages[activeIdx];

  if (!active) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-[#F5F3FA] text-[15px] text-[#8B85A0]">
        No image available
=======
import { ChevronLeft, ChevronRight, ImageOff, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiImage } from "@/lib/types";

type Props = {
  images?: ApiImage[] | null;
  thumbnailUri?: ApiImage | null;
  title?: string;
  /** shown as an overlay ribbon, e.g. "Featured" */
  badge?: string | null;
};

type GalleryImage = {
  key: string;
  url: string;
  alt: string;
};

/**
 * Merge the listing's image set with its thumbnail.
 *
 * The API returns the thumbnail separately from `images` (and often only the
 * thumbnail exists). Since the images payload dropped `isPrimary`, the
 * thumbnail leads the gallery and the rest follow their `sortOrder`, which is
 * what PATCH /listings/{uuid}/images/order writes.
 */
function buildGallery(
  images: ApiImage[] | null | undefined,
  thumbnail: ApiImage | null | undefined,
  title: string
): GalleryImage[] {
  const gallerySet = [...(images ?? [])]
    .filter((image) => image?.uri)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const ordered = [...(thumbnail?.uri ? [thumbnail] : []), ...gallerySet];

  const seen = new Set<string>();
  const gallery: GalleryImage[] = [];

  ordered.forEach((image, index) => {
    const url = image.uri as string;
    if (seen.has(url)) return;
    seen.add(url);
    gallery.push({
      key: image.uuid ?? `${url}-${index}`,
      url,
      alt: `${title} — image ${gallery.length + 1}`,
    });
  });

  return gallery;
}

export default function ProductGallery({
  images,
  thumbnailUri,
  title = "Product",
  badge,
}: Props) {
  const gallery = useMemo(
    () => buildGallery(images, thumbnailUri, title),
    [images, thumbnailUri, title]
  );

  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const count = gallery.length;
  const active = gallery[Math.min(index, Math.max(count - 1, 0))];

  const step = useCallback(
    (delta: number) =>
      setIndex((current) => (count === 0 ? 0 : (current + delta + count) % count)),
    [count]
  );

  /* arrow keys move through the gallery; Escape leaves the lightbox */
  useEffect(() => {
    if (count <= 1 && !zoomed) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Escape") setZoomed(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, zoomed, step]);

  useEffect(() => {
    document.body.style.overflow = zoomed ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [zoomed]);

  /* ── no imagery at all ── */
  if (!active) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#E2DFEC] bg-[#F8F6FD] font-sans text-[#B3ADC4]">
        <ImageOff size={34} strokeWidth={1.4} />
        <p className="text-[15px] font-medium">No photos for this product yet</p>
>>>>>>> origin/main
      </div>
    );
  }

  function prev() { setActiveIdx((i) => (i - 1 + allImages.length) % allImages.length); }
  function next() { setActiveIdx((i) => (i + 1) % allImages.length); }

  return (
<<<<<<< HEAD
    <div className="flex flex-col gap-4 lg:sticky lg:top-24">

      {/* ── main image ── */}
      <div
        className="group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[#F5F3FA] shadow-[0_4px_24px_rgba(108,76,216,0.10)]"
        onClick={() => setZoomed(true)}
      >
        <Image
          src={active.uri}
          alt={active.label}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 480px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />

        {/* zoom hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-1.5 text-[13px] font-semibold text-[#6C4CD8] opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ZoomIn size={14} /> Zoom
=======
    <div className="flex flex-col gap-4 font-sans lg:sticky lg:top-24">
      {/* ── main image ── */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F5F3FA] shadow-[0_4px_24px_rgba(108,76,216,0.10)]">
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label="Open full size image"
          className="absolute inset-0 z-1 cursor-zoom-in"
        />

        <Image
          key={active.url}
          src={active.url}
          alt={active.alt}
          fill
          unoptimized
          priority
          sizes="(max-width: 1024px) 100vw, 480px"
          className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {badge && (
          <span className="absolute left-4 top-4 z-2 rounded-lg bg-[#6C4CD8] px-3 py-1.5 text-[13px] font-bold text-white shadow-sm">
            {badge}
          </span>
        )}

        {/* prev / next */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1A1330] opacity-0 shadow-md backdrop-blur-sm transition hover:bg-white group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1A1330] opacity-0 shadow-md backdrop-blur-sm transition hover:bg-white group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* counter + zoom hint */}
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-2 flex items-center justify-between">
          {count > 1 ? (
            <span className="rounded-lg bg-black/55 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur-sm">
              {index + 1} / {count}
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1.5 rounded-xl bg-white/85 px-3 py-1.5 text-[13px] font-semibold text-[#6C4CD8] opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <ZoomIn size={14} />
            Zoom
          </span>
>>>>>>> origin/main
        </div>

        {/* prev/next arrows — only when multiple images */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition hover:bg-white"
            >
              <ChevronLeft size={18} className="text-[#1A1330]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition hover:bg-white"
            >
              <ChevronRight size={18} className="text-[#1A1330]" />
            </button>
          </>
        )}
      </div>

      {/* ── thumbnails ── */}
<<<<<<< HEAD
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {allImages.map((img, i) => (
            <button
              key={img.uuid}
              onClick={() => setActiveIdx(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                i === activeIdx
=======
      {count > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {gallery.map((image, i) => (
            <button
              key={image.key}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1} of ${count}`}
              aria-current={i === index}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#F5F3FA] transition-all duration-200",
                i === index
>>>>>>> origin/main
                  ? "border-[#6C4CD8] shadow-[0_0_0_3px_rgba(108,76,216,0.15)]"
                  : "border-transparent opacity-70 hover:opacity-100 hover:border-[#C4B5FD]"
              )}
            >
              <Image
<<<<<<< HEAD
                src={img.uri}
                alt={img.label}
                fill
=======
                src={image.url}
                alt=""
                fill
                unoptimized
>>>>>>> origin/main
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── lightbox ── */}
      {zoomed && (
        <div
<<<<<<< HEAD
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
=======
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
>>>>>>> origin/main
          onClick={() => setZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} full size image`}
        >
          <div
<<<<<<< HEAD
            className="relative max-h-[92vh] max-w-[92vw] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active.uri}
              alt={active.label}
              width={1000}
              height={1000}
              className="object-contain"
            />
            {/* lightbox prev/next */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40"
                >
                  <ChevronRight size={20} />
=======
            className="relative flex max-h-[88vh] max-w-[92vw] items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active.url}
              alt={active.alt}
              width={1200}
              height={1200}
              unoptimized
              className="max-h-[88vh] w-auto object-contain"
            />

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                  className="absolute -left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30 sm:-left-16"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next image"
                  className="absolute -right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30 sm:-right-16"
                >
                  <ChevronRight size={22} />
>>>>>>> origin/main
                </button>
              </>
            )}
          </div>

          <button
<<<<<<< HEAD
            onClick={() => setZoomed(false)}
            aria-label="Close lightbox"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40"
          >
            <X size={20} />
          </button>
          {/* counter */}
          {allImages.length > 1 && (
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-[13px] font-semibold text-white">
              {activeIdx + 1} / {allImages.length}
=======
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Close"
            className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            <X size={20} />
          </button>

          {count > 1 && (
            <span className="absolute bottom-6 rounded-lg bg-white/15 px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur-sm">
              {index + 1} / {count}
>>>>>>> origin/main
            </span>
          )}
        </div>
      )}
    </div>
  );
}
