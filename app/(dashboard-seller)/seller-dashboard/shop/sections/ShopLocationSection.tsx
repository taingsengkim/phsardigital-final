"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  Crosshair,
  Link2,
  Loader2,
  RotateCcw,
  Save,

} from "lucide-react";
import {
  useGetSellerProfileQuery,
  useUpdateSellerProfileMutation,
  type SellerProfile,
  type UpdateSellerProfilePayload,
} from "@/lib/api/sellerApi";
import { AuthToast, type ToastState } from "@/components/auth/AuthToast";
import type { LatLng } from "@/components/map/PinPicker";
import { isValidCoords } from "@/lib/maps";
import { cn } from "@/lib/utils";

/** Leaflet touches `window` on import, so it can never run through SSR. */
const PinPicker = dynamic(() => import("@/components/map/PinPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center rounded-2xl border border-[#E2DFEC] bg-[#F4F2FA]">
      <Loader2 className="size-6 animate-spin text-[#6C4CD8]" />
    </div>
  ),
});

/** Field caps from SellerProfileUpdateRequest. */
const MAX = { address: 2000, city: 100, province: 100, googleMapUrl: 2000 };

/**
 * Rough bounding box for Cambodia. Only used to warn when a pin lands nowhere
 * near the address typed — the live data already holds a shop addressed in
 * Phnom Penh but pinned in New South Wales.
 */
const CAMBODIA_BOUNDS = { minLat: 9.9, maxLat: 14.7, minLng: 102.3, maxLng: 107.7 };

const CAMBODIAN_PLACES = [
  "phnom penh", "kandal", "siem reap", "battambang", "sihanoukville",
  "kampot", "kep", "takeo", "kampong", "prey veng", "svay rieng",
  "pursat", "koh kong", "ratanakiri", "mondulkiri", "preah vihear",
  "stung treng", "kratie", "banteay meanchey", "oddar meanchey",
  "pailin", "tboung khmum", "cambodia", "kampuchea",
];

/**
 * `source` records how the seller last set the position, which decides what the
 * PATCH carries. Coordinates win server-side, so a pin edit must never resend a
 * stale link — dragging clears `mapUrl` outright.
 */
type Draft = {
  address: string;
  city: string;
  province: string;
  mapUrl: string;
  latText: string;
  lngText: string;
  source: "pin" | "link" | null;
};

function toDraft(profile: SellerProfile | null | undefined): Draft {
  return {
    address: profile?.address ?? "",
    city: profile?.city ?? "",
    province: profile?.province ?? "",
    mapUrl: profile?.googleMapUrl ?? "",
    latText: profile?.latitude != null ? String(profile.latitude) : "",
    lngText: profile?.longitude != null ? String(profile.longitude) : "",
    source: null,
  };
}

