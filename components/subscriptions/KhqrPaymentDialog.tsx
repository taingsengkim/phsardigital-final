"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  Payment,
  SubscriptionCheckout,
  useVerifyPaymentMutation,
} from "@/lib/api/sellerApi";

const POLL_INTERVAL_MS = 3000;

/**
 * `expiresAt` arrives with no timezone offset ("2026-09-01T14:35:00"), so
 * `new Date(...)` would read it in whatever zone the seller's device is set
 * to and a phone on the wrong clock would show a countdown hours out. The API
 * is Cambodian, so read it as Indochina time (UTC+7).
 *
 * This only drives the countdown text. Whether the QR still works is decided
 * by the server's `payable` / `status`, never by this number.
 */
function secondsUntilExpiry(expiresAt: string | undefined): number | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(
    expiresAt ?? "",
  );
  if (!parts) return null;
  const ms = Date.UTC(
    Number(parts[1]),
    Number(parts[2]) - 1,
    Number(parts[3]),
    Number(parts[4]) - 7,
    Number(parts[5]),
    Number(parts[6] ?? 0),
  );
  const seconds = Math.round((ms - Date.now()) / 1000);
  // A value outside a sane window means the clock assumption was wrong; show
  // no countdown rather than a misleading one.
  return seconds > 0 && seconds < 24 * 60 * 60 ? seconds : null;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Phase = "waiting" | "paid" | "expired" | "stopped";

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
  const uuid = payment?.uuid;

  const [verifyPayment] = useVerifyPaymentMutation();
  const [phase, setPhase] = useState<Phase>("waiting");
  const [unreachable, setUnreachable] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(() =>
    secondsUntilExpiry(payment?.expiresAt),
  );

  // Kept in a ref so a parent passing an inline callback cannot restart the
  // poll — restarting it would issue a second verify every render.
  const onPaidRef = useRef(onPaid);
  useEffect(() => {
    onPaidRef.current = onPaid;
  }, [onPaid]);

  useEffect(() => {
    if (!uuid || phase !== "waiting") return;

    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    async function tick() {
      if (stopped) return;
      try {
        const result = await verifyPayment(uuid!).unwrap();
        setUnreachable(false);
        if (result.status === "PAID") {
          stopped = true;
          setPhase("paid");
          onPaidRef.current(result);
          return;
        }
        // Still PENDING but no longer payable: the QR lapsed.
        if (!result.payable) {
          stopped = true;
          setPhase("expired");
          return;
        }
      } catch (err) {
        const status = (err as { status?: number | string })?.status;
        // Only a gone session (401) or a payment that is not this seller's
        // (404) is a reason to stop asking. 502/503/504 and dropped requests
        // mean Bakong was unreachable — the money may already have moved, so
        // keep the QR up and keep polling.
        if (status === 401 || status === 404) {
          stopped = true;
          setPhase("stopped");
          return;
        }
        setUnreachable(true);
      }
      timer = setTimeout(tick, POLL_INTERVAL_MS);
    }

    timer = setTimeout(tick, POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [uuid, phase, verifyPayment]);

  // The countdown runs off a local timer started when the response arrived,
  // not off repeated parsing of the offset-less server timestamp.
  useEffect(() => {
    if (phase !== "waiting" || remaining === null) return;
    const id = setInterval(() => {
      setRemaining((left) => (left === null ? null : Math.max(0, left - 1)));
    }, 1000);
    return () => clearInterval(id);
    // `remaining` is deliberately not a dependency: the interval decrements it
    // functionally and must not be torn down every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

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
