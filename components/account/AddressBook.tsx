"use client";

import { useState } from "react";
import {
  Building,
  Camera,
  Check,
  Eye,
  Home,
  Link2,
  MapPin,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { cn, displayImageUrl } from "@/lib/utils";

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
  googleMapLink?: string;
  photos?: string[];
  city: string;
  address: string;
};

const INITIAL_MOCK_ADDRESSES: AddressItem[] = [
  {
    id: "home",
    label: "Home (Phnom Penh)",
    isDefault: true,
    fullName: "Vanneth Sok",
    phone: "012 345 6789",
    locationType: "city",
    khan: "Ruessei Kaev",
    sangkat: "Tuol Sangkae 2",
    village: "Phum 1",
    streetNo: "House #42B, Street 271",
    city: "Phnom Penh",
    address: "House #42B, Street 271, Phum 1, Sangkat Tuol Sangkae 2, Khan Ruessei Kaev",
    googleMapLink: "https://maps.google.com/?q=11.5833,104.9167",
  },
  {
    id: "office",
    label: "Office / Work",
    isDefault: false,
    fullName: "Vanneth Sok",
    phone: "012 345 6789",
    locationType: "city",
    khan: "Daun Penh",
    sangkat: "Wat Phnom",
    village: "Phum 1",
    streetNo: "Canadia Tower, 18th Floor, Monivong Blvd",
    city: "Phnom Penh",
    address: "Canadia Tower, 18th Floor, Monivong Blvd, Phum 1, Sangkat Wat Phnom, Khan Daun Penh",
  },
  {
    id: "siemreap",
    label: "Siem Reap House",
    isDefault: false,
    fullName: "Vanneth Sok",
    phone: "012 345 6789",
    locationType: "province",
    province: "Siem Reap",
    district: "Svay Dangkum",
    commune: "Sala Kamreuk",
    village: "Phum Wat Bo",
    city: "Siem Reap",
    address: "House #12, National Road 06, Phum Wat Bo, Khum Sala Kamreuk, Srok Svay Dangkum",
  },
];

type Props = {
  defaultRecipient?: string;
  defaultPhone?: string;
  onToast?: (toast: { type: "success" | "error"; message: string }) => void;
};

