"use client"

import * as React from "react"
import Image from "next/image"
import { ArrowLeft, Loader2, MessageSquare, Search, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  PENDING_SENDER_ID,
  useGetConversationsQuery,
  useGetConversationMessagesQuery,
  useMarkConversationReadMutation,
  useSendConversationMessageMutation,
} from "@/lib/redux/service/sellerMessageApi"
import { useMessageWebSocket } from "@/lib/hooks/use-message-websocket"
import type { ConversationMessage } from "@/lib/types/seller-message"

const PAGE_SIZE = 30

/** Thread-list stamp: clock time for today, "Yesterday", then a short date. */
function threadStamp(iso?: string): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return date.toLocaleDateString([], { month: "short", day: "2-digit" })
}

function bubbleStamp(iso?: string): string {
  if (!iso) return ""
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

/** A day divider so a long thread does not read as one undated run. */
function dayLabel(iso?: string): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return "Today"
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return date.toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  })
}

/** The API pages messages newest-first; a chat log has to read oldest-first. */
function inChatOrder(messages: ConversationMessage[]): ConversationMessage[] {
  return [...messages].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
  )
}

/** Unlike the buyer view, the other party here is a person — show them as one. */
function CustomerAvatar({
  name,
  avatar,
  size,
}: {
  name?: string
  avatar?: string
  size: number
}) {
  const initial = (name?.trim() || "C").charAt(0).toUpperCase()
  return (
    <div
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary"
      style={{ height: size, width: size, fontSize: Math.round(size * 0.38) }}
    >
      {avatar ? (
        <Image
          src={avatar}
          alt={name || "Customer"}
          fill
          unoptimized
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        initial
      )}
    </div>
  )
}

