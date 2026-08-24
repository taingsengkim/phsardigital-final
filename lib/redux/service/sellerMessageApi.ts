import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { ConversationMessage, MessagePage, MessagePageRequest, SendMessageRequest, SellerConversation, StartConversationRequest } from "@/lib/types/seller-message"

export const sellerMessageApi = createApi({
  reducerPath: "sellerMessageApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/conversations" }),
  tagTypes: ["Conversations", "Messages"],
  endpoints: (builder) => ({
    getConversations: builder.query<SellerConversation[], void>({ query: () => "", providesTags: ["Conversations"] }),
    startConversation: builder.mutation<SellerConversation, StartConversationRequest>({ query: (body) => ({ url: "", method: "POST", body }), invalidatesTags: ["Conversations"] }),
    getConversationMessages: builder.query<MessagePage, MessagePageRequest>({
      query: ({ conversationUuid, pageNumber = 0, pageSize = 30 }) => ({ url: `/${encodeURIComponent(conversationUuid)}/messages`, params: { pageNumber, pageSize } }),
      providesTags: (_result, _error, arg) => [{ type: "Messages", id: arg.conversationUuid }],
    }),
    sendConversationMessage: builder.mutation<ConversationMessage, SendMessageRequest>({
      query: ({ conversationUuid, body }) => ({ url: `/${encodeURIComponent(conversationUuid)}/messages`, method: "POST", body: { body } }),
      invalidatesTags: (_result, _error, arg) => [{ type: "Messages", id: arg.conversationUuid }, "Conversations"],
    }),
    markConversationRead: builder.mutation<void, string>({
      query: (uuid) => ({ url: `/${encodeURIComponent(uuid)}/read`, method: "PATCH" }),
      invalidatesTags: ["Conversations"],
    }),
  }),
})

export const { useGetConversationsQuery, useStartConversationMutation, useGetConversationMessagesQuery, useSendConversationMessageMutation, useMarkConversationReadMutation } = sellerMessageApi
