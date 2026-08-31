"use client";

import { useEffect, useMemo, useRef } from "react";
// @ts-ignore
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
// @ts-ignore
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type LatLng = { lat: number; lng: number };

type Props = {
  /** current pin, or null when the shop has no coordinates yet */
  value: LatLng | null;
  onChange: (next: LatLng) => void;
  /** where to centre when there is no pin — defaults to central Phnom Penh */
  fallbackCenter?: LatLng;
  height?: number;
};

/** Central Phnom Penh — a sensible default for a Cambodian marketplace. */
const PHNOM_PENH: LatLng = { lat: 11.5564, lng: 104.9282 };

/**
 * Leaflet's default marker points at image assets that bundlers rewrite, which
 * is the classic "marker is a broken image" bug. A divIcon sidesteps assets
 * entirely and lets the pin match the app's palette.
 */
// @ts-ignore
const pinIcon = typeof window !== "undefined" && L?.divIcon ? L.divIcon({
  className: "",
  html: `
    <div style="
      width:28px;height:28px;
      transform:translate(-50%,-100%) rotate(-45deg);
      border-radius:50% 50% 50% 0;
      background:#6C4CD8;
      border:3px solid #fff;
      box-shadow:0 4px 14px rgba(108,76,216,.45);
    "></div>`,
  iconSize: [28, 28],
  iconAnchor: [0, 0],
}) : undefined;

/** Keeps the Leaflet view in step when the pin is set from outside the map. */
function Recenter({ position }: { position: LatLng }) {
  const map = useMap();
  const last = useRef<string>("");

  useEffect(() => {
    const key = `${position.lat},${position.lng}`;
    if (key === last.current) return;
    last.current = key;
    map.setView([position.lat, position.lng], map.getZoom(), { animate: true });
  }, [map, position]);

  return null;
}

/** Clicking anywhere on the map drops the pin there. */
function ClickToPlace({ onChange }: { onChange: (next: LatLng) => void }) {
  useMapEvents({
    click(e: any) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/**
 * Leaflet sizes itself on mount; inside a panel that was hidden or resized it
 * can come up with the wrong dimensions and render grey. Re-measure once.
 */
function FixSize() {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 120);
    return () => clearTimeout(id);
  }, [map]);
  return null;
}

export default function PinPicker({
  value,
  onChange,
  fallbackCenter = PHNOM_PENH,
  height = 320,
}: Props) {
  const center = value ?? fallbackCenter;

  const handlers = useMemo(
    () => ({
      dragend(e: any) {
        const { lat, lng } = e.target.getLatLng();
        onChange({ lat, lng });
      },
    }),
    [onChange]
  );

  return (
    <div
      className="relative z-0 isolate overflow-hidden rounded-2xl border border-[#E2DFEC]"
      style={{ height }}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={value ? 16 : 12}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <FixSize />
        <ClickToPlace onChange={onChange} />
        {value && <Recenter position={value} />}
        {value && (
          <Marker
            position={[value.lat, value.lng]}
            draggable
            eventHandlers={handlers}
            icon={pinIcon}
            keyboard
            alt="Shop location marker — drag to move"
          />
        )}
      </MapContainer>
    </div>
  );
}
