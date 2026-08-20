"use client";

import { useState } from "react";
import {
  Check,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useMakeAddressDefaultMutation,
  useUpdateAddressMutation,
  type Address,
  type CreateAddressRequest,
} from "@/lib/api/addressApi";
import { buildMapLinks } from "@/lib/maps";
import { cn } from "@/lib/utils";

type Props = {
  /** prefilled on a brand-new address so the user types less */
  defaultRecipient?: string;
  defaultPhone?: string;
  onToast?: (toast: { type: "success" | "error"; message: string }) => void;
};

type FormState = {
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  province: string;
  latitude: string;
  longitude: string;
  isDefault: boolean;
};

const EMPTY_FORM: FormState = {
  label: "",
  recipient: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  province: "",
  latitude: "",
  longitude: "",
  isDefault: false,
};

/** Field caps come straight from the API's AddressRequest schema. */
const MAX = {
  label: 50,
  recipient: 255,
  phone: 30,
  line1: 2000,
  line2: 2000,
  city: 100,
  province: 100,
};

function toForm(address: Address): FormState {
  return {
    label: address.label ?? "",
    recipient: address.recipient ?? "",
    phone: address.phone ?? "",
    line1: address.line1 ?? "",
    line2: address.line2 ?? "",
    city: address.city ?? "",
    province: address.province ?? "",
    latitude: address.latitude != null ? String(address.latitude) : "",
    longitude: address.longitude != null ? String(address.longitude) : "",
    isDefault: Boolean(address.isDefault),
  };
}

function parseCoord(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

function apiMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: { message?: string; errorDetails?: { fieldMessage?: string }[] } })
    ?.data;
  return data?.errorDetails?.[0]?.fieldMessage || data?.message || fallback;
}

