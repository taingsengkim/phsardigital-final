export type ListingStatus =
  | "ACTIVE"
  | "SOLD_OUT"
  | "ARCHIVED"
  | "DRAFT"
  | "SUSPENDED"
  | "REMOVED"

export interface MessageListing {
  uuid: string
  title: string
  slug: string
  thumbnailUrl?: string | null
  price: number
  fullPrice?: number | null
  status: ListingStatus
}

export interface SellerConversation {
  uuid: string
  otherUserId: string
  otherUserName: string
  otherUserAvatar?: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
  lastListing?: MessageListing | null
}

export interface ConversationMessage {
  uuid: string
  conversationUuid: string
  senderId: string
  senderName?: string
  body: string
  isRead: boolean
  sentAt: string
  listing?: MessageListing | null
}

export interface MessagePage {
  content: ConversationMessage[]
  page?: { size: number; number: number; totalElements: number; totalPages: number }
}

export interface MessagePageRequest { conversationUuid: string; pageNumber?: number; pageSize?: number }
export interface SendMessageRequest { conversationUuid: string; body: string; listingUuid?: string }
export interface StartConversationRequest { participantId: string }
