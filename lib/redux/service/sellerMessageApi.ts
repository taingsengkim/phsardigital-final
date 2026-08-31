import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { ConversationMessage, MessagePage, MessagePageRequest, SendMessageRequest, SellerConversation, StartConversationRequest } from "@/lib/types/seller-message"

/** Marks a message that is still in flight — never a real user id. */
export const PENDING_SENDER_ID = "__pending__"

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
      query: ({ conversationUuid, body, listingUuid }) => ({
        url: `/${encodeURIComponent(conversationUuid)}/messages`,
        method: "POST",
        body: { body, ...(listingUuid ? { listingUuid } : {}) },
      }),
      // Show the message straight away instead of waiting for the round-trip.
      // The sentinel senderId never matches the other participant, so both the
      // buyer and seller views render it as their own; the refetch that follows
      // replaces it with the stored message.
      async onQueryStarted({ conversationUuid, body }, { dispatch, queryFulfilled, getState }) {
        const pending: ConversationMessage = {
          uuid: `pending-${Date.now()}`,
          conversationUuid,
          senderId: PENDING_SENDER_ID,
          body,
          isRead: false,
          sentAt: new Date().toISOString(),
        }
        const patches = sellerMessageApi.util.selectInvalidatedBy(getState(), [{ type: "Messages", id: conversationUuid }])
          .filter((entry) => entry.endpointName === "getConversationMessages")
          .map((entry) => dispatch(sellerMessageApi.util.updateQueryData("getConversationMessages", entry.originalArgs as MessagePageRequest, (draft) => {
            if (!Array.isArray(draft.content)) draft.content = []
            draft.content.push(pending)
          })))
        try { await queryFulfilled } catch { patches.forEach((patch) => patch.undo()) }
      },
      invalidatesTags: (_result, _error, arg) => [{ type: "Messages", id: arg.conversationUuid }, "Conversations"],
    }),
    markConversationRead: builder.mutation<void, string>({
      query: (uuid) => ({ url: `/${encodeURIComponent(uuid)}/read`, method: "PATCH" }),
      invalidatesTags: ["Conversations"],
    }),
  }),
})

export const { useGetConversationsQuery, useStartConversationMutation, useGetConversationMessagesQuery, useSendConversationMessageMutation, useMarkConversationReadMutation } = sellerMessageApi
