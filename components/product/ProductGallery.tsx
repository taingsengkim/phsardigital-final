"use client";

import { useState } from "react";
import Image from "next/image";
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
      </div>
    );
  }

  function prev() { setActiveIdx((i) => (i - 1 + allImages.length) % allImages.length); }
  function next() { setActiveIdx((i) => (i + 1) % allImages.length); }

  return (
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
                  ? "border-[#6C4CD8] shadow-[0_0_0_3px_rgba(108,76,216,0.15)]"
                  : "border-transparent opacity-70 hover:opacity-100 hover:border-[#C4B5FD]"
              )}
            >
              <Image
                src={img.uri}
                alt={img.label}
                fill
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setZoomed(false)}
        >
          <div
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
                </button>
              </>
            )}
          </div>
          <button
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
            </span>
          )}
        </div>
      )}
    </div>
  );
}
