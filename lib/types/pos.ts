import type { Purchase } from "./purchase"
import type { KhqrPayment } from "./payment"

export interface PosSaleLineRequest {
  listingUuid: string
  quantity: number
  unitPrice?: number
}

export interface PosSaleRequest {
  saleUuid: string
  lines: PosSaleLineRequest[]
  customerName?: string
  customerPhone?: string
  paymentMethod?: "CASH" | "KHQR"
  amountTendered?: number
  note?: string
  soldAt?: string
}

export interface PosSaleResponse {
  /**
   * A CASH sale comes back COMPLETED. A KHQR sale comes back PENDING with a
   * `payment` to poll — stock is already taken, so the sale is not free, but
   * it is not settled either.
   */
  sale: Purchase
  paymentMethod?: "CASH" | "KHQR"
  amountTendered?: number | null
  changeDue?: number | null
  /** null on a CASH sale. Poll `payment.uuid`, never `saleUuid`. */
  payment?: KhqrPayment | null
}