export default function AddressBook({ defaultRecipient, defaultPhone, onToast }: Props) {
  const [addresses, setAddresses] = useState<AddressItem[]>(INITIAL_MOCK_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("home");

  // Form Input State
  const [locationType, setLocationType] = useState<"city" | "province">("city");
  const [locationTitle, setLocationTitle] = useState("Home (Phnom Penh)");
  const [fullName, setFullName] = useState(defaultRecipient || "Vanneth Sok");
  const [phone, setPhone] = useState(defaultPhone || "012 345 6789");

  // City User Fields (Phnom Penh)
  const [khan, setKhan] = useState("Daun Penh");
  const [sangkat, setSangkat] = useState("Wat Phnom");
  const [village, setVillage] = useState("Phum 1");
  const [streetNo, setStreetNo] = useState("Canadia Tower, 18th Floor, Monivong Blvd");

  // Province User Fields
  const [province, setProvince] = useState("Siem Reap");
  const [district, setDistrict] = useState("Svay Dangkum");
  const [commune, setCommune] = useState("Sala Kamreuk");

  // Shared Optional Fields
  const [googleMapLink, setGoogleMapLink] = useState("https://maps.google.com/?q=11.5564,104.9282");
  const [housePhotos, setHousePhotos] = useState<string[]>([]);
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);

  // Formatted address string
  const fullAddressString =
    locationType === "city"
      ? `${streetNo ? `Street ${streetNo}, ` : ""}${village ? `Phum ${village}, ` : ""}${sangkat ? `Sangkat ${sangkat}, ` : ""}${khan ? `Khan ${khan}, ` : ""}Phnom Penh`
      : `${village ? `Phum ${village}, ` : ""}${commune ? `Khum/Commune ${commune}, ` : ""}${district ? `Srok/District ${district}, ` : ""}${province || "Province"}`;

  // Handle selecting a saved address card
  function handleSelectSavedAddress(addr: AddressItem) {
    setSelectedAddressId(addr.id);
    setLocationTitle(addr.label);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setLocationType(addr.locationType);
    if (addr.locationType === "city") {
      setKhan(addr.khan || "Daun Penh");
      setSangkat(addr.sangkat || "Wat Phnom");
      setVillage(addr.village || "Phum 1");
      setStreetNo(addr.streetNo || addr.address || "");
    } else {
      setProvince(addr.province || "Siem Reap");
      setDistrict(addr.district || "Svay Dangkum");
      setCommune(addr.commune || "Sala Kamreuk");
      setVillage(addr.village || addr.address || "");
    }
    setGoogleMapLink(addr.googleMapLink || "");
    setHousePhotos(addr.photos || []);
  }

  // Handle clicking + New Location
  function handleAddNewAddressClick() {
    setSelectedAddressId("new");
    setLocationTitle("");
    setFullName(defaultRecipient || "Vanneth Sok");
    setPhone(defaultPhone || "012 345 6789");
    setLocationType("city");
    setKhan("");
    setSangkat("");
    setVillage("");
    setStreetNo("");
    setProvince("Siem Reap");
    setDistrict("");
    setCommune("");
    setGoogleMapLink("");
    setHousePhotos([]);
  }

  // Handle Save / Update Address
  function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!locationTitle.trim()) {
      onToast?.({ type: "error", message: "Please enter a location title." });
      return;
    }
    if (!fullName.trim() || !phone.trim()) {
      onToast?.({ type: "error", message: "Please enter full name and phone number." });
      return;
    }

    if (selectedAddressId === "new") {
      const newAddr: AddressItem = {
        id: `addr_${Date.now()}`,
        label: locationTitle.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        locationType,
        khan,
        sangkat,
        village,
        streetNo,
        province,
        district,
        commune,
        googleMapLink,
        photos: housePhotos,
        city: locationType === "city" ? "Phnom Penh" : province,
        address: fullAddressString,
      };
      setAddresses((prev) => [...prev, newAddr]);
      setSelectedAddressId(newAddr.id);
      onToast?.({ type: "success", message: "New delivery address saved!" });
    } else {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === selectedAddressId
            ? {
                ...a,
                label: locationTitle.trim(),
                fullName: fullName.trim(),
                phone: phone.trim(),
                locationType,
                khan,
                sangkat,
                village,
                streetNo,
                province,
                district,
                commune,
                googleMapLink,
                photos: housePhotos,
                city: locationType === "city" ? "Phnom Penh" : province,
                address: fullAddressString,
              }
            : a
        )
      );
      onToast?.({ type: "success", message: "Address updated successfully!" });
    }
  }

  // Handle Delete Address
  function handleDeleteAddress(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedAddressId === id) {
      handleAddNewAddressClick();
    }
    onToast?.({ type: "success", message: "Location removed." });
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
      {/* ── Header ── */}
      <div className="flex items-center gap-3.5 border-b border-[#F0EDFB] pb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F1EFFA] text-[#6C4CD8]">
          <MapPin size={22} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1330]">Delivery Address</h2>
          <p className="text-xs font-medium text-[#8B85A0]">Select a saved location or enter a new shipping address</p>
        </div>
      </div>

      <form onSubmit={handleSaveAddress} className="mt-6 space-y-6">
        {/* ── SAVED LOCATIONS CARDS ── */}
        <div>
          <label className="mb-3 block text-[13px] font-extrabold text-[#1A1330] uppercase tracking-wide">
            Saved Locations
          </label>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {addresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelectSavedAddress(addr)}
                  className={cn(
                    "relative flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-4 transition-all",
                    isSelected
                      ? "border-[#6C4CD8] bg-[#F8F7FC] shadow-sm"
                      : "border-[#EDEBF3] bg-white hover:border-[#C4B5FD]"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[14px] font-extrabold text-[#1A1330] flex items-center gap-1.5 truncate">
                      {addr.id === "home" ? (
                        <Home size={15} className="text-[#6C4CD8] shrink-0" />
                      ) : (
                        <Building size={15} className="text-[#6C4CD8] shrink-0" />
                      )}
                      <span className="truncate">{addr.label}</span>
                    </span>
                    {isSelected && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6C4CD8] text-white shadow-xs">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#8B85A0] line-clamp-2 leading-relaxed">
                    {addr.address || `${addr.streetNo || ""}, ${addr.city}`}
                  </p>
                </div>
              );
            })}

            {/* + New Location Card */}
            <div
              onClick={handleAddNewAddressClick}
              className={cn(
                "flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 text-center transition-all min-h-[90px]",
                selectedAddressId === "new"
                  ? "border-[#6C4CD8] bg-[#F8F7FC] text-[#6C4CD8]"
                  : "border-[#DCD7EC] bg-white text-[#8B85A0] hover:border-[#6C4CD8] hover:text-[#6C4CD8]"
              )}
            >
              <Plus size={18} />
              <span className="text-[13.5px] font-extrabold">+ New Location</span>
            </div>
          </div>
        </div>

        {/* ── LOCATION TYPE SELECTOR ── */}
        <div className="pt-2 border-t border-[#F0EDFB]">
          <label className="mb-2.5 block text-[13px] font-extrabold text-[#1A1330] uppercase tracking-wide">
            Location Type *
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLocationType("city")}
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
              onClick={() => setLocationType("province")}
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
              onChange={(e) => setLocationTitle(e.target.value)}
              required
              placeholder="e.g. Home (Phnom Penh), Work Office, Siem Reap Villa, Condo"
              className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
            />
          </div>

          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
              Phone Number (Cambodia) *
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="012 345 6789"
              className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
            />
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
                  onChange={(e) => setKhan(e.target.value)}
                  required
                  placeholder="e.g. Daun Penh, Tuol Kork, Ruessei Kaev"
                  className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
                />
              </div>

              <div>
                <label htmlFor="sangkat" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                  Sangkat *
                </label>
                <input
                  id="sangkat"
                  type="text"
                  value={sangkat}
                  onChange={(e) => setSangkat(e.target.value)}
                  required
                  placeholder="e.g. Wat Phnom, Tuol Sangkae 2"
                  className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
                />
              </div>

              <div>
                <label htmlFor="village" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                  Village *
                </label>
                <input
                  id="village"
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  required
                  placeholder="e.g. Phum 1, Phum 4"
                  className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
                />
              </div>

              <div>
                <label htmlFor="streetNo" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                  Street No. *
                </label>
                <input
                  id="streetNo"
                  type="text"
                  value={streetNo}
                  onChange={(e) => setStreetNo(e.target.value)}
                  required
                  placeholder="e.g. Street 271, House #42B"
                  className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
                />
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
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition cursor-pointer"
                >
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
                </select>
              </div>

              <div>
                <label htmlFor="district" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                  District (Srok) *
                </label>
                <input
                  id="district"
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  placeholder="e.g. Svay Dangkum, Prasat Bakong"
                  className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
                />
              </div>

              <div>
                <label htmlFor="commune" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                  Commune (Khum) *
                </label>
                <input
                  id="commune"
                  type="text"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  required
                  placeholder="e.g. Sala Kamreuk, Svay Dangkum"
                  className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
                />
              </div>

              <div>
                <label htmlFor="villageProvince" className="mb-1.5 block text-[13px] font-bold text-[#1A1330]">
                  Village *
                </label>
                <input
                  id="villageProvince"
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  required
                  placeholder="e.g. Phum Wat Bo, Phum Mondul 1"
                  className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
                />
              </div>
            </>
          )}

          {/* GOOGLE MAP LINK (OPTIONAL) */}
          <div className="sm:col-span-2">
            <label htmlFor="googleMapLink" className="mb-1.5 flex items-center justify-between text-[13px] font-bold text-[#1A1330]">
              <span className="flex items-center gap-1.5">
                <Link2 size={15} className="text-[#6C4CD8]" />
                GoogleMap (Link)
              </span>
              <span className="text-[12px] font-normal text-[#8B85A0]">Optional</span>
            </label>
            <input
              id="googleMapLink"
              type="url"
              value={googleMapLink}
              onChange={(e) => setGoogleMapLink(e.target.value)}
              placeholder="https://maps.google.com/?q=11.5564,104.9282"
              className="w-full rounded-xl border border-[#E2DFEC] bg-[#F6F5FA] px-4 py-3 text-[15px] font-medium text-[#1A1330] outline-none focus:border-[#6C4CD8] focus:bg-white transition"
            />
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
        <div className="flex items-center justify-between pt-4 border-t border-[#F0EDFB]">
          {selectedAddressId !== "new" && (
            <button
              type="button"
              onClick={() => handleDeleteAddress(selectedAddressId)}
              className="flex items-center gap-1.5 text-sm font-semibold text-rose-500 hover:text-rose-700 transition"
            >
              <Trash2 size={16} />
              Remove Location
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="submit"
              className="rounded-xl bg-[#6C4CD8] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#6C4CD8]/25 transition hover:bg-[#5B3DC0] cursor-pointer"
            >
              {selectedAddressId === "new" ? "Save New Address" : "Update Saved Address"}
            </button>
          </div>
        </div>
      </form>

      {/* ── FULL-SIZE PHOTO PREVIEW LIGHTBOX MODAL ── */}
      {viewPhotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in"
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
