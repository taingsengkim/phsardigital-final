import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";

export const PAYMENT_REQUIRED_EVENT = "psardigital:payment-required";

/**
 * Endpoints that render their own 402 message beside the work in progress.
 * Redirecting away from a half-filled product form would throw the draft
 * away, so those screens opt out and keep the seller where they are.
 */
const HANDLED_INLINE = new Set(["createSellerListing", "updateSellerListing"]);

/**
 * 402 PAYMENT_REQUIRED is how the API says the seller has no active
 * subscription, and it can come back from any write — publishing a listing,
 * messaging a customer. Catch it once here and let <PaymentRequiredRedirect />
 * route to the pricing page, rather than leaving a raw error on screen.
 */
export const paymentRequiredMiddleware: Middleware =
  () => (next) => (action) => {
    if (typeof window !== "undefined" && isRejectedWithValue(action)) {
      const status = (action.payload as { status?: number | string } | undefined)
        ?.status;
      const endpointName = (
        action.meta as { arg?: { endpointName?: string } } | undefined
      )?.arg?.endpointName;

      if (status === 402 && !HANDLED_INLINE.has(endpointName ?? "")) {
        window.dispatchEvent(new CustomEvent(PAYMENT_REQUIRED_EVENT));
      }
    }
    return next(action);
  };
