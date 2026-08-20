"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, RotateCcw, Save, Trash2 } from "lucide-react";
import {
  useGetSellerProfileQuery,
  useUpdateSellerProfileMutation,
  useUploadLogoFileMutation,
  type SellerProfile,
  type UpdateSellerProfilePayload,
} from "@/lib/api/sellerApi";
import { AuthToast, type ToastState } from "@/components/auth/AuthToast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** Field caps from SellerProfileUpdateRequest. */
const MAX = {
  businessName: 255,
  businessType: 100,
  description: 2000,
  biography: 1000,
};

/** The canonical types the seller application offers. */
const BUSINESS_TYPES = [
  { value: "INDIVIDUAL", label: "Individual seller" },
  { value: "SOLE_PROPRIETORSHIP", label: "Sole proprietorship" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "COMPANY", label: "Registered company" },
];

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

type Draft = {
  businessName: string;
  businessType: string;
  description: string;
  biography: string;
  /** set only after a fresh upload; otherwise the saved logo stands */
  logoObjectName: string | null;
  logoPreview: string | null;
};

function toDraft(profile: SellerProfile | null | undefined): Draft {
  return {
    businessName: profile?.businessName ?? "",
    businessType: profile?.businessType ?? "",
    description: profile?.description ?? "",
    biography: profile?.biography ?? "",
    logoObjectName: null,
    logoPreview: null,
  };
}

function readApiError(err: unknown, fallback: string): string {
  const e = err as {
    data?: { message?: string; errorDetails?: { fieldMessage?: string }[] };
  };
  return e?.data?.errorDetails?.[0]?.fieldMessage || e?.data?.message || fallback;
}

