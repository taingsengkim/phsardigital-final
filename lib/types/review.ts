export interface ReviewPhoto {
  objectName?: string
  uri?: string
}

export interface ReviewReply {
  uuid: string
  comment: string
  createdAt: string
  updatedAt?: string
  parentReplyUuid?: string | null
  childReplies?: ReviewReply[]
}

export interface ReviewResponse {
  uuid: string
  rating: number
  comment?: string | null
  photo?: ReviewPhoto | null
  isEdited: boolean
  isVerifiedPurchase: boolean
  createdAt: string
  updatedAt?: string
  buyer?: {
    id: string
    displayName?: string | null
    avatarUrl?: string | null
  } | null
  listing?: {
    uuid: string
    title: string
    slug: string
    thumbnailUrl?: string | null
  } | null
  seller?: {
    id: string
    businessName?: string | null
    logoUri?: string | null
  } | null
  replies?: ReviewReply[]
}

export interface ReviewBreakdownItem {
  stars: number
  count: number
  percentage: number
}

export interface ReviewSummaryResponse {
  averageRating: number | null
  reviewCount: number
  breakdown: ReviewBreakdownItem[]
}

export interface CreateReviewRequest {
  listingUuid: string
  rating: number
  comment?: string
  photoObjectName?: string
}

export interface UpdateReviewRequest {
  reviewUuid: string
  rating?: number
  comment?: string
  photoObjectName?: string
}

export interface ReviewReplyRequest {
  reviewUuid: string
  comment: string
  parentReplyUuid?: string | null
}

export interface ReviewPageParams {
  page?: number
  size?: number
  sort?: string
}

export interface PagedReviewResponse {
  content: ReviewResponse[]
  page?: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}