export function MessageCenter() {
  const connectionState = useMessageWebSocket()
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    isError,
    refetch,
  } = useGetConversationsQuery()
  const [sendMessage, { isLoading: isSending }] = useSendConversationMessageMutation()
  const [markRead] = useMarkConversationReadMutation()

  const [selectedId, setSelectedId] = React.useState("")
  const [query, setQuery] = React.useState("")
  const [draft, setDraft] = React.useState("")
  const [mobilePane, setMobilePane] = React.useState<"list" | "thread">("list")
  /* Kept per conversation so switching threads resets the window without an
     effect that would fight the render. */
  const [sizes, setSizes] = React.useState<Record<string, number>>({})

  const activeId = selectedId || conversations[0]?.uuid || ""
  const active = conversations.find((item) => item.uuid === activeId)

  const pageSize = sizes[activeId] ?? PAGE_SIZE
  const {
    data: messagePage,
    isLoading: messagesLoading,
    isFetching: messagesFetching,
  } = useGetConversationMessagesQuery(
    { conversationUuid: activeId, pageSize },
    { skip: !activeId },
  )
  const messages = React.useMemo(
    () => inChatOrder(messagePage?.content ?? []),
    [messagePage],
  )
  const totalMessages = messagePage?.page?.totalElements ?? 0
  const hasMore = messages.length < totalMessages

  /* Opening a thread clears its unread badge. */
  React.useEffect(() => {
    if (!activeId) return
    const conversation = conversations.find((item) => item.uuid === activeId)
    if (conversation && conversation.unreadCount > 0) markRead(activeId)
  }, [activeId, conversations, markRead])

  /* Follow new messages, but never yank the view while history is being read. */
  const logRef = React.useRef<HTMLDivElement>(null)
  const stickToBottom = React.useRef(true)
  React.useEffect(() => {
    const node = logRef.current
    if (node && stickToBottom.current) node.scrollTop = node.scrollHeight
  }, [messages, activeId])

  function handleLogScroll() {
    const node = logRef.current
    if (!node) return
    stickToBottom.current =
      node.scrollHeight - node.scrollTop - node.clientHeight < 80
  }

  function openConversation(uuid: string) {
    stickToBottom.current = true
    setSelectedId(uuid)
    setMobilePane("thread")
  }

  async function submitMessage(event?: React.FormEvent) {
    event?.preventDefault()
    const body = draft.trim()
    if (!body || !activeId || isSending) return
    setDraft("")
    stickToBottom.current = true
    try {
      await sendMessage({ conversationUuid: activeId, body }).unwrap()
    } catch {
      setDraft(body) // keep what they typed so the send can be retried
    }
  }

  const needle = query.trim().toLowerCase()
  const visibleConversations = needle
    ? conversations.filter((item) =>
        (item.otherUserName ?? "").toLowerCase().includes(needle),
      )
    : conversations

  const customerName = active?.otherUserName || "Customer"
  const showThread = mobilePane === "thread"

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="flex h-[calc(100dvh-8.5rem)] min-h-[460px] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* ── LEFT: customer threads ── */}
        <aside
          className={cn(
            "h-full w-full shrink-0 flex-col overflow-hidden border-border md:flex md:w-[320px] md:border-r",
            showThread ? "hidden" : "flex",
          )}
        >
          <div className="shrink-0 space-y-3 border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-[18px] text-primary" />
                <h2 className="text-base font-bold text-foreground">Messages</h2>
              </div>
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
                {conversations.length}
              </span>
            </div>
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customers…"
                className="h-10 w-full rounded-xl bg-muted pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/25"
              />
            </label>
          </div>

          <div className="flex-1 divide-y divide-border overflow-y-auto">
            {conversationsLoading ? (
              <div className="flex justify-center py-14">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="px-4 py-14 text-center text-xs text-muted-foreground">
                <p>Could not load conversations.</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-3 font-bold text-primary"
                >
                  Try again
                </button>
              </div>
            ) : visibleConversations.length === 0 ? (
              <p className="px-6 py-14 text-center text-xs leading-relaxed text-muted-foreground">
                {conversations.length === 0
                  ? "No messages yet. When a buyer contacts your shop, the conversation appears here."
                  : "No customers match your search."}
              </p>
            ) : (
              visibleConversations.map((conversation) => {
                const isActive = conversation.uuid === activeId
                return (
                  <button
                    key={conversation.uuid}
                    type="button"
                    onClick={() => openConversation(conversation.uuid)}
                    className={cn(
                      "flex w-full items-center gap-3 p-4 text-left transition-colors",
                      isActive ? "bg-primary/10" : "hover:bg-muted",
                    )}
                  >
                    <CustomerAvatar
                      name={conversation.otherUserName}
                      avatar={conversation.otherUserAvatar}
                      size={40}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <strong
                          className={cn(
                            "truncate text-sm",
                            isActive ? "text-primary" : "text-foreground",
                          )}
                        >
                          {conversation.otherUserName || "Customer"}
                        </strong>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {threadStamp(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "mt-0.5 truncate text-xs",
                          conversation.unreadCount > 0
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* ── RIGHT: active conversation ── */}
        <div
          className={cn(
            "h-full w-full min-w-0 flex-1 flex-col overflow-hidden bg-muted/30 md:flex",
            showThread ? "flex" : "hidden",
          )}
        >
          <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-3.5 sm:px-6">
            <button
              type="button"
              onClick={() => setMobilePane("list")}
              aria-label="Back to conversations"
              className="-ml-1 shrink-0 rounded-lg p-1.5 text-primary hover:bg-muted md:hidden"
            >
              <ArrowLeft className="size-5" />
            </button>

            {active && (
              <>
                <CustomerAvatar
                  name={active.otherUserName}
                  avatar={active.otherUserAvatar}
                  size={40}
                />
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-foreground">
                    {customerName}
                  </h3>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        connectionState === "connected"
                          ? "bg-emerald-500"
                          : "bg-amber-500",
                      )}
                    />
                    {connectionState === "connected"
                      ? "Live"
                      : connectionState === "connecting"
                        ? "Connecting…"
                        : "Reconnecting…"}
                  </p>
                </div>
              </>
            )}
          </header>

          <div
            ref={logRef}
            onScroll={handleLogScroll}
            className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6"
          >
            {!activeId ? (
              <p className="pt-24 text-center text-sm text-muted-foreground">
                Select a conversation to read it.
              </p>
            ) : messagesLoading ? (
              <div className="flex justify-center pt-24">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <p className="pt-24 text-center text-sm text-muted-foreground">
                No messages yet — say hello to {customerName}.
              </p>
            ) : (
              <>
                {hasMore && (
                  <div className="flex justify-center pb-1">
                    <button
                      type="button"
                      disabled={messagesFetching}
                      onClick={() => {
                        stickToBottom.current = false
                        setSizes((prev) => ({
                          ...prev,
                          [activeId]: pageSize + PAGE_SIZE,
                        }))
                      }}
                      className="rounded-full bg-card px-4 py-1.5 text-xs font-bold text-primary shadow-sm ring-1 ring-border transition hover:bg-muted disabled:opacity-60"
                    >
                      {messagesFetching
                        ? "Loading…"
                        : `Load earlier messages (${totalMessages - messages.length})`}
                    </button>
                  </div>
                )}

                {messages.map((message, index) => {
                  const fromCustomer = message.senderId === active?.otherUserId
                  const isPending = message.senderId === PENDING_SENDER_ID
                  const showDay =
                    index === 0 ||
                    dayLabel(messages[index - 1].sentAt) !== dayLabel(message.sentAt)

                  return (
                    <React.Fragment key={message.uuid}>
                      {showDay && (
                        <div className="flex justify-center py-2">
                          <span className="rounded-full bg-card px-3 py-1 text-[11px] font-semibold text-muted-foreground ring-1 ring-border">
                            {dayLabel(message.sentAt)}
                          </span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "flex max-w-[85%] flex-col sm:max-w-[70%]",
                          fromCustomer ? "mr-auto items-start" : "ml-auto items-end",
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                            fromCustomer
                              ? "rounded-tl-none border border-border bg-card text-foreground"
                              : "rounded-tr-none bg-primary text-primary-foreground",
                            isPending && "opacity-70",
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.body}
                          </p>
                        </div>
                        <span className="mt-1 px-1 text-[11px] text-muted-foreground">
                          {isPending ? "Sending…" : bubbleStamp(message.sentAt)}
                        </span>
                      </div>
                    </React.Fragment>
                  )
                })}
              </>
            )}
          </div>

          <form
            onSubmit={submitMessage}
            className="flex shrink-0 items-end gap-2.5 border-t border-border bg-card p-3 sm:p-4"
          >
            <textarea
              rows={1}
              value={draft}
              disabled={!activeId}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                // Enter sends; Shift+Enter starts a new line.
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  submitMessage()
                }
              }}
              placeholder={
                activeId
                  ? `Reply to ${customerName}…`
                  : "Select a conversation to reply"
              }
              className="max-h-32 min-h-[44px] min-w-0 flex-1 resize-none rounded-xl bg-muted px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/25 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!draft.trim() || !activeId || isSending}
              aria-label="Send message"
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
