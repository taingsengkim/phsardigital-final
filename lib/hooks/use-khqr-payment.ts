"use client";

import { useEffect, useRef, useState } from "react";
import { useVerifyPaymentMutation } from "@/lib/api/sellerApi";
import type { KhqrPayment } from "@/lib/types/payment";

const POLL_INTERVAL_MS = 3000;

export type KhqrPhase =
  /** QR is on screen and the poll is running. */
  | "waiting"
  /** Bakong confirmed the transfer. */
  | "paid"
  /** The QR lapsed before anyone paid. */
  | "expired"
  /** 401 or 404 — there is no point asking again. */
  | "stopped";

/**
 * `expiresAt` arrives with no timezone offset ("2026-09-01T14:35:00"), so
 * `new Date(...)` would read it in whatever zone the device is set to and a
 * till outside Cambodia would show a countdown hours out. The API is
 * Cambodian, so read it as Indochina time (UTC+7) — once, to get the length
 * of the window. The countdown then runs off a local timer.
 *
 * This only drives display. Whether the QR still works is decided by the
 * server's `payable` / `status`, never by this number.
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
  // Outside a sane window the clock assumption was wrong; show no countdown
  // rather than a misleading one.
  return seconds > 0 && seconds < 24 * 60 * 60 ? seconds : null;
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Polls Bakong until a KHQR payment settles, expires, or the caller unmounts.
 *
 * Mount the owning component with `key={payment.uuid}` — a new QR is a new
 * countdown and a new poll, and this hook does not reset itself.
 *
 * The error rules are the whole point of keeping this in one place: a failed
 * check is NOT an unpaid bill. 502/503/504 and dropped requests mean Bakong
 * could not be reached, and the money may already have moved, so the QR stays
 * up and the poll keeps running. Only 401 and 404 stop it.
 */
export function useKhqrPayment(
  payment: KhqrPayment | null | undefined,
  onPaid: (payment: KhqrPayment) => void,
): { phase: KhqrPhase; remaining: number | null; unreachable: boolean } {
  const uuid = payment?.uuid;

  const [verifyPayment] = useVerifyPaymentMutation();
  const [phase, setPhase] = useState<KhqrPhase>("waiting");
  const [unreachable, setUnreachable] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(() =>
    secondsUntilExpiry(payment?.expiresAt),
  );

  // Kept in a ref so a caller passing an inline callback cannot restart the
  // poll — restarting it would fire a second verify on every render.
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
        if (status === 401 || status === 404) {
          stopped = true;
          setPhase("stopped");
          return;
        }
        // Anything else is the payment network being unreachable. Keep going.
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

  return { phase, remaining, unreachable };
}
