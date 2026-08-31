"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, QrCode, RotateCcw, Save, Store } from "lucide-react";
import {
  useGetSellerProfileQuery,
  useUpdateSellerProfileMutation,
  type SellerProfile,
  type UpdateSellerProfilePayload,
} from "@/lib/api/sellerApi";
import { AuthToast, type ToastState } from "@/components/auth/AuthToast";
import { cn } from "@/lib/utils";
import { readApiError } from "@/lib/api/api-error";

const MAX_ACCOUNT_ID = 32;
/** KHQR's own limit on the merchant name carried in the payload. */
const MAX_ACCOUNT_NAME = 25;

/** Bakong account ids read as name@bank, e.g. "anajak_store@aclb". */
const ACCOUNT_ID_PATTERN = /^[A-Za-z0-9._-]+@[A-Za-z0-9]+$/;

type Draft = {
  bakongAccountId: string;
  bakongAccountName: string;
};

function toDraft(profile: SellerProfile | null | undefined): Draft {
  return {
    bakongAccountId: profile?.bakongAccountId ?? "",
    bakongAccountName: profile?.bakongAccountName ?? "",
  };
}

export default function ShopPayoutSection() {
  const { data: profile, isLoading, isFetching } = useGetSellerProfileQuery();
  const [updateProfile, { isLoading: isMutating }] =
    useUpdateSellerProfileMutation();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const saved = useMemo(() => toDraft(profile), [profile]);
  const current = draft ?? saved;
  const isSaving = isMutating || isFetching;

  const dirty =
    current.bakongAccountId !== saved.bakongAccountId ||
    current.bakongAccountName !== saved.bakongAccountName;

  const accountId = current.bakongAccountId.trim();
  const badAccountId = accountId !== "" && !ACCOUNT_ID_PATTERN.test(accountId);

  function patch(next: Partial<Draft>) {
    setDraft((prev) => ({ ...(prev ?? saved), ...next }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (badAccountId) {
      setToast({
        type: "error",
        message: "A Bakong account looks like name@bank, for example anajak_store@aclb.",
      });
      return;
    }

    const payload: UpdateSellerProfilePayload = {};
    // An empty string is meaningful here: it clears the account upstream.
    if (accountId !== saved.bakongAccountId) payload.bakongAccountId = accountId;

    const accountName = current.bakongAccountName.trim();
    if (accountName !== saved.bakongAccountName)
      payload.bakongAccountName = accountName;

    if (Object.keys(payload).length === 0) {
      setToast({ type: "error", message: "Nothing to save yet." });
      return;
    }

    try {
      await updateProfile(payload).unwrap();
      setDraft(null);
      setToast({
        type: "success",
        message: accountId
          ? "KHQR payments are ready to take at the counter."
          : "Bakong account removed. KHQR is now off at the register.",
      });
    } catch (err) {
      setToast({
        type: "error",
        message: readApiError(
          err,
          "Could not save your Bakong account.",
          "That Bakong account is already registered to another shop.",
        ),
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
      {/* ── account ── */}
      <section className="flex flex-col gap-5 rounded-2xl border border-[#EDEBF3] bg-white p-6">
        <div>
          <h2 className="text-sm font-bold text-[#1A1330]">Bakong account</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#8D86A8]">
            Where KHQR counter sales are paid. Find it in your Bakong app under
            your profile — it reads like{" "}
            <span className="font-medium text-[#5A5470]">anajak_store@aclb</span>.
            Until this is set, the KHQR tab in the{" "}
            <Link
              href="/seller-dashboard/quick-order"
              className="font-medium text-[#6C4CD8] underline underline-offset-2"
            >
              POS register
            </Link>{" "}
            stays disabled.
          </p>
        </div>

        <div>
          <div className="relative">
            <QrCode
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B5B0CA]"
            />
            <input
              id="bakong-account-id"
              type="text"
              inputMode="email"
              autoComplete="off"
              spellCheck={false}
              value={current.bakongAccountId}
              maxLength={MAX_ACCOUNT_ID}
              placeholder="anajak_store@aclb"
              aria-invalid={badAccountId}
              onChange={(e) => patch({ bakongAccountId: e.target.value })}
              className={cn(
                "w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-[#1A1330] placeholder:text-[#B5B0CA] focus:outline-none focus:ring-2",
                badAccountId
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                  : "border-[#E2DFEC] focus:border-[#6C4CD8] focus:ring-[#6C4CD8]/15",
              )}
            />
          </div>
          {badAccountId ? (
            <p className="mt-1.5 text-xs text-rose-700">
              That does not look like a Bakong account. Expected name@bank.
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-[#8D86A8]">
              Clear the field and save to stop taking KHQR.
            </p>
          )}
        </div>
      </section>

      {/* ── display name ── */}
      <section className="flex flex-col gap-5 rounded-2xl border border-[#EDEBF3] bg-white p-6">
        <div>
          <h2 className="text-sm font-bold text-[#1A1330]">Name on the QR</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#8D86A8]">
            What the customer sees in their banking app before they confirm.
            Leave it empty to use your shop name.
          </p>
        </div>

        <div>
          <div className="relative">
            <Store
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B5B0CA]"
            />
            <input
              id="bakong-account-name"
              type="text"
              value={current.bakongAccountName}
              maxLength={MAX_ACCOUNT_NAME}
              placeholder={profile?.businessName ?? "Your shop name"}
              onChange={(e) => patch({ bakongAccountName: e.target.value })}
              className="w-full rounded-xl border border-[#E2DFEC] bg-white py-3 pl-11 pr-4 text-sm text-[#1A1330] placeholder:text-[#B5B0CA] focus:border-[#6C4CD8] focus:outline-none focus:ring-2 focus:ring-[#6C4CD8]/15"
            />
          </div>
          <p className="mt-1.5 text-xs text-[#8D86A8]">
            {current.bakongAccountName.length}/{MAX_ACCOUNT_NAME} characters —
            KHQR will not carry more.
          </p>
        </div>

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
                Save account
              </>
            )}
          </button>
        </div>
      </section>

      <AuthToast toast={toast} onClose={() => setToast(null)} />
    </form>
  );
}
