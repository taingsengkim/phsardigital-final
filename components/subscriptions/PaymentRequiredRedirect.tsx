"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PAYMENT_REQUIRED_EVENT } from "@/lib/api/payment-required-middleware";

/**
 * Listens for the 402 that `paymentRequiredMiddleware` picks up anywhere in
 * the app and sends the seller to the pricing page with a reason, instead of
 * whatever raw error the calling screen would otherwise have shown.
 */
export function PaymentRequiredRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onPaymentRequired = () => {
      if (pathname === "/subscriptions") return;
      toast.error(
        "An active seller subscription is required for that. Choose a plan to continue.",
        { id: "subscription-required" },
      );
      router.push("/subscriptions?reason=subscription-required");
    };

    window.addEventListener(PAYMENT_REQUIRED_EVENT, onPaymentRequired);
    return () =>
      window.removeEventListener(PAYMENT_REQUIRED_EVENT, onPaymentRequired);
  }, [pathname, router]);

  return null;
}
