export interface CommentBuyer {
  id?: string
  username?: string
  firstName?: string
  lastName?: string
  fullName?: string
  avatarFile?: { uri?: string }
}

export interface CommentListing {
  uuid?: string
  title?: string
}

export interface SellerComment {
  uuid: string
  listing?: CommentListing
  buyer?: CommentBuyer
  rating: number
  comment?: string
  createdAt?: string
  updatedAt?: string
}

export interface CommentPage {
  content: SellerComment[]
  page?: { size: number; number: number; totalElements: number; totalPages: number }
}

export interface CommentPageParams { page?: number; size?: number }
export interface ReplyToCommentRequest { reviewUuid: string; comment: string; parentReplyUuid?: string }
export interface CommentReply { uuid?: string; comment: string; createdAt?: string }

export interface CreateProductReviewRequest {
  listingUuid: string
  rating: number
  comment?: string
}