function parseCoord(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

type ApiError = {
  status?: number;
  data?: {
    message?: string;
    errorDetails?: { field?: string; fieldMessage?: string }[];
  };
};

/** Pull the message the API returned, preferring the field-level one. */
function readApiError(err: unknown): { field: string | null; message: string } {
  const e = err as ApiError;
  const detail = e?.data?.errorDetails?.[0];
  return {
    field: detail?.field ?? null,
    message:
      detail?.fieldMessage ||
      e?.data?.message ||
      "Could not save the shop location. Please try again.",
  };
}

export default function ShopLocationSection() {
  const { data: profile, isLoading, isFetching } = useGetSellerProfileQuery();
  const [updateProfile, { isLoading: isMutating }] =
    useUpdateSellerProfileMutation();

  // The mutation invalidates the profile tag, so the real end of a save is
  // when the refetch lands — until then the form would show stale values.
  const isSaving = isMutating || isFetching;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  // The server is the source of truth: a pasted link is resolved into
  // coordinates upstream, so the saved profile — not local state — is what the
  // map re-renders from once a save lands.
  const saved = useMemo(() => toDraft(profile), [profile]);
  const current = draft ?? saved;

  const dirty =
    current.address !== saved.address ||
    current.city !== saved.city ||
    current.province !== saved.province ||
    current.mapUrl !== saved.mapUrl ||
    current.latText !== saved.latText ||
    current.lngText !== saved.lngText;

  function patch(next: Partial<Draft>) {
    setDraft((prev) => ({ ...(prev ?? saved), ...next }));
  }

  const lat = parseCoord(current.latText);
  const lng = parseCoord(current.lngText);
  const coordsValid = isValidCoords(lat, lng);

  // The API rejects a lone coordinate, so the form does too, before sending.
  const coordsPartial =
    (current.latText.trim() !== "" || current.lngText.trim() !== "") && !coordsValid;

  const pin: LatLng | null = coordsValid ? { lat: lat!, lng: lng! } : null;

  /* warn when the pin contradicts the written address */
  const regionText =
    `${current.city} ${current.province} ${current.address}`.toLowerCase();
  const claimsCambodia = CAMBODIAN_PLACES.some((p) => regionText.includes(p));
  const pinOutsideCambodia =
    coordsValid &&
    (lat! < CAMBODIA_BOUNDS.minLat ||
      lat! > CAMBODIA_BOUNDS.maxLat ||
      lng! < CAMBODIA_BOUNDS.minLng ||
      lng! > CAMBODIA_BOUNDS.maxLng);
  const mismatch = claimsCambodia && pinOutsideCambodia;

  /** Moving the pin wins over any link — clear the link so it cannot be resent. */
  function handlePinChange(next: LatLng) {
    setLinkError(null);
    patch({
      latText: next.lat.toFixed(6),
      lngText: next.lng.toFixed(6),
      mapUrl: "",
      source: "pin",
    });
  }

  function handleLinkChange(value: string) {
    setLinkError(null);
    patch({ mapUrl: value, source: value.trim() ? "link" : current.source });
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setToast({ type: "error", message: "This browser cannot share your location." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handlePinChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setToast({ type: "success", message: "Pinned your current position." });
      },
      () => {
        setToast({
          type: "error",
          message:
            "Could not read your location. Allow location access in your browser and try again.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLinkError(null);

    if (coordsPartial) {
      setToast({
        type: "error",
        message: "Latitude and longitude must be set together, or both left empty.",
      });
      return;
    }

    // Omitted means unchanged, so only send what actually moved.
    const payload: UpdateSellerProfilePayload = {};
    if (current.address !== saved.address) payload.address = current.address.trim();
    if (current.city !== saved.city) payload.city = current.city.trim();
    if (current.province !== saved.province) payload.province = current.province.trim();

    if (current.source === "pin" && coordsValid) {
      // Coordinates only — never alongside a link the seller has moved past.
      payload.latitude = lat!;
      payload.longitude = lng!;
    } else if (current.source === "link" && current.mapUrl.trim()) {
      payload.googleMapUrl = current.mapUrl.trim();
    }

    if (Object.keys(payload).length === 0) {
      setToast({ type: "error", message: "Nothing to save yet." });
      return;
    }

    try {
      await updateProfile(payload).unwrap();
      // Drop the draft so every field — including coordinates the server derived
      // from a pasted link — re-renders from the refetched profile.
      setDraft(null);
      setToast({ type: "success", message: "Shop location saved." });
    } catch (err) {
      const { field, message } = readApiError(err);
      if (field === "googleMapUrl" || /link|url|maps/i.test(message)) {
        setLinkError(message);
      } else {
        setToast({ type: "error", message });
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#6C4CD8]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* ── map ── */}
        <section className="flex flex-col gap-3 rounded-2xl border border-[#EDEBF3] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#1A1330]">Map pin</h2>
              <p className="mt-0.5 text-xs text-[#8D86A8]">
                {pin
                  ? "Drag the marker, or click anywhere to move it."
                  : "Click the map to drop your pin."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleUseMyLocation}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2DFEC] px-3 py-1.5 text-xs font-bold text-[#6C4CD8] transition hover:bg-[#F1EFFA]"
            >
              <Crosshair size={13} />
              Use my current location
            </button>
          </div>

          <PinPicker value={pin} onChange={handlePinChange} height={380} />

          {current.source === "link" && current.mapUrl.trim() && (
            <Notice tone="warning">
              Saving will move the pin to wherever your pasted link points —
              the marker above still shows the current position.
            </Notice>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <LabelledInput
              id="shop-lat"
              label="Latitude"
              placeholder="11.5564"
              value={current.latText}
              onChange={(v) => patch({ latText: v, mapUrl: "", source: "pin" })}
            />
            <LabelledInput
              id="shop-lng"
              label="Longitude"
              placeholder="104.9282"
              value={current.lngText}
              onChange={(v) => patch({ lngText: v, mapUrl: "", source: "pin" })}
            />
          </div>

          {coordsPartial && (
            <Notice tone="error">
              Latitude and longitude must be set together. Fill in both as
              numbers — latitude runs −90 to 90, longitude −180 to 180 — or clear
              them both.
            </Notice>
          )}

          {mismatch && (
            <Notice tone="warning">
              Your address says Cambodia but this pin sits outside the country.
              Buyers would be sent to the wrong place — check it before saving.
            </Notice>
          )}
        </section>

        {/* ── address + link ── */}
        <aside className="flex flex-col gap-5 rounded-2xl border border-[#EDEBF3] bg-white p-6">
          <LabelledInput
            id="shop-address"
            label="Street address"
            placeholder="House #42B, Street 271, Sangkat Tuol Sangkae"
            value={current.address}
            maxLength={MAX.address}
            onChange={(v) => patch({ address: v })}
          />
          <LabelledInput
            id="shop-city"
            label="City / District"
            placeholder="Phnom Penh"
            value={current.city}
            maxLength={MAX.city}
            onChange={(v) => patch({ city: v })}
          />
          <LabelledInput
            id="shop-province"
            label="Province"
            placeholder="Phnom Penh"
            value={current.province}
            maxLength={MAX.province}
            onChange={(v) => patch({ province: v })}
          />

          <hr className="border-[#EDEBF3]" />

          {/* google maps link */}
          <div>
            <label
              htmlFor="shop-map-url"
              className="mb-2 block text-sm font-semibold text-[#1A1330]"
            >
              Or paste a Google Maps link
            </label>
            <div className="relative">
              <Link2
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B5B0CA]"
              />
              <input
                id="shop-map-url"
                type="url"
                value={current.mapUrl}
                maxLength={MAX.googleMapUrl}
                placeholder="https://maps.app.goo.gl/…"
                aria-invalid={Boolean(linkError)}
                aria-describedby={linkError ? "shop-map-url-error" : undefined}
                onChange={(e) => handleLinkChange(e.target.value)}
                className={cn(
                  "w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-[#1A1330] placeholder:text-[#B5B0CA] focus:outline-none focus:ring-2",
                  linkError
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                    : "border-[#E2DFEC] focus:border-[#6C4CD8] focus:ring-[#6C4CD8]/15"
                )}
              />
            </div>

            {linkError ? (
              <p
                id="shop-map-url-error"
                className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-rose-700"
              >
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                {linkError}
              </p>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-[#8D86A8]">
                We send the link as-is and the server reads the position out of
                it. Moving the marker clears this field, since the pin wins.
              </p>
            )}
          </div>

          {/* actions */}
          <div className="mt-auto flex items-center justify-end gap-3 border-t border-[#EDEBF3] pt-5">
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setLinkError(null);
              }}
              disabled={!dirty || isSaving}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E2DFEC] px-5 py-2.5 text-sm font-semibold text-[#5A5470] transition hover:bg-[#F8F7FB] disabled:opacity-40"
            >
              <RotateCcw size={15} />
              Reset
            </button>
            <button
              type="submit"
              disabled={!dirty || isSaving || coordsPartial}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#6C4CD8]/20 transition hover:bg-[#5C3DC8] active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save location
                </>
              )}
            </button>
          </div>
        </aside>
      <AuthToast toast={toast} onClose={() => setToast(null)} />
    </form>
  );
}

/* ── pieces ─────────────────────────────────────────────────────────────── */

function LabelledInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-[#1A1330]"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#E2DFEC] bg-white px-4 py-3 text-sm text-[#1A1330] tabular-nums placeholder:text-[#B5B0CA] focus:border-[#6C4CD8] focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
      />
    </div>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "error" | "warning";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm leading-relaxed",
        tone === "error"
          ? "bg-rose-50 text-rose-800"
          : "bg-[#FBF2E1] text-[#8E5B0C]"
      )}
    >
      <AlertTriangle size={15} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
