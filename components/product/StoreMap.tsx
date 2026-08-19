"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  MapPin,
  Navigation,
  Maximize2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buildMapLinks, formatAddress, type StoreLocation } from "@/lib/maps";

type Props = {
  location: StoreLocation;
  className?: string;
  /** map height in px */
  height?: number;
};

/**
 * Real Google Maps embed for a store.
 *
 * Uses the keyless `output=embed` endpoint, and only mounts the iframe once the
 * card scrolls near the viewport so the map costs nothing above the fold.
 */
export default function StoreMap({ location, className, height = 260 }: Props) {
  const { embedUrl, linkUrl, directionsUrl, isPrecise } = buildMapLinks(location);
  const address = formatAddress(location);

  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  /* close the expanded map with Escape */
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [expanded]);

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — nothing useful to fall back to
    }
  }

  /* ── no location on file ── */
  if (!embedUrl) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E2DFEC] bg-[#FAF9FD] p-8 text-center",
          className
        )}
      >
        <MapPin size={22} className="text-[#C4BCDA]" />
        <p className="text-[15px] font-semibold text-[#5A5470]">
          Pickup location not shared
        </p>
        <p className="max-w-[240px] text-[13px] text-[#8B85A0]">
          This store has not published a shop address yet. Message the seller to
          arrange delivery or pickup.
        </p>
        {linkUrl && (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 text-[14px] font-bold text-[#6C4CD8] hover:underline"
          >
            Open shared map link <ExternalLink size={13} />
          </a>
        )}
      </div>
    );
  }

  const mapFrame = (fullscreen: boolean) => (
    <iframe
      title={`Map showing ${location.businessName || "the store"} location`}
      src={embedUrl}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      onLoad={() => setLoaded(true)}
      className={cn(
        "h-full w-full border-0 transition-opacity duration-500",
        fullscreen || loaded ? "opacity-100" : "opacity-0"
      )}
    />
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* ── map surface ── */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[#E2DFEC] bg-[#EEF1F5]"
        style={{ height }}
      >
        {mapFrame(false)}

        {/* skeleton until the tiles paint */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#EEF1F5]">
            <div className="flex flex-col items-center gap-2 text-[#A9A2BF]">
              <MapPin size={20} className="animate-pulse" />
              <span className="text-[13px] font-medium">Loading map…</span>
            </div>
          </div>
        )}

        {/* approximate-location notice */}
        {loaded && !isPrecise && (
          <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-[12px] font-semibold text-[#5A5470] shadow-sm backdrop-blur-sm">
            Approximate area
          </div>
        )}

        {/* expand */}
        {loaded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Expand map"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-[#6C4CD8] shadow-sm backdrop-blur-sm transition hover:bg-white"
          >
            <Maximize2 size={15} />
          </button>
        )}
      </div>

      {/* ── address + actions ── */}
      {address && (
        <div className="flex items-start gap-2.5 rounded-xl bg-[#F6F5FA] px-4 py-3">
          <MapPin size={15} className="mt-0.5 shrink-0 text-[#6C4CD8]" />
          <p className="flex-1 text-[14px] leading-relaxed text-[#3F3A52]">
            {address}
          </p>
          <button
            type="button"
            onClick={copyAddress}
            aria-label="Copy address"
            className="shrink-0 rounded-lg p-1.5 text-[#8B85A0] transition hover:bg-white hover:text-[#6C4CD8]"
          >
            {copied ? (
              <Check size={15} className="text-emerald-500" />
            ) : (
              <Copy size={15} />
            )}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#6C4CD8] px-4 py-2.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#5B3DC0]"
          >
            <Navigation size={15} />
            Get directions
          </a>
        )}
        {linkUrl && (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E2DFEC] bg-white px-4 py-2.5 text-[14px] font-bold text-[#6C4CD8] transition hover:bg-[#F1EFFA]"
          >
            <ExternalLink size={15} />
            Open in Maps
          </a>
        )}
      </div>

      {/* ── expanded overlay ── */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Store location map"
        >
          <div
            className="relative h-[80vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {mapFrame(true)}
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Close map"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1A1330] shadow-lg transition hover:bg-[#F1EFFA]"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
