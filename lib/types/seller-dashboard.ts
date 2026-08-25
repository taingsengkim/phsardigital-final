export interface PageMetadata {
  size: number
  number: number
  totalElements: number
  totalPages: number
}

export interface PagedResponse<T> {
  content: T[]
  page: PageMetadata
}

export interface PurchaseItem {
  listingUuid: string
  title: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface SellerOrder {
  uuid: string
  buyerId: string
  buyerName?: string
  buyerPhone?: string
  sellerId: string
  businessName: string
  totalPrice: number
  status: string
  shippingAddress?: string
  note?: string
  items: PurchaseItem[]
  createdAt: string
}

export interface SellerProfile {
  id: string
  businessName: string
  businessType?: string
  description?: string
  logoObjectName?: string
  logoUri?: string
  address?: string
  city?: string
  province?: string
  latitude?: number
  longitude?: number
  googleMapUrl?: string
  isActive: boolean
}

export interface ListingThumbnail {
  uuid?: string
  objectName?: string
  uri?: string
}

export interface DashboardListing {
  uuid: string
  title: string
  slug: string
  description?: string
  price: number
  stockQty: number
  status: string
  isFeatured: boolean
  thumbnailUri?: ListingThumbnail
  sold: number
  createdAt: string
  lastModifiedAt?: string
}

/** Mirrors ReviewAuthorResponse — the API sends only these three fields. */
export interface ReviewBuyer {
  id: string
  displayName?: string
  avatarUrl?: string
}

export interface SellerReview {
  uuid: string
  listing: DashboardListing
  buyer: ReviewBuyer
  rating: number
  comment: string
  isEdited: boolean
  createdAt: string
  updatedAt?: string
}

export interface SellerConversation {
  uuid: string
  otherUserId: string
  otherUserName: string
  otherUserAvatar?: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
}

export interface DashboardPageParams {
  pageNumber?: number
  pageSize?: number
}