export default function AddressBook({
  defaultRecipient,
  defaultPhone,
  onToast,
}: Props) {
  const { data: addresses = [], isLoading, isError, refetch } =
    useGetAddressesQuery();

  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [makeDefault] = useMakeAddressDefaultMutation();

  /** null = closed, "new" = create form, otherwise the id being edited */
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const saving = isCreating || isUpdating;

  function openCreate() {
    setForm({
      ...EMPTY_FORM,
      recipient: defaultRecipient ?? "",
      phone: defaultPhone ?? "",
      isDefault: addresses.length === 0,
    });
    setEditing("new");
  }

  function openEdit(address: Address) {
    setForm(toForm(address));
    setEditing(address.id);
  }

  function close() {
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.line1.trim()) {
      onToast?.({ type: "error", message: "Street address is required." });
      return;
    }

    const payload: CreateAddressRequest = {
      label: form.label.trim() || undefined,
      recipient: form.recipient.trim() || undefined,
      phone: form.phone.trim() || undefined,
      line1: form.line1.trim(),
      line2: form.line2.trim() || undefined,
      city: form.city.trim() || undefined,
      province: form.province.trim() || undefined,
      latitude: parseCoord(form.latitude),
      longitude: parseCoord(form.longitude),
    };

    try {
      if (editing === "new") {
        await createAddress({ ...payload, isDefault: form.isDefault }).unwrap();
        onToast?.({ type: "success", message: "Delivery address added." });
      } else if (editing) {
        await updateAddress({
          id: editing,
          body: { ...payload, isDefault: form.isDefault },
        }).unwrap();
        onToast?.({ type: "success", message: "Delivery address updated." });
      }
      close();
    } catch (err) {
      onToast?.({
        type: "error",
        message: apiMessage(err, "Could not save this address. Please try again."),
      });
    }
  }

  async function handleDelete(id: string) {
    setPendingId(id);
    try {
      await deleteAddress(id).unwrap();
      onToast?.({ type: "success", message: "Delivery address removed." });
      setConfirmDelete(null);
    } catch (err) {
      onToast?.({
        type: "error",
        message: apiMessage(err, "Could not remove this address."),
      });
    } finally {
      setPendingId(null);
    }
  }

  async function handleMakeDefault(id: string) {
    setPendingId(id);
    try {
      await makeDefault(id).unwrap();
      onToast?.({ type: "success", message: "Default delivery address updated." });
    } catch (err) {
      onToast?.({
        type: "error",
        message: apiMessage(err, "Could not set the default address."),
      });
    } finally {
      setPendingId(null);
    }
  }

  /* ── loading ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-white py-16 shadow-sm ring-1 ring-black/5">
        <Loader2 size={22} className="animate-spin text-[#6C4CD8]" />
      </div>
    );
  }

  /* ── the request failed outright ── */
  if (isError) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <MapPin size={22} className="mx-auto text-[#B5B0CA]" />
        <p className="mt-3 text-base font-semibold text-[#1A1330]">
          Could not load your addresses
        </p>
        <p className="mt-1 text-sm text-[#6B6580]">
          Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-xl bg-[#6C4CD8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5C3DC8]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-[#EAE7F3] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1A1330]">Delivery Addresses</h2>
          <p className="mt-1 text-sm text-[#6B6580]">
            Saved addresses are offered at checkout. Your default is selected
            automatically.
          </p>
        </div>
        {editing === null && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#6C4CD8] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#6C4CD8]/20 transition hover:bg-[#5C3DC8] active:scale-95"
          >
            <Plus size={16} />
            Add address
          </button>
        )}
      </div>

      {/* ── editor ── */}
      {editing !== null && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-[#E2DFEC] bg-[#FAFAFE] p-5 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1A1330]">
              {editing === "new" ? "New delivery address" : "Edit address"}
            </h3>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="rounded-lg p-1.5 text-[#8D86A8] transition hover:bg-white hover:text-[#6C4CD8]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              id="addr-label"
              label="Label"
              hint="Home, Office, …"
              value={form.label}
              maxLength={MAX.label}
              onChange={(v) => set("label", v)}
            />
            <Field
              id="addr-recipient"
              label="Recipient name"
              value={form.recipient}
              maxLength={MAX.recipient}
              onChange={(v) => set("recipient", v)}
            />
            <Field
              id="addr-phone"
              label="Contact phone"
              type="tel"
              placeholder="012 345 678"
              value={form.phone}
              maxLength={MAX.phone}
              onChange={(v) => set("phone", v)}
            />
            <Field
              id="addr-city"
              label="City / District"
              value={form.city}
              maxLength={MAX.city}
              onChange={(v) => set("city", v)}
            />
            <Field
              id="addr-province"
              label="Province"
              value={form.province}
              maxLength={MAX.province}
              onChange={(v) => set("province", v)}
            />
            <Field
              id="addr-line2"
              label="Apartment, floor (optional)"
              value={form.line2}
              maxLength={MAX.line2}
              onChange={(v) => set("line2", v)}
            />
          </div>

          <div className="mt-4">
            <Field
              id="addr-line1"
              label="Street address"
              required
              placeholder="House #42B, Street 271, Sangkat Tuol Sangkae"
              value={form.line1}
              maxLength={MAX.line1}
              onChange={(v) => set("line1", v)}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="addr-lat"
              label="Latitude (optional)"
              placeholder="11.5564"
              value={form.latitude}
              onChange={(v) => set("latitude", v)}
            />
            <Field
              id="addr-lng"
              label="Longitude (optional)"
              placeholder="104.9282"
              value={form.longitude}
              onChange={(v) => set("longitude", v)}
            />
          </div>
          <p className="mt-2 text-xs text-[#8D86A8]">
            Coordinates let the courier open your exact pin in Google Maps. Copy
            them from a Google Maps pin if you have one.
          </p>

          <label className="mt-5 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => set("isDefault", e.target.checked)}
              className="h-4 w-4 rounded border-[#E2DFEC] text-[#6C4CD8] focus:ring-[#6C4CD8]"
            />
            <span className="text-sm font-medium text-[#1A1330]">
              Use as my default delivery address
            </span>
          </label>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#EAE7F3] pt-5">
            <button
              type="button"
              onClick={close}
              className="rounded-xl border border-[#E2DFEC] px-5 py-2.5 text-sm font-semibold text-[#5A5470] transition hover:bg-white active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.line1.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#6C4CD8]/20 transition hover:bg-[#5C3DC8] active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check size={16} />
                  {editing === "new" ? "Add address" : "Save changes"}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── list ── */}
      {addresses.length === 0 && editing === null ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#E2DFEC] bg-[#FAFAFE] py-14 text-center">
          <MapPin size={24} className="mx-auto text-[#C4BCDA]" />
          <p className="mt-3 text-base font-semibold text-[#1A1330]">
            No delivery addresses yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[#6B6580]">
            Add one now and it will be ready to pick at checkout.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5C3DC8]"
          >
            <Plus size={16} />
            Add your first address
          </button>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {addresses.map((address) => (
            <AddressRow
              key={address.id}
              address={address}
              busy={pendingId === address.id}
              confirming={confirmDelete === address.id}
              onEdit={() => openEdit(address)}
              onMakeDefault={() => handleMakeDefault(address.id)}
              onAskDelete={() => setConfirmDelete(address.id)}
              onCancelDelete={() => setConfirmDelete(null)}
              onConfirmDelete={() => handleDelete(address.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── pieces ─────────────────────────────────────────────────────────────── */

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  required,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-[#1A1330]"
      >
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
        {hint && (
          <span className="ml-2 font-normal text-[#8D86A8]">{hint}</span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#E2DFEC] bg-white px-4 py-3 text-sm text-[#1A1330] placeholder:text-[#B5B0CA] focus:border-[#6C4CD8] focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
      />
    </div>
  );
}

function AddressRow({
  address,
  busy,
  confirming,
  onEdit,
  onMakeDefault,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  address: Address;
  busy: boolean;
  confirming: boolean;
  onEdit: () => void;
  onMakeDefault: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const isDefault = Boolean(address.isDefault);

  const lines = [address.line1, address.line2].filter(Boolean).join(", ");
  const region = [address.city, address.province].filter(Boolean).join(", ");

  const { linkUrl } = buildMapLinks({
    latitude: address.latitude,
    longitude: address.longitude,
    address: address.line1,
    city: address.city,
    province: address.province,
  });

  return (
    <li
      className={cn(
        "rounded-2xl border p-5 transition",
        isDefault
          ? "border-[#6C4CD8]/40 bg-[#F8F6FF] ring-1 ring-[#6C4CD8]/10"
          : "border-[#EDEBF3] hover:bg-[#FAFAFE]"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-bold text-[#1A1330]">
              {address.label?.trim() || "Delivery address"}
            </p>
            {isDefault && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#6C4CD8] px-2.5 py-0.5 text-[11px] font-bold text-white">
                <Star size={10} fill="white" />
                Default
              </span>
            )}
          </div>

          {address.recipient && (
            <p className="mt-1.5 text-sm font-semibold text-[#5A5470]">
              {address.recipient}
              {address.phone && (
                <span className="font-normal text-[#8D86A8]">
                  {" · "}
                  {address.phone}
                </span>
              )}
            </p>
          )}

          <p className="mt-1 text-sm leading-relaxed text-[#6B6580]">
            {lines || "No street address on file"}
            {region && (
              <>
                <br />
                {region}
              </>
            )}
          </p>

          {linkUrl && (
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6C4CD8] hover:underline"
            >
              <MapPin size={13} />
              View on Google Maps
            </a>
          )}
        </div>

        {/* actions */}
        <div className="flex shrink-0 items-center gap-2">
          {!isDefault && (
            <button
              type="button"
              onClick={onMakeDefault}
              disabled={busy}
              className="rounded-lg border border-[#E2DFEC] px-3 py-2 text-xs font-bold text-[#6C4CD8] transition hover:bg-white disabled:opacity-50"
            >
              Set default
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit address"
            className="rounded-lg border border-[#E2DFEC] p-2 text-[#5A5470] transition hover:bg-white hover:text-[#6C4CD8]"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={onAskDelete}
            aria-label="Delete address"
            className="rounded-lg border border-[#E2DFEC] p-2 text-[#5A5470] transition hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* delete confirmation */}
      {confirming && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-50 px-4 py-3">
          <p className="text-sm font-medium text-rose-700">
            Remove this address? This cannot be undone.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancelDelete}
              className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#5A5470] transition hover:bg-white"
            >
              Keep it
            </button>
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
            >
              {busy && <Loader2 size={12} className="animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
