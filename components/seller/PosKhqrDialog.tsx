"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { AlertCircle, Loader2, RotateCcw, Store, Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCountdown, useKhqrPayment } from "@/lib/hooks/use-khqr-payment";
import type { KhqrPayment } from "@/lib/types/payment";

/**
 * The counter-facing half of a KHQR sale: a QR the customer scans while the
 * till polls Bakong. There is deliberately no "mark as paid" button — the
 * whole point is that the transfer is verified, not attested by the cashier.
 *
 * Mount with `key={payment.uuid}` so a retry gets a fresh countdown and poll.
 */
export function PosKhqrDialog({
  payment,
  shopName,
  onPaid,
  onRetry,
  onCancel,
}: {
  payment: KhqrPayment;
  shopName: string;
  /** Bakong confirmed the transfer; the sale is COMPLETED server-side. */
  onPaid: (payment: KhqrPayment) => void;
  /** Ring the same basket up again as a brand-new sale. */
  onRetry: () => void;
  /** Leave the QR without settling — the sale stays pending until it lapses. */
  onCancel: () => void;
}) {
  const { phase, remaining, unreachable } = useKhqrPayment(payment, onPaid);

  const amount = `${payment.currency === "USD" ? "$" : ""}${payment.amount.toFixed(2)}${
    payment.currency === "USD" ? "" : ` ${payment.currency}`
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        {/* KHQR band — what the customer looks for before scanning. */}
        <div className="relative bg-[#E01E26] px-5 py-4 text-white">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
            Bakong
          </span>
          <div className="mt-0.5 flex items-baseline justify-between gap-3">
            <span className="text-lg font-bold tracking-tight">KHQR</span>
            <span className="text-xl font-bold tabular-nums">{amount}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/85">
            <Store className="size-3" />
            <span className="truncate">{shopName}</span>
          </div>
        </div>

        {phase === "expired" ? (
          <div className="space-y-4 p-6 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-amber-50 text-amber-700">
              <Timer className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">
                Payment not received
              </h3>
              <p className="text-xs leading-relaxed text-slate-500">
                The QR expired and the sale was cancelled. The items are back in
                stock — nothing was charged.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="h-9 text-xs"
              >
                Back to register
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onRetry}
                className="h-9 bg-slate-900 text-xs text-white hover:bg-slate-800"
              >
                <RotateCcw className="mr-1 size-3.5" /> Try again
              </Button>
            </div>
          </div>
        ) : phase === "stopped" ? (
          <div className="space-y-4 p-6 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-rose-50 text-rose-700">
              <AlertCircle className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">
                Stopped checking this payment
              </h3>
              <p className="text-xs leading-relaxed text-slate-500">
                Your till session may have ended. Sign in again and check the
                orders list — if the customer paid, the sale is already
                completed there.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="h-9 w-full text-xs"
            >
              Back to register
            </Button>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            <div className="flex justify-center">
              <div className="rounded-lg border border-slate-200 p-3">
                <QRCodeSVG
                  value={payment.qr}
                  size={216}
                  level="M"
                  marginSize={0}
                  aria-label="KHQR payment code"
                />
              </div>
            </div>

            <div className="space-y-1 text-center">
              <p className="text-xs text-slate-500">
                Customer scans with Bakong, ACLEDA, ABA, Wing or any KHQR app.
              </p>
              {remaining !== null && (
                <p
                  className={cn(
                    "flex items-center justify-center gap-1.5 text-xs font-medium tabular-nums",
                    remaining <= 30 ? "text-rose-600" : "text-slate-700",
                  )}
                >
                  <Timer className="size-3.5" />
                  Expires in {formatCountdown(remaining)}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-xs font-medium text-slate-600">
              <Loader2 className="size-3.5 animate-spin text-slate-900" />
              {unreachable ? "Checking…" : "Waiting for payment"}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="h-9 w-full text-xs"
            >
              <X className="mr-1 size-3.5" /> Cancel
            </Button>
            <p className="text-center text-[11px] leading-relaxed text-slate-400">
              Cancelling only closes this window. The sale stays pending until
              the QR expires, and the stock returns then.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
