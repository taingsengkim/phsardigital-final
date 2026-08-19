/**
 * Google Maps helpers — turn whatever location data the seller profile carries
 * (lat/lng, a pasted Google Maps URL, or a plain address) into embed + link URLs.
 *
 * The embed URLs use the keyless `output=embed` form, so no Maps API key is needed.
 */

export type GeoPoint = { lat: number; lng: number };

export type StoreLocation = {
  latitude?: number | string | null;
  longitude?: number | string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  googleMapUrl?: string | null;
  businessName?: string | null;
};

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function isValidCoords(lat: number | null, lng: number | null): boolean {
  if (lat === null || lng === null) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  // (0,0) is Null Island — always a placeholder, never a real shop.
  return !(lat === 0 && lng === 0);
}

/**
 * Pull coordinates out of any of the Google Maps URL shapes people paste:
 *   https://www.google.com/maps/@11.5564,104.9282,17z
 *   https://www.google.com/maps/place/Name/@11.5564,104.9282,17z/data=!3d11.55!4d104.92
 *   https://maps.google.com/?q=11.5564,104.9282
 *   https://www.google.com/maps/search/?api=1&query=11.5564%2C104.9282
 */
export function parseCoordsFromMapUrl(url?: string | null): GeoPoint | null {
  if (!url || typeof url !== "string") return null;

  const candidates: Array<[number, number]> = [];

  // !3d<lat>!4d<lng> — the most precise form, present on /place/ links
  const dMatch = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (dMatch) candidates.push([Number(dMatch[1]), Number(dMatch[2])]);

  // @<lat>,<lng>
  const atMatch = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) candidates.push([Number(atMatch[1]), Number(atMatch[2])]);

  // ?q= / &query= / &destination= holding a "lat,lng" pair (may be %2C encoded)
  const qMatch = url.match(
    /[?&](?:q|query|destination|ll|center)=(-?\d+(?:\.\d+)?)(?:,|%2C)(-?\d+(?:\.\d+)?)/i
  );
  if (qMatch) candidates.push([Number(qMatch[1]), Number(qMatch[2])]);

  for (const [lat, lng] of candidates) {
    if (isValidCoords(lat, lng)) return { lat, lng };
  }
  return null;
}

/** Best available coordinates: explicit lat/lng first, then anything inside the map URL. */
export function resolveCoords(location?: StoreLocation | null): GeoPoint | null {
  if (!location) return null;

  const lat = toNumber(location.latitude);
  const lng = toNumber(location.longitude);
  if (isValidCoords(lat, lng)) return { lat: lat as number, lng: lng as number };

  return parseCoordsFromMapUrl(location.googleMapUrl);
}

/** "139, Phnom Penh, Kandal" — skips blanks and duplicated city/province. */
export function formatAddress(location?: StoreLocation | null): string {
  if (!location) return "";
  const parts = [location.address, location.city, location.province]
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean);

  return parts
    .filter((part, i) => parts.findIndex((p) => p.toLowerCase() === part.toLowerCase()) === i)
    .join(", ");
}

/** The text query used when there are no coordinates to point at. */
function addressQuery(location?: StoreLocation | null): string {
  const address = formatAddress(location);
  if (!address) return "";
  const name = location?.businessName?.trim();
  return name ? `${name}, ${address}` : address;
}

export type MapLinks = {
  /** iframe src, or null when there is nothing to show */
  embedUrl: string | null;
  /** opens the location in Google Maps */
  linkUrl: string | null;
  /** opens turn-by-turn directions to the location */
  directionsUrl: string | null;
  /** true when the pin sits on real coordinates rather than a fuzzy text search */
  isPrecise: boolean;
};

export function buildMapLinks(location?: StoreLocation | null, zoom = 16): MapLinks {
  const coords = resolveCoords(location);

  if (coords) {
    const q = `${coords.lat},${coords.lng}`;
    return {
      embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=${zoom}&hl=en&output=embed`,
      linkUrl:
        location?.googleMapUrl?.startsWith("http")
          ? location.googleMapUrl
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`,
      isPrecise: true,
    };
  }

  const query = addressQuery(location);
  if (query) {
    const encoded = encodeURIComponent(query);
    return {
      embedUrl: `https://www.google.com/maps?q=${encoded}&z=${zoom - 2}&hl=en&output=embed`,
      linkUrl: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encoded}`,
      isPrecise: false,
    };
  }

  // Nothing but a raw map URL — still worth linking out to.
  if (location?.googleMapUrl?.startsWith("http")) {
    return {
      embedUrl: null,
      linkUrl: location.googleMapUrl,
      directionsUrl: null,
      isPrecise: false,
    };
  }

  return { embedUrl: null, linkUrl: null, directionsUrl: null, isPrecise: false };
}
