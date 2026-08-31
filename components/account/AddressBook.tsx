"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Building,
  Camera,
  Check,
  Crosshair,
  Eye,
  Home,
  Loader2,
  MapPin,
  Plus,
  Star,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import { cn, displayImageUrl } from "@/lib/utils";
import {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useMakeAddressDefaultMutation,
  type Address,
} from "@/lib/api/addressApi";
import type { LatLng } from "@/components/map/PinPicker";
import { isValidCoords } from "@/lib/maps";

const PinPicker = dynamic(() => import("@/components/map/PinPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[260px] items-center justify-center rounded-2xl border border-[#E2DFEC] bg-[#F4F2FA]">
      <Loader2 className="size-6 animate-spin text-[#6C4CD8]" />
    </div>
  ),
});

export type AddressItem = {
  id: string;
  label: string;
  isDefault?: boolean;
  fullName: string;
  phone: string;
  locationType: "city" | "province";
  khan?: string;
  sangkat?: string;
  village?: string;
  streetNo?: string;
  province?: string;
  district?: string;
  commune?: string;
  latitude?: number | null;
  longitude?: number | null;
  photos?: string[];
  city: string;
  address: string;
};

/** Convert backend Address to local AddressItem */
function toAddressItem(a: Address): AddressItem {
  const isCity = a.type === "CITY";
  return {
    id: a.id,
    label: a.label?.trim() || a.locationName?.trim() || "Saved Location",
    isDefault: Boolean(a.isDefault),
    fullName: a.recipient ?? "",
    phone: a.phone ?? "",
    locationType: isCity ? "city" : "province",
    khan: isCity ? (a.district ?? "") : "",
    sangkat: isCity ? (a.commune ?? "") : "",
    district: isCity ? "" : (a.district ?? ""),
    commune: isCity ? "" : (a.commune ?? ""),
    village: a.village ?? "",
    streetNo: a.streetNo ?? "",
    province: a.province ?? (isCity ? "Phnom Penh" : ""),
    city: isCity ? "Phnom Penh" : (a.province ?? ""),
    latitude: a.latitude ?? null,
    longitude: a.longitude ?? null,
    address:
      a.formattedAddress ??
      (isCity
        ? `${a.streetNo ? `${a.streetNo}, ` : ""}${a.commune ? `${a.commune}, ` : ""}${a.district ? `${a.district}, ` : ""}Phnom Penh`
        : `${a.village ? `${a.village}, ` : ""}${a.commune ? `${a.commune}, ` : ""}${a.district ? `${a.district}, ` : ""}${a.province ?? ""}`),
    photos: (a.landmarkPhotos ?? []).map((p) => p.url ?? "").filter(Boolean),
  };
}

type Props = {
  defaultRecipient?: string;
  defaultPhone?: string;
  onToast?: (toast: { type: "success" | "error"; message: string }) => void;
};

