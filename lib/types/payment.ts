/**
 * A Bakong KHQR payment. The same shape backs a seller subscription checkout
 * and a POS counter sale, so both flows poll it the same way.
 */
export type PaymentStatus = "PENDING" | "PAID" | "EXPIRED";

export interface KhqrPayment {
  uuid: string;
  /** Present on subscription payments; the POS response may omit it. */
  purpose?: string;
  reference?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  /** false once the payment settled or the QR lapsed — the server's truth. */
  payable: boolean;
  /** An EMVCo payload string to render as a QR client-side, not an image URL. */
  qr: string;
  md5: string;
  /** ISO local date-time with NO timezone offset, e.g. "2026-09-01T14:35:00". */
  expiresAt: string;
  paidAt: string | null;
}