export default function ShopDetailsSection() {
  const { data: profile, isLoading, isFetching } = useGetSellerProfileQuery();
  const [updateProfile, { isLoading: isMutating }] = useUpdateSellerProfileMutation();
  const [uploadLogo, { isLoading: isUploading }] = useUploadLogoFileMutation();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const saved = useMemo(() => toDraft(profile), [profile]);
  const current = draft ?? saved;
  const isSaving = isMutating || isFetching;

  const dirty =
    current.businessName !== saved.businessName ||
    current.businessType !== saved.businessType ||
    current.description !== saved.description ||
    current.biography !== saved.biography ||
    current.logoObjectName !== null;

  function patch(next: Partial<Draft>) {
    setDraft((prev) => ({ ...(prev ?? saved), ...next }));
  }

  /* the saved type may be free text the select does not list — keep it selectable */
  const typeOptions = useMemo(() => {
    const known = BUSINESS_TYPES.map((t) => t.value);
    const currentType = current.businessType.trim();
    if (currentType && !known.includes(currentType)) {
      return [...BUSINESS_TYPES, { value: currentType, label: currentType }];
    }
    return BUSINESS_TYPES;
  }, [current.businessType]);

  async function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be re-picked after an error
    if (!file) return;

    if (file.size > MAX_LOGO_BYTES) {
      setToast({ type: "error", message: "Logo must be smaller than 5MB." });
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (file.type.includes("heic") || ext === "heic" || ext === "heif") {
      setToast({
        type: "error",
        message: "iPhone HEIC photos are not supported. Save it as JPEG or PNG first.",
      });
      return;
    }

    try {
      const result = await uploadLogo(file).unwrap();
      const objectName = result?.objectName;
      if (!objectName) throw new Error("Upload returned no object name");

      // Preview locally; the logo only becomes real once the profile is saved.
      patch({ logoObjectName: objectName, logoPreview: URL.createObjectURL(file) });
      setToast({
        type: "success",
        message: "Logo uploaded. Save your changes to apply it.",
      });
    } catch (err) {
      setToast({ type: "error", message: readApiError(err, "Could not upload that image.") });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!current.businessName.trim()) {
      setToast({ type: "error", message: "Your shop needs a name." });
      return;
    }

    // Omitted means unchanged, so only send what actually moved.
    const payload: UpdateSellerProfilePayload = {};
    if (current.businessName !== saved.businessName)
      payload.businessName = current.businessName.trim();
    if (current.businessType !== saved.businessType)
      payload.businessType = current.businessType.trim();
    if (current.description !== saved.description)
      payload.description = current.description.trim();
    if (current.biography !== saved.biography)
      payload.biography = current.biography.trim();
    if (current.logoObjectName) payload.logoObjectName = current.logoObjectName;

    if (Object.keys(payload).length === 0) {
      setToast({ type: "error", message: "Nothing to save yet." });
      return;
    }

    try {
      await updateProfile(payload).unwrap();
      setDraft(null);
      setToast({ type: "success", message: "Shop details saved." });
    } catch (err) {
      setToast({
        type: "error",
        message: readApiError(err, "Could not save your shop details."),
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#6C4CD8]" />
      </div>
    );
  }

  const shownLogo = current.logoPreview || profile?.logoUri || null;
  const initial = (current.businessName || "S").charAt(0).toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* ── logo ── */}
      <section className="flex flex-col items-center gap-4 rounded-2xl border border-[#EDEBF3] bg-white p-6">
        <h2 className="self-start text-sm font-bold text-[#1A1330]">Shop logo</h2>

        <div className="relative">
          {shownLogo ? (
            <Image
              src={shownLogo}
              alt="Shop logo"
              width={128}
              height={128}
              unoptimized
              className="size-32 rounded-2xl border border-[#E2DFEC] object-cover"
            />
          ) : (
            <div
              className="flex size-32 items-center justify-center rounded-2xl text-4xl font-black text-white"
              style={{ background: "linear-gradient(135deg,#8267E8,#6C4CD8)" }}
            >
              {initial}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isUploading}
            aria-label="Change logo"
            className="absolute -bottom-2 -right-2 flex size-10 items-center justify-center rounded-full bg-[#6C4CD8] text-white shadow-lg transition hover:bg-[#5C3DC8] disabled:opacity-60"
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Camera size={16} />
            )}
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleLogoSelect}
          className="hidden"
        />

        <p className="text-center text-xs leading-relaxed text-[#8D86A8]">
          JPEG, PNG, WebP or GIF, up to 5MB. Square images look best.
        </p>

        {current.logoObjectName && (
          <button
            type="button"
            onClick={() => patch({ logoObjectName: null, logoPreview: null })}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline"
          >
            <Trash2 size={12} />
            Discard new logo
          </button>
        )}
      </section>

      {/* ── text fields ── */}
      <section className="flex flex-col gap-5 rounded-2xl border border-[#EDEBF3] bg-white p-6">
        <div>
          <label
            htmlFor="shop-name"
            className="mb-2 block text-sm font-semibold text-[#1A1330]"
          >
            Shop name <span className="text-rose-500">*</span>
          </label>
          <input
            id="shop-name"
            type="text"
            value={current.businessName}
            maxLength={MAX.businessName}
            placeholder="Next Shop"
            onChange={(e) => patch({ businessName: e.target.value })}
            className="w-full rounded-xl border border-[#E2DFEC] bg-white px-4 py-3 text-sm text-[#1A1330] placeholder:text-[#B5B0CA] focus:border-[#6C4CD8] focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
          />
        </div>

        <div>
          <label
            htmlFor="shop-type"
            className="mb-2 block text-sm font-semibold text-[#1A1330]"
          >
            Business type
          </label>
          <Select value={current.businessType || "NOT_SPECIFIED"} onValueChange={(value) => patch({ businessType: value === "NOT_SPECIFIED" ? "" : value })}>
            <SelectTrigger id="shop-type" className="h-[46px] border-[#E2DFEC] px-4 text-[#1A1330] focus:border-[#6C4CD8] focus:ring-[#6C4CD8]/15">
              <SelectValue placeholder="Not specified" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOT_SPECIFIED">Not specified</SelectItem>
              {typeOptions.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <CountedTextarea
          id="shop-description"
          label="What you sell"
          hint="Shown on your product pages under the shop name."
          rows={4}
          value={current.description}
          maxLength={MAX.description}
          placeholder="Imported electronics and accessories, delivered across Phnom Penh."
          onChange={(v) => patch({ description: v })}
        />

        <CountedTextarea
          id="shop-biography"
          label="About the shop"
          hint="A longer story — how you started, what makes you different."
          rows={4}
          value={current.biography}
          maxLength={MAX.biography}
          placeholder="Family-run since 2019, specialising in…"
          onChange={(v) => patch({ biography: v })}
        />

        <div className="mt-auto flex items-center justify-end gap-3 border-t border-[#EDEBF3] pt-5">
          <button
            type="button"
            onClick={() => setDraft(null)}
            disabled={!dirty || isSaving}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E2DFEC] px-5 py-2.5 text-sm font-semibold text-[#5A5470] transition hover:bg-[#F8F7FB] disabled:opacity-40"
          >
            <RotateCcw size={15} />
            Reset
          </button>
          <button
            type="submit"
            disabled={!dirty || isSaving}
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
                Save details
              </>
            )}
          </button>
        </div>
      </section>

      <AuthToast toast={toast} onClose={() => setToast(null)} />
    </form>
  );
}

function CountedTextarea({
  id,
  label,
  hint,
  value,
  onChange,
  rows = 4,
  maxLength,
  placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[#1A1330]">
        {label}
        {hint && <span className="ml-2 font-normal text-[#8D86A8]">{hint}</span>}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#E2DFEC] bg-white p-4 text-sm leading-relaxed text-[#1A1330] placeholder:text-[#B5B0CA] focus:border-[#6C4CD8] focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
      />
      <p className="mt-1.5 text-right text-xs tabular-nums text-[#8D86A8]">
        {value.length}/{maxLength}
      </p>
    </div>
  );
}