export default function AddressBook({ defaultRecipient, defaultPhone, onToast }: Props) {
  // Live API Hooks
  const { data: serverAddresses, isLoading: isLoadingAddresses } = useGetAddressesQuery();
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [makeAddressDefault, { isLoading: isSettingDefault }] = useMakeAddressDefaultMutation();

  const addresses: AddressItem[] = useMemo(
    () => (serverAddresses ?? []).map(toAddressItem),
    [serverAddresses]
  );

  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [hasExplicitlySelected, setHasExplicitlySelected] = useState(false);

  // Form Input State — clean without fake defaults
  const [locationType, setLocationType] = useState<"city" | "province">("city");
  const [locationTitle, setLocationTitle] = useState("");
  const [fullName, setFullName] = useState(defaultRecipient || "");
  const [phone, setPhone] = useState(defaultPhone || "");

  // City User Fields (Phnom Penh)
  const [khan, setKhan] = useState("");
  const [sangkat, setSangkat] = useState("");
  const [village, setVillage] = useState("");
  const [streetNo, setStreetNo] = useState("");

  // Province User Fields
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [commune, setCommune] = useState("");

  // Map Coordinates State
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Shared Optional Fields
  const [housePhotos, setHousePhotos] = useState<string[]>([]);
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  // Automatically select default address on load if user hasn't explicitly clicked something else
  useEffect(() => {
    if (addresses.length > 0) {
      if (!hasExplicitlySelected || selectedAddressId === "new") {
        const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
        if (defaultAddr) {
          handleSelectSavedAddress(defaultAddr);
        }
      }
    } else if (!hasExplicitlySelected) {
      handleAddNewAddressClick();
    }
  }, [addresses]);

  // Handle selecting a saved address card
  function handleSelectSavedAddress(addr: AddressItem) {
    setHasExplicitlySelected(true);
    setErrors({});
    setSelectedAddressId(addr.id);
    setLocationTitle(addr.label);
    setFullName(addr.fullName || defaultRecipient || "");
    setPhone(addr.phone || defaultPhone || "");
    setLocationType(addr.locationType);
    if (addr.locationType === "city") {
      setKhan(addr.khan || "");
      setSangkat(addr.sangkat || "");
      setVillage(addr.village || "");
      setStreetNo(addr.streetNo || addr.address || "");
      setProvince("");
      setDistrict("");
      setCommune("");
    } else {
      setProvince(addr.province || addr.city || "");
      setDistrict(addr.district || "");
      setCommune(addr.commune || "");
      setVillage(addr.village || addr.address || "");
      setKhan("");
      setSangkat("");
      setStreetNo("");
    }
    setLatitude(addr.latitude ?? null);
    setLongitude(addr.longitude ?? null);
    setHousePhotos(addr.photos || []);
  }

  // Handle clicking + New Location
  function handleAddNewAddressClick() {
    setHasExplicitlySelected(true);
    setErrors({});
    setSelectedAddressId("new");
    setLocationTitle("");
    setFullName(defaultRecipient || "");
    setPhone(defaultPhone || "");
    setLocationType("city");
    setKhan("");
    setSangkat("");
    setVillage("");
    setStreetNo("");
    setProvince("");
    setDistrict("");
    setCommune("");
    setLatitude(null);
    setLongitude(null);
    setHousePhotos([]);
  }

  // Validation function
  function validateFields(): boolean {
    const errs: Record<string, string> = {};

    if (!locationTitle.trim()) {
      errs.locationTitle = "Location title is required (e.g. Home, Office)";
    } else if (locationTitle.trim().length < 2) {
      errs.locationTitle = "Location title must be at least 2 characters";
    }

    if (!fullName.trim()) {
      errs.fullName = "Recipient name is required";
    } else if (fullName.trim().length < 2) {
      errs.fullName = "Recipient name must be at least 2 characters";
    }

    const cleanPhone = phone.trim().replace(/[\s-]/g, "");
    if (!cleanPhone) {
      errs.phone = "Phone number is required";
    } else if (!/^(0|\+855)[0-9]{8,9}$/.test(cleanPhone) && !/^[0-9]{8,10}$/.test(cleanPhone)) {
      errs.phone = "Enter a valid phone number (e.g. 012 345 678)";
    }

    if (locationType === "city") {
      if (!khan.trim()) errs.khan = "Khan is required";
      if (!sangkat.trim()) errs.sangkat = "Sangkat is required";
      if (!village.trim()) errs.village = "Village (Phum) is required";
      if (!streetNo.trim()) errs.streetNo = "Street / House number is required";
    } else {
      if (!province.trim()) errs.province = "Please select a province";
      if (!district.trim()) errs.district = "District (Srok) is required";
      if (!commune.trim()) errs.commune = "Commune (Khum) is required";
      if (!village.trim()) errs.village = "Village (Phum) is required";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstError = Object.values(errs)[0];
      onToast?.({ type: "error", message: firstError });
      return false;
    }
    return true;
  }

  // Handle Save / Update Address via RTK Query
  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!validateFields()) {
      return;
    }

    try {
      if (selectedAddressId === "new") {
        const created = await createAddress({
          type: locationType === "city" ? "CITY" : "PROVINCE",
          label: locationTitle.trim(),
          recipient: fullName.trim(),
          phone: phone.trim(),
          locationName: locationTitle.trim(),
          streetNo: locationType === "city" ? streetNo.trim() || undefined : undefined,
          province: locationType === "province" ? province.trim() : undefined,
          district: locationType === "province" ? district.trim() : khan.trim(),
          commune: locationType === "province" ? commune.trim() : sangkat.trim(),
          village: village.trim(),
          latitude: latitude != null ? latitude : undefined,
          longitude: longitude != null ? longitude : undefined,
          isDefault: addresses.length === 0,
        }).unwrap();

        if (created?.id) {
          setSelectedAddressId(created.id);
        }
        onToast?.({ type: "success", message: "New delivery address saved successfully!" });
      } else {
        await updateAddress({
          id: selectedAddressId,
          body: {
            type: locationType === "city" ? "CITY" : "PROVINCE",
            label: locationTitle.trim(),
            recipient: fullName.trim(),
            phone: phone.trim(),
            locationName: locationTitle.trim(),
            streetNo: locationType === "city" ? streetNo.trim() || undefined : undefined,
            province: locationType === "province" ? province.trim() : undefined,
            district: locationType === "province" ? district.trim() : khan.trim(),
            commune: locationType === "province" ? commune.trim() : sangkat.trim(),
            village: village.trim(),
            latitude: latitude != null ? latitude : undefined,
            longitude: longitude != null ? longitude : undefined,
          },
        }).unwrap();

        onToast?.({ type: "success", message: "Address updated successfully!" });
      }
    } catch {
      onToast?.({ type: "error", message: "Failed to save address. Please check your details." });
    }
  }

  // Handle Delete Address
  async function handleDeleteAddress(id: string) {
    try {
      await deleteAddress(id).unwrap();
      onToast?.({ type: "success", message: "Location removed from your address book." });
      handleAddNewAddressClick();
    } catch {
      onToast?.({ type: "error", message: "Failed to delete address." });
    }
  }

  // Handle Make Default Address
  async function handleSetDefault(id: string) {
    try {
      await makeAddressDefault(id).unwrap();
      onToast?.({ type: "success", message: "Default delivery address updated!" });
    } catch {
      onToast?.({ type: "error", message: "Failed to set default address." });
    }
  }

  const isSaving = isCreating || isUpdating;
  const currentSelectedAddr = addresses.find((a) => a.id === selectedAddressId);
  const coordsValid = isValidCoords(latitude, longitude);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EDFB] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F1EFFA] text-[#6C4CD8]">
            <MapPin size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#1A1330]">Delivery Address</h2>
              {addresses.length > 0 && (
                <span className="rounded-full bg-[#EDE9FB] px-2.5 py-0.5 text-xs font-black text-[#6C4CD8]">
                  {addresses.length} {addresses.length === 1 ? "Saved" : "Saved"}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-[#8B85A0]">
              Manage your delivery locations and shipping addresses
            </p>
          </div>
        </div>

        {isLoadingAddresses && (
          <span className="flex items-center gap-2 text-xs font-bold text-[#6C4CD8]">
            <Loader2 size={14} className="animate-spin" /> Loading addresses...
          </span>
        )}
      </div>

      <form onSubmit={handleSaveAddress} noValidate className="mt-6 space-y-6">
        {/* ── SAVED LOCATIONS CARDS ── */}
        <div>
          <label className="mb-3 block text-[13px] font-extrabold text-[#1A1330] uppercase tracking-wide">
            Saved Locations
          </label>

          {isLoadingAddresses ? (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#F8F7FB] border border-[#EDEBF3]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    className={cn(
                      "relative flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-4 transition-all min-h-[105px]",
                      isSelected
                        ? "border-[#6C4CD8] bg-[#F8F7FC] shadow-sm"
                        : "border-[#EDEBF3] bg-white hover:border-[#C4B5FD]"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[14px] font-extrabold text-[#1A1330] flex items-center gap-1.5 truncate">
                          {addr.locationType === "city" ? (
                            <Building size={15} className="text-[#6C4CD8] shrink-0" />
                          ) : (
                            <MapPin size={15} className="text-[#6C4CD8] shrink-0" />
                          )}
                          <span className="truncate">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9.5px] font-extrabold uppercase text-emerald-800 shrink-0">
                              Default
                            </span>
                          )}
                        </span>
                        {isSelected && (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6C4CD8] text-white shadow-xs">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#8B85A0] line-clamp-2 leading-relaxed">
                        {addr.address}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-[#F0EDFB] pt-1.5 text-[11px] font-semibold text-[#6B6580]">
                      <span className="truncate">
                        {addr.fullName} · {addr.phone}
                      </span>
                      {addr.latitude != null && addr.longitude != null && (
                        <span className="shrink-0 text-[#6C4CD8] font-bold">📍 Map Pin</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* + New Location Card */}
              <div
                onClick={handleAddNewAddressClick}
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 text-center transition-all min-h-[105px]",
                  selectedAddressId === "new"
                    ? "border-[#6C4CD8] bg-[#F8F7FC] text-[#6C4CD8]"
                    : "border-[#DCD7EC] bg-white text-[#8B85A0] hover:border-[#6C4CD8] hover:text-[#6C4CD8]"
                )}
              >
                <Plus size={18} />
                <span className="text-[13.5px] font-extrabold">+ New Location</span>
              </div>
            </div>
          )}
        </div>

        {/* ── LOCATION TYPE SELECTOR ── */}
        <div className="pt-2 border-t border-[#F0EDFB]">
          <label className="mb-2.5 block text-[13px] font-extrabold text-[#1A1330] uppercase tracking-wide">
            Location Type *
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setLocationType("city");
                setErrors({});
              }}
              className={cn(
                "flex-1 rounded-xl py-3 px-4 text-sm font-extrabold border-2 transition-all flex items-center justify-center gap-2 cursor-pointer",
                locationType === "city"
                  ? "border-[#6C4CD8] bg-[#F8F7FC] text-[#6C4CD8] shadow-xs"
                  : "border-[#EDEBF3] bg-white text-[#7C7596] hover:bg-[#F8F7FC]"
              )}
            >
              <Building size={16} />
              City User (Phnom Penh)
            </button>
            <button
              type="button"
              onClick={() => {
                setLocationType("province");
                setErrors({});
              }}
              className={cn(
                "flex-1 rounded-xl py-3 px-4 text-sm font-extrabold border-2 transition-all flex items-center justify-center gap-2 cursor-pointer",
                locationType === "province"
                  ? "border-[#6C4CD8] bg-[#F8F7FC] text-[#6C4CD8] shadow-xs"
                  : "border-[#EDEBF3] bg-white text-[#7C7596] hover:bg-[#F8F7FC]"
              )}
            >
              <MapPin size={16} />
              Province User
            </button>
          </div>
        </div>

        {/* ── FORM FIELDS GRID ── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Location Title / Name */}
          <div className="sm:col-span-2">
            <label htmlFor="locationTitle" className="mb-1.5 flex items-center justify-between text-[13px] font-bold text-[#1A1330]">
              <span className="flex items-center gap-1.5">
                <Building size={15} className="text-[#6C4CD8]" />
                Location Title / Name *
              </span>
              <span className="text-[12px] font-normal text-[#8B85A0]">e.g. Home, Office, Condo, Parents' House</span>
            </label>
            <input
              id="locationTitle"
              type="text"
              value={locationTitle}
              onChange={(e) => {
                setLocationTitle(e.target.value);
                clearError("locationTitle");
              }}
              placeholder="e.g. Home, Office, Condo, Siem Reap Villa"
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none transition",
                errors.locationTitle
                  ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:bg-white"
                  : "border-[#E2DFEC] bg-[#F6F5FA] focus:border-[#6C4CD8] focus:bg-white"
              )}
            />
            {errors.locationTitle && (
              <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.locationTitle}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
              Full Name (Recipient) *
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                clearError("fullName");
              }}
              placeholder="Enter recipient full name"
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none transition",
                errors.fullName
                  ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:bg-white"
                  : "border-[#E2DFEC] bg-[#F6F5FA] focus:border-[#6C4CD8] focus:bg-white"
              )}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
              Phone Number (Cambodia) *
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                clearError("phone");
              }}
              placeholder="012 345 6789"
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none transition",
                errors.phone
                  ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:bg-white"
                  : "border-[#E2DFEC] bg-[#F6F5FA] focus:border-[#6C4CD8] focus:bg-white"
              )}
            />
            {errors.phone && (
              <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.phone}
              </p>
            )}
          </div>

          {/* CITY USER FIELDS */}
          {locationType === "city" && (
            <>
              <div>
                <label htmlFor="khan" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                  Khan *
                </label>
                <input
                  id="khan"
                  type="text"
                  value={khan}
                  onChange={(e) => {
                    setKhan(e.target.value);
                    clearError("khan");
                  }}
                  placeholder="e.g. Daun Penh, Tuol Kork, Ruessei Kaev"
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none transition",
                    errors.khan
                      ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:bg-white"
                      : "border-[#E2DFEC] bg-[#F6F5FA] focus:border-[#6C4CD8] focus:bg-white"
                  )}
                />
                {errors.khan && (
                  <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.khan}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="sangkat" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                  Sangkat *
                </label>
                <input
                  id="sangkat"
                  type="text"
                  value={sangkat}
                  onChange={(e) => {
                    setSangkat(e.target.value);
                    clearError("sangkat");
                  }}
                  placeholder="e.g. Wat Phnom, Tuol Sangkae 2"
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none transition",
                    errors.sangkat
                      ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:bg-white"
                      : "border-[#E2DFEC] bg-[#F6F5FA] focus:border-[#6C4CD8] focus:bg-white"
                  )}
                />
                {errors.sangkat && (
                  <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.sangkat}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="village" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                  Village (Phum) *
                </label>
                <input
                  id="village"
                  type="text"
                  value={village}
                  onChange={(e) => {
                    setVillage(e.target.value);
                    clearError("village");
                  }}
                  placeholder="e.g. Phum 1, Phum 4"
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none transition",
                    errors.village
                      ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:bg-white"
                      : "border-[#E2DFEC] bg-[#F6F5FA] focus:border-[#6C4CD8] focus:bg-white"
                  )}
                />
                {errors.village && (
                  <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.village}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="streetNo" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                  Street No. / House No. *
                </label>
                <input
                  id="streetNo"
                  type="text"
                  value={streetNo}
                  onChange={(e) => {
                    setStreetNo(e.target.value);
                    clearError("streetNo");
                  }}
                  placeholder="e.g. Street 271, House #42B"
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none transition",
                    errors.streetNo
                      ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:bg-white"
                      : "border-[#E2DFEC] bg-[#F6F5FA] focus:border-[#6C4CD8] focus:bg-white"
                  )}
                />
                {errors.streetNo && (
                  <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.streetNo}
                  </p>
                )}
              </div>
            </>
          )}

          {/* PROVINCE USER FIELDS */}
          {locationType === "province" && (
            <>
              <div>
                <label htmlFor="province" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                  Province *
                </label>
                <select
                  id="province"
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    clearError("province");
                  }}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none transition cursor-pointer",
                    errors.province
                      ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:bg-white"
                      : "border-[#E2DFEC] bg-[#F6F5FA] focus:border-[#6C4CD8] focus:bg-white"
                  )}
                >
                  <option value="">-- Select Province --</option>
                  <option value="Siem Reap">Siem Reap (សៀមរាប)</option>
                  <option value="Battambang">Battambang (បាត់ដំបង)</option>
                  <option value="Kampong Cham">Kampong Cham (កំពង់ចាម)</option>
                  <option value="Sihanoukville">Sihanoukville (ព្រះសីហនុ)</option>
                  <option value="Kampot">Kampot (កំពត)</option>
                  <option value="Kandal">Kandal (កណ្តាល)</option>
                  <option value="Takeo">Takeo (តាកែវ)</option>
                  <option value="Prey Veng">Prey Veng (ព្រៃវែង)</option>
                  <option value="Svay Rieng">Svay Rieng (ស្វាយរៀង)</option>
                  <option value="Kratie">Kratie (ក្រចេះ)</option>
                  <option value="Ratanakiri">Ratanakiri (រតនគិរី)</option>
                  <option value="Mondulkiri">Mondulkiri (មណ្ឌលគិរី)</option>
                  <option value="Kampong Speu">Kampong Speu (កំពង់ស្ពឺ)</option>
                  <option value="Kampong Chhnang">Kampong Chhnang (កំពង់ឆ្នាំង)</option>
                  <option value="Kampong Thom">Kampong Thom (កំពង់ធំ)</option>
                  <option value="Pursat">Pursat (ពោធិ៍សាត់)</option>
                  <option value="Banteay Meanchey">Banteay Meanchey (បន្ទាយមានជ័យ)</option>
                  <option value="Koh Kong">Koh Kong (កោះកុង)</option>
                  <option value="Kep">Kep (កែប)</option>
                  <option value="Pailin">Pailin (ប៉ៃលិន)</option>
                  <option value="Oddar Meanchey">Oddar Meanchey (ឧត្តរមានជ័យ)</option>
                  <option value="Preah Vihear">Preah Vihear (ព្រះវិហារ)</option>
                  <option value="Stung Treng">Stung Treng (ស្ទឹងត្រែង)</option>
                  <option value="Tboung Khmum">Tboung Khmum (ត្បូងឃ្មុំ)</option>
                </select>
                {errors.province && (
                  <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.province}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="district" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                  District (Srok) *
                </label>
                <input
                  id="district"
                  type="text"
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    clearError("district");
                  }}
                  placeholder="e.g. Svay Dangkum, Prasat Bakong"
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none transition",
                    errors.district
                      ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:bg-white"
                      : "border-[#E2DFEC] bg-[#F6F5FA] focus:border-[#6C4CD8] focus:bg-white"
                  )}
                />
                {errors.district && (
                  <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.district}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="commune" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                  Commune (Khum) *
                </label>
                <input
                  id="commune"
                  type="text"
                  value={commune}
                  onChange={(e) => {
                    setCommune(e.target.value);
                    clearError("commune");
                  }}
                  placeholder="e.g. Sala Kamreuk, Svay Dangkum"
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none transition",
                    errors.commune
                      ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:bg-white"
                      : "border-[#E2DFEC] bg-[#F6F5FA] focus:border-[#6C4CD8] focus:bg-white"
                  )}
                />
                {errors.commune && (
                  <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.commune}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="villageProvince" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                  Village (Phum) *
                </label>
                <input
                  id="villageProvince"
                  type="text"
                  value={village}
                  onChange={(e) => {
                    setVillage(e.target.value);
                    clearError("village");
                  }}
                  placeholder="e.g. Phum Wat Bo, Phum Mondul 1"
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none transition",
                    errors.village
                      ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:bg-white"
                      : "border-[#E2DFEC] bg-[#F6F5FA] focus:border-[#6C4CD8] focus:bg-white"
                  )}
                />
                {errors.village && (
                  <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.village}
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── MAP PIN LOCATION PICKER ── */}
          <div className="sm:col-span-2 space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-[13px] font-extrabold text-[#1A1330] uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin size={15} className="text-[#6C4CD8]" />
                  Pin Delivery Location On Map
                </label>
                <p className="text-xs text-[#8B85A0]">
                  Click on the map or drag the purple pin to set exact delivery GPS coordinates
                </p>
              </div>

              <div className="flex items-center gap-2">
                {coordsValid && (
                  <span className="rounded-full bg-[#EDE9FB] px-2.5 py-1 text-xs font-bold text-[#6C4CD8]">
                    {latitude?.toFixed(4)}°, {longitude?.toFixed(4)}°
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setLatitude(pos.coords.latitude);
                          setLongitude(pos.coords.longitude);
                          onToast?.({ type: "success", message: "Located your GPS position!" });
                        },
                        () => {
                          onToast?.({ type: "error", message: "Unable to retrieve your GPS position." });
                        }
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2DFEC] bg-white px-3 py-1.5 text-xs font-semibold text-[#5A5470] transition hover:bg-[#F8F7FB] active:scale-95 cursor-pointer"
                >
                  <Crosshair size={13} className="text-[#6C4CD8]" />
                  Use Current GPS
                </button>
              </div>
            </div>

            <div className="relative z-0 isolate overflow-hidden rounded-2xl border-2 border-[#E2DFEC] shadow-xs">
              <PinPicker
                value={coordsValid ? { lat: latitude!, lng: longitude! } : null}
                onChange={({ lat, lng }) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
                height={260}
                fallbackCenter={
                  locationType === "province" && province === "Siem Reap"
                    ? { lat: 13.3671, lng: 103.8448 }
                    : { lat: 11.5564, lng: 104.9282 }
                }
              />
            </div>
          </div>

          {/* HOUSE OR OFFICE PHOTOS */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 flex items-center justify-between text-[13px] font-bold text-[#1A1330]">
              <span className="flex items-center gap-1.5">
                <Camera size={15} className="text-[#6C4CD8]" />
                House or Office Photos
              </span>
              <span className="text-[12px] font-normal text-[#8B85A0]">Optional (Multiple)</span>
            </label>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-sm font-semibold text-[#6C4CD8] transition hover:border-[#6C4CD8] hover:bg-[#F8F7FC]">
                <Camera size={18} />
                <span>{housePhotos.length > 0 ? `+ Add More Photos (${housePhotos.length} uploaded)` : "Upload House or Office Photos"}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach((file) => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (reader.result) {
                          setHousePhotos((prev) => [...prev, reader.result as string]);
                        }
                      };
                      reader.readAsDataURL(file);
                    });
                    e.target.value = "";
                  }}
                />
              </label>

              {housePhotos.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {housePhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="group relative h-16 w-16 cursor-pointer overflow-hidden rounded-2xl border-2 border-[#EDEBF3] shadow-xs transition-transform hover:scale-105 hover:border-[#6C4CD8]"
                      onClick={() => setViewPhotoUrl(photo)}
                      title="Click to view full image"
                    >
                      <img src={displayImageUrl(photo)} alt={`House photo ${idx + 1}`} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye size={16} className="text-white drop-shadow-md" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHousePhotos((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 transition"
                        title="Delete photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#F0EDFB]">
          <div className="flex items-center gap-3">
            {selectedAddressId !== "new" && (
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteAddress(selectedAddressId)}
                className="flex items-center gap-1.5 text-sm font-semibold text-rose-500 hover:text-rose-700 transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Remove Location
              </button>
            )}

            {selectedAddressId !== "new" && currentSelectedAddr && !currentSelectedAddr.isDefault && (
              <button
                type="button"
                disabled={isSettingDefault}
                onClick={() => handleSetDefault(selectedAddressId)}
                className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition cursor-pointer disabled:opacity-50"
              >
                {isSettingDefault ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
                Set as Default Address
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#6C4CD8]/25 transition hover:bg-[#5B3DC0] cursor-pointer disabled:opacity-50"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {selectedAddressId === "new" ? "Save New Address" : "Update Saved Address"}
            </button>
          </div>
        </div>
      </form>

      {/* ── FULL-SIZE PHOTO PREVIEW LIGHTBOX MODAL ── */}
      {viewPhotoUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setViewPhotoUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-3xl bg-white p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setViewPhotoUrl(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black cursor-pointer"
              title="Close full view"
            >
              <X size={20} />
            </button>
            <img
              src={displayImageUrl(viewPhotoUrl)}
              alt="House Photo Full View"
              className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
