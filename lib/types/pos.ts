import type { Purchase } from "./purchase"

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
  sale: Purchase
  paymentMethod?: "CASH" | "KHQR"
  amountTendered?: number | null
  changeDue?: number | null
}
