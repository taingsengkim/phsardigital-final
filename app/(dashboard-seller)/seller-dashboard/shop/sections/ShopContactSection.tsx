"use client";

import { useMemo, useState } from "react";
import { Loader2, Phone, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import {
  useGetSellerProfileQuery,
  useUpdateSellerProfileMutation,
  type SellerProfile,
  type UpdateSellerProfilePayload,
} from "@/lib/api/sellerApi";
import { AuthToast, type ToastState } from "@/components/auth/AuthToast";
import { cn } from "@/lib/utils";

const MAX_PHONE = 20;
const MAX_SOCIALS = 6;

type Draft = {
  phoneNumber: string;
  socialLink: string[];
};

function toDraft(profile: SellerProfile | null | undefined): Draft {
  return {
    phoneNumber: profile?.phoneNumber ?? "",
    socialLink: [...(profile?.socialLink ?? [])],
  };
}

function readApiError(err: unknown, fallback: string): string {
  const e = err as {
    data?: { message?: string; errorDetails?: { fieldMessage?: string }[] };
  };
  return e?.data?.errorDetails?.[0]?.fieldMessage || e?.data?.message || fallback;
}

/** Accepts a bare domain and normalises it, so sellers need not type https://. */
function normaliseUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isUsableUrl(value: string): boolean {
  try {
    const url = new URL(normaliseUrl(value));
    return Boolean(url.hostname) && url.hostname.includes(".");
  } catch {
    return false;
  }
}

export default function ShopContactSection() {
  const { data: profile, isLoading, isFetching } = useGetSellerProfileQuery();
  const [updateProfile, { isLoading: isMutating }] = useUpdateSellerProfileMutation();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const saved = useMemo(() => toDraft(profile), [profile]);
  const current = draft ?? saved;
  const isSaving = isMutating || isFetching;

  const dirty =
    current.phoneNumber !== saved.phoneNumber ||
    current.socialLink.length !== saved.socialLink.length ||
    current.socialLink.some((link, i) => link !== saved.socialLink[i]);

  function patch(next: Partial<Draft>) {
    setDraft((prev) => ({ ...(prev ?? saved), ...next }));
  }

  function setLink(index: number, value: string) {
    const next = [...current.socialLink];
    next[index] = value;
    patch({ socialLink: next });
  }

  function addLink() {
    if (current.socialLink.length >= MAX_SOCIALS) return;
    patch({ socialLink: [...current.socialLink, ""] });
  }

  function removeLink(index: number) {
    patch({ socialLink: current.socialLink.filter((_, i) => i !== index) });
  }

  const invalidLinks = current.socialLink
    .map((link, i) => ({ link, i }))
    .filter(({ link }) => link.trim() !== "" && !isUsableUrl(link));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (invalidLinks.length > 0) {
      setToast({
        type: "error",
        message: "Fix the highlighted links before saving.",
      });
      return;
    }

    // Blank rows are just UI scaffolding — drop them before sending.
    const links = current.socialLink
      .map(normaliseUrl)
      .filter((link) => link !== "");

    const payload: UpdateSellerProfilePayload = {};
    if (current.phoneNumber !== saved.phoneNumber)
      payload.phoneNumber = current.phoneNumber.trim();

    const linksChanged =
      links.length !== saved.socialLink.length ||
      links.some((link, i) => link !== saved.socialLink[i]);
    if (linksChanged) payload.socialLink = links;

    if (Object.keys(payload).length === 0) {
      setToast({ type: "error", message: "Nothing to save yet." });
      return;
    }

    try {
      await updateProfile(payload).unwrap();
      setDraft(null);
      setToast({ type: "success", message: "Contact details saved." });
    } catch (err) {
      setToast({
        type: "error",
        message: readApiError(err, "Could not save your contact details."),
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

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
      {/* ── phone ── */}
      <section className="flex flex-col gap-5 rounded-2xl border border-[#EDEBF3] bg-white p-6">
        <div>
          <h2 className="text-sm font-bold text-[#1A1330]">Phone number</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#8D86A8]">
            Shown as a tap-to-call button on your product pages. Leave it empty
            to keep buyers in chat instead.
          </p>
        </div>

        <div className="relative">
          <Phone
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B5B0CA]"
          />
          <input
            id="shop-phone"
            type="tel"
            value={current.phoneNumber}
            maxLength={MAX_PHONE}
            placeholder="012 345 678"
            onChange={(e) => patch({ phoneNumber: e.target.value })}
            className="w-full rounded-xl border border-[#E2DFEC] bg-white py-3 pl-11 pr-4 text-sm tabular-nums text-[#1A1330] placeholder:text-[#B5B0CA] focus:border-[#6C4CD8] focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
          />
        </div>
      </section>

      {/* ── socials ── */}
      <section className="flex flex-col gap-4 rounded-2xl border border-[#EDEBF3] bg-white p-6">
        <div>
          <h2 className="text-sm font-bold text-[#1A1330]">Social links</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#8D86A8]">
            Facebook, Telegram, Instagram — up to {MAX_SOCIALS}. Buyers see these
            on your shop panel.
          </p>
        </div>

        {current.socialLink.length === 0 ? (
          <p className="rounded-xl bg-[#F8F7FB] px-4 py-6 text-center text-sm text-[#8D86A8]">
            No links yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {current.socialLink.map((link, i) => {
              const bad = link.trim() !== "" && !isUsableUrl(link);
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={link}
                      aria-label={`Social link ${i + 1}`}
                      aria-invalid={bad}
                      placeholder="facebook.com/yourshop"
                      onChange={(e) => setLink(i, e.target.value)}
                      className={cn(
                        "w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1A1330] placeholder:text-[#B5B0CA] focus:outline-none focus:ring-2",
                        bad
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                          : "border-[#E2DFEC] focus:border-[#6C4CD8] focus:ring-[#6C4CD8]/15"
                      )}
                    />
                    {bad && (
                      <p className="mt-1.5 text-xs text-rose-700">
                        That does not look like a web address.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    aria-label={`Remove link ${i + 1}`}
                    className="mt-1 rounded-lg border border-[#E2DFEC] p-2.5 text-[#5A5470] transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={addLink}
          disabled={current.socialLink.length >= MAX_SOCIALS}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#E2DFEC] px-3 py-2 text-xs font-bold text-[#6C4CD8] transition hover:bg-[#F1EFFA] disabled:opacity-40"
        >
          <Plus size={13} />
          Add link
        </button>

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
                Save contact
              </>
            )}
          </button>
        </div>
      </section>

      <AuthToast toast={toast} onClose={() => setToast(null)} />
    </form>
  );
}
