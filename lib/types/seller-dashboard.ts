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

export interface ReviewBuyer {
  id: string
  username?: string
  firstName?: string
  lastName?: string
  fullName?: string
  email?: string
  avatarFile?: { uri?: string }
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
