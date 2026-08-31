/** Mirrors the purchase-controller schemas in the API spec. */

export type PurchaseStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

export type PurchaseChannel = "ONLINE" | "POS"

export interface PurchaseItem {
  listingUuid?: string
  title?: string
  slug?: string | null
  thumbnailUrl?: string | null
  quantity: number
  fullPrice?: number | null
  unitPrice: number
  lineTotal: number
}

export interface DeliveryPhoto {
  url?: string
  caption?: string
}

export interface Purchase {
  uuid: string
  buyerId?: string | null
  buyerName?: string | null
  buyerPhone?: string | null
  sellerId?: string
  businessName?: string
  storeLogoUrl?: string | null
  totalPrice: number
  status: PurchaseStatus
  channel?: PurchaseChannel
  shippingAddress?: string | null
  deliveryLatitude?: number | null
  deliveryLongitude?: number | null
  deliveryPhotos?: DeliveryPhoto[] | null
  note?: string | null
  items?: PurchaseItem[] | null
  createdAt: string
  confirmedAt?: string | null
  completedAt?: string | null
  cancelledAt?: string | null
}

export interface SellerOrdersSummary {
  pending: number
  confirmed: number
  completed: number
  cancelled: number
  total: number
  earnedRevenue: number
  inFlightRevenue: number
}

export interface SellerOrdersQuery {
  status?: PurchaseStatus | ""
  search?: string
  pageNumber?: number
  pageSize?: number
}

/**
 * POST /purchases/checkout/{sellerId}. Only `cartUuid` is required; the address
 * can be an id from the address book or the loose fields below it, which is why
 * the checkout screen can offer both a saved address and a one-off one.
 */
export interface CheckoutRequest {
  cartUuid: string
  addressId?: string
  shippingAddress?: string
  recipientName?: string
  recipientPhone?: string
  note?: string
}

export interface CheckoutArgs extends CheckoutRequest {
  sellerId: string
}

export interface PurchasePage {
  content: Purchase[]
  page?: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

export interface PurchaseQuery {
  status?: PurchaseStatus
  pageNumber?: number
  pageSize?: number
}
