"use client";

import { useCallback, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Timer,
  X,
} from "lucide-react";
import { Payment, SubscriptionCheckout } from "@/lib/api/sellerApi";
import { formatCountdown, useKhqrPayment } from "@/lib/hooks/use-khqr-payment";

/**
 * Renders the Bakong KHQR for one subscription checkout and polls until the
 * transfer is confirmed. Mount it with `key={payment.uuid}` so a fresh QR
 * starts a fresh countdown and a fresh poll.
 */
export function KhqrPaymentDialog({
  checkout,
  onPaid,
  onRetry,
  onClose,
}: {
  checkout: SubscriptionCheckout;
  /** Fired once, when Bakong confirms the money arrived. */
  onPaid: (payment: Payment) => void;
  /** Start a new checkout for the same plan — the old QR has lapsed. */
  onRetry: () => void;
  onClose: () => void;
}) {
  const payment = checkout.payment;
  const { phase, remaining, unreachable } = useKhqrPayment(payment, onPaid);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [close]);

  if (!payment) return null;

  const amount = `${payment.currency === "USD" ? "$" : ""}${payment.amount.toFixed(2)}${
    payment.currency === "USD" ? "" : ` ${payment.currency}`
  }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1330]/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Pay with KHQR"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={close}
          aria-label="Close payment window"
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
        >
          <X size={16} />
        </button>

        {/* KHQR band — the red header sellers recognise from banking apps. */}
        <div className="bg-[#E01E26] px-6 py-4 text-white">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">
            Bakong
          </span>
          <div className="mt-0.5 flex items-baseline justify-between gap-3">
            <span className="text-xl font-extrabold tracking-tight">KHQR</span>
            <span className="text-lg font-bold">{amount}</span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-[#8D86A8]">
            {checkout.planDisplayName || checkout.planCode}
          </p>
          <p className="mt-0.5 text-center text-xs text-[#6B6580]">
            {checkout.durationDays} days of seller access
          </p>

          {phase === "paid" ? (
            <div className="mt-6 flex flex-col items-center gap-3 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="text-base font-bold text-[#1A1330]">
                Payment received
              </h3>
              <p className="text-xs leading-relaxed text-[#6B6580]">
                Your{" "}
                <strong>{checkout.planDisplayName || checkout.planCode}</strong>{" "}
                subscription is now active. You can publish listings and message
                customers straight away.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-2 w-full rounded-xl bg-[#6C4CD8] py-3 text-xs font-bold text-white shadow-md shadow-[#6C4CD8]/25 transition hover:bg-[#5C3DC8]"
              >
                Done
              </button>
            </div>
          ) : phase === "expired" ? (
            <div className="mt-6 flex flex-col items-center gap-3 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Timer className="size-7" />
              </div>
              <h3 className="text-base font-bold text-[#1A1330]">
                This QR has expired
              </h3>
              <p className="text-xs leading-relaxed text-[#6B6580]">
                Nothing was charged. Generate a new QR to try again — the price
                is unchanged.
              </p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6C4CD8] py-3 text-xs font-bold text-white shadow-md shadow-[#6C4CD8]/25 transition hover:bg-[#5C3DC8]"
              >
                <RefreshCw className="size-4" /> Generate a new QR
              </button>
              <button
                type="button"
                onClick={close}
                className="text-xs font-semibold text-[#8D86A8] transition hover:text-[#1A1330]"
              >
                Cancel
              </button>
            </div>
          ) : phase === "stopped" ? (
            <div className="mt-6 flex flex-col items-center gap-3 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertCircle className="size-7" />
              </div>
              <h3 className="text-base font-bold text-[#1A1330]">
                We stopped checking this payment
              </h3>
              <p className="text-xs leading-relaxed text-[#6B6580]">
                Your session may have ended. Sign in again and open the pricing
                page — if the transfer went through, your plan will already be
                active.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-2 w-full rounded-xl border border-[#6C4CD8] py-3 text-xs font-bold text-[#6C4CD8] transition hover:bg-[#EDE9FB]"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="mt-5 flex justify-center">
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <QRCodeSVG
                    value={payment.qr}
                    size={196}
                    level="M"
                    marginSize={0}
                    aria-label="KHQR payment code"
                  />
                </div>
              </div>

              {remaining !== null && (
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1A1330]">
                  <Timer className="size-3.5 text-[#8D86A8]" />
                  Expires in {formatCountdown(remaining)}
                </p>
              )}

              <p className="mt-3 text-center text-[11px] leading-relaxed text-[#6B6580]">
                Scan with the Bakong app, or any Cambodian banking app that
                supports KHQR — ACLEDA, ABA, Wing and others.
              </p>

              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#F8F7FB] py-2.5 text-xs font-medium text-[#6B6580]">
                <Loader2 className="size-3.5 animate-spin text-[#6C4CD8]" />
                {unreachable
                  ? "Checking with the payment network…"
                  : "Waiting for your payment…"}
              </div>

              <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-[10px] leading-relaxed text-[#8D86A8]">
                <ShieldCheck className="mt-px size-3 shrink-0" />
                Keep this window open until the payment is confirmed. Your plan
                starts the moment the transfer lands.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
