export interface SellerConversation {
  uuid: string
  otherUserId: string
  otherUserName: string
  otherUserAvatar?: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
}

export interface ConversationMessage {
  uuid: string
  conversationUuid: string
  senderId: string
  senderName?: string
  body: string
  isRead: boolean
  sentAt: string
}

export interface MessagePage {
  content: ConversationMessage[]
  page?: { size: number; number: number; totalElements: number; totalPages: number }
}

export interface MessagePageRequest { conversationUuid: string; pageNumber?: number; pageSize?: number }
export interface SendMessageRequest { conversationUuid: string; body: string }
export interface StartConversationRequest { participantId: string }
