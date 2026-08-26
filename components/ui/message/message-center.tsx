"use client"

import * as React from "react"
import Image from "next/image"
import {
  ArrowLeft,
  FileText,
  Images,
  Info,
  Loader2,
  MessageSquare,
  Mic,
  Paperclip,
  MoreHorizontal,
  Reply,
  Search,
  Send,
  ShieldCheck,
  Smile,
  Square,
  UserRound,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { cn, getFileUrl } from "@/lib/utils"
import {
  PENDING_SENDER_ID,
  useGetConversationsQuery,
  useGetConversationMessagesQuery,
  useMarkConversationReadMutation,
  useSendConversationMessageMutation,
} from "@/lib/redux/service/sellerMessageApi"
import { useMessageWebSocket } from "@/lib/hooks/use-message-websocket"
import { useStoreProfiles } from "@/lib/hooks/use-store-profiles"
import type { ConversationMessage } from "@/lib/types/seller-message"

const PAGE_SIZE = 30

/* A conversation message only carries a text body, so an upload travels as a
   tagged JSON envelope that both the seller and the buyer view unwrap. */
const ATTACHMENT_PREFIX = "[attachment]"

type UploadedAttachment = { name: string; url: string; mimeType: string }

/** The messaging API returns UTC LocalDateTime values without a zone suffix.
 * Browsers otherwise interpret those values as local time, leaving Cambodia
 * timestamps seven hours behind. Preserve timestamps that already carry a
 * timezone and treat only zone-less values as UTC. */
function messageDate(value?: string): Date {
  if (!value) return new Date(Number.NaN)
  const hasTimezone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(value)
  return new Date(hasTimezone ? value : `${value}Z`)
}

function parseAttachment(body: string): UploadedAttachment | null {
  if (!body.startsWith(ATTACHMENT_PREFIX)) return null
  try {
    return JSON.parse(
      body.slice(ATTACHMENT_PREFIX.length),
    ) as UploadedAttachment
  } catch {
    return null
  }
}

/** Images and voice notes go to the media endpoint, documents to their own. */
async function uploadAttachment(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const isMedia =
    file.type.startsWith("image/") || file.type.startsWith("audio/")
  const response = await fetch(
    isMedia ? "/api/files/upload" : "/api/files/documents",
    { method: "POST", body: formData },
  )
  const result = (await response.json()) as {
    objectName?: string
    uri?: string
    url?: string
    message?: string
  }
  if (!response.ok) throw new Error(result.message || "File upload failed")
  const url = result.uri || result.url || getFileUrl(result.objectName)
  if (!url) throw new Error("The upload did not return a file URL")
  return url
}

/** In the thread list an envelope has to read as what it is, not as JSON. */
function conversationPreview(body?: string): string {
  if (!body) return "No messages yet"
  const file = parseAttachment(body)
  if (!file) return body
  if (file.mimeType.startsWith("image/")) return "📷 Photo"
  if (file.mimeType.startsWith("audio/")) return "🎤 Voice message"
  return `📎 ${file.name || "Attachment"}`
}

/** Thread-list stamp: clock time for today, "Yesterday", then a short date. */
function threadStamp(iso?: string): string {
  if (!iso) return ""
  const date = messageDate(iso)
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
  const date = messageDate(iso)
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

/** A day divider so a long thread does not read as one undated run. */
function dayLabel(iso?: string): string {
  if (!iso) return ""
  const date = messageDate(iso)
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
    (a, b) => messageDate(a.sentAt).getTime() - messageDate(b.sentAt).getTime(),
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
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        initial
      )}
    </div>
  )
}

export function MessageCenter({ audience = "seller" }: { audience?: "seller" | "buyer" }) {
  const connectionState = useMessageWebSocket()
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    isError,
    refetch,
  } = useGetConversationsQuery()
  const [sendMessage, { isLoading: isSending }] =
    useSendConversationMessageMutation()
  const [markRead] = useMarkConversationReadMutation()

  const [selectedId, setSelectedId] = React.useState("")
  const [query, setQuery] = React.useState("")
  const [draft, setDraft] = React.useState("")
  const [attachment, setAttachment] = React.useState<File | null>(null)
  const [ownSenderIds, setOwnSenderIds] = React.useState<Set<string>>(() => new Set())
  const [isUploading, setIsUploading] = React.useState(false)
  const [isRecording, setIsRecording] = React.useState(false)
  const [recordingSeconds, setRecordingSeconds] = React.useState(0)
  const [profileOpen, setProfileOpen] = React.useState(false)
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

  /* Everything the two of you have exchanged as pictures, for the side panel. */
  const sharedPhotos = React.useMemo(
    () =>
      messages
        .map((message) => parseAttachment(message.body))
        .filter((file): file is UploadedAttachment =>
          Boolean(file?.mimeType.startsWith("image/")),
        ),
    [messages],
  )

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

  /* Leaving the page mid-recording must not leave the microphone open. */
  const recorderRef = React.useRef<MediaRecorder | null>(null)
  const recordingStreamRef = React.useRef<MediaStream | null>(null)
  const recordingTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null,
  )
  React.useEffect(
    () => () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
      recordingStreamRef.current?.getTracks().forEach((track) => track.stop())
    },
    [],
  )

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
    setProfileOpen(false)
  }

  async function startRecording() {
    if (!activeId || isUploading || isSending) return
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      toast.error("Voice recording is not supported by this browser.")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const preferredType = MediaRecorder.isTypeSupported(
        "audio/webm;codecs=opus",
      )
        ? "audio/webm;codecs=opus"
        : "audio/webm"
      const recorder = new MediaRecorder(stream, { mimeType: preferredType })
      const chunks: BlobPart[] = []
      recordingStreamRef.current = stream
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: recorder.mimeType || "audio/webm",
        })
        if (blob.size > 0) {
          setAttachment(
            new File([blob], `voice-${Date.now()}.webm`, { type: blob.type }),
          )
        }
        stream.getTracks().forEach((track) => track.stop())
        recordingStreamRef.current = null
      }
      recorder.start()
      setAttachment(null)
      setRecordingSeconds(0)
      setIsRecording(true)
      recordingTimerRef.current = setInterval(
        () => setRecordingSeconds((seconds) => seconds + 1),
        1000,
      )
    } catch {
      toast.error(
        "Microphone access was denied. Allow microphone access and try again.",
      )
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop()
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    recordingTimerRef.current = null
    recorderRef.current = null
    setIsRecording(false)
  }

  async function submitMessage(event?: React.FormEvent) {
    event?.preventDefault()
    const body = draft.trim()
    if ((!body && !attachment) || !activeId || isSending || isUploading) return
    const pendingFile = attachment
    setDraft("")
    stickToBottom.current = true
    try {
      if (body) {
        const sent = await sendMessage({ conversationUuid: activeId, body }).unwrap()
        if (sent.senderId) setOwnSenderIds((current) => new Set(current).add(sent.senderId))
      }
      if (pendingFile) {
        setIsUploading(true)
        const url = await uploadAttachment(pendingFile)
        const sent = await sendMessage({
          conversationUuid: activeId,
          body: `${ATTACHMENT_PREFIX}${JSON.stringify({
            name: pendingFile.name,
            url,
            mimeType: pendingFile.type,
          })}`,
        }).unwrap()
        if (sent.senderId) setOwnSenderIds((current) => new Set(current).add(sent.senderId))
      }
      setAttachment(null)
    } catch (error) {
      setDraft(body) // keep what they typed so the send can be retried
      toast.error(
        error instanceof Error ? error.message : "Could not send the message.",
      )
    } finally {
      setIsUploading(false)
    }
  }

  const otherUserIds = React.useMemo(() => conversations.map((conversation) => conversation.otherUserId), [conversations])
  const storeProfiles = useStoreProfiles(audience === "buyer" ? otherUserIds : [])
  const identityOf = React.useCallback((conversation?: (typeof conversations)[number]) => {
    const store = conversation && audience === "buyer" ? storeProfiles[conversation.otherUserId] : undefined
    return {
      name: store?.businessName || conversation?.otherUserName || (audience === "buyer" ? "Store" : "Customer"),
      avatar: store?.logoUri || conversation?.otherUserAvatar,
    }
  }, [audience, storeProfiles])

  const needle = query.trim().toLowerCase()
  const visibleConversations = needle
    ? conversations.filter((item) =>
        identityOf(item).name.toLowerCase().includes(needle),
      )
    : conversations

  const customerName = identityOf(active).name
  const showThread = mobilePane === "thread"
  const composerBusy = !activeId || isUploading || isRecording

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="relative flex h-[calc(100dvh-8.5rem)] min-h-[460px] w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* ── LEFT: customer threads ── */}
        <aside
          className={cn(
            "h-full min-h-0 w-full shrink-0 flex-col overflow-hidden border-border md:flex md:w-[320px] md:border-r",
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
                placeholder={audience === "buyer" ? "Search stores…" : "Search customers…"}
                className="h-10 w-full rounded-xl bg-muted pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/25"
              />
            </label>
          </div>

          <div
            className={cn(
              "min-h-0 flex-1 divide-y divide-border overflow-y-auto overscroll-contain",
              audience === "seller" && "scrollbar-none",
            )}
          >
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
                  ? audience === "buyer"
                    ? "No messages yet. Open a store or product to contact a seller."
                    : "No messages yet. When a buyer contacts your shop, the conversation appears here."
                  : audience === "buyer" ? "No stores match your search." : "No customers match your search."}
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
                      name={identityOf(conversation).name}
                      avatar={identityOf(conversation).avatar}
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
                          {identityOf(conversation).name}
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
                        {conversationPreview(conversation.lastMessage)}
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
            "h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-muted/30 md:flex",
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
                  name={identityOf(active).name}
                  avatar={identityOf(active).avatar}
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
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-label="Conversation details"
                  aria-pressed={profileOpen}
                  className={cn(
                    "ml-auto grid size-9 shrink-0 place-items-center rounded-xl text-primary transition hover:bg-muted",
                    profileOpen && "bg-primary/10",
                  )}
                >
                  <Info className="size-5" />
                </button>
              </>
            )}
          </header>

          <div
            ref={logRef}
            onScroll={handleLogScroll}
            className={cn(
              "min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 sm:p-6",
              audience === "seller" && "scrollbar-none",
            )}
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
                  const isPending = message.senderId === PENDING_SENDER_ID
                  const sentByKnownCurrentUser = ownSenderIds.has(message.senderId)
                  const sentByOtherParticipant = message.senderId === active?.otherUserId
                  // Alignment is relative to the viewer: their own messages
                  // are right, and the conversation's other participant is left.
                  const alignLeft = isPending || sentByKnownCurrentUser
                    ? false
                    : sentByOtherParticipant
                  const file = parseAttachment(message.body)
                  const isImage = Boolean(file?.mimeType.startsWith("image/"))
                  const showDay =
                    index === 0 ||
                    dayLabel(messages[index - 1].sentAt) !==
                      dayLabel(message.sentAt)

                  const nextMessage = messages[index + 1]
                  const nextIsPending = nextMessage?.senderId === PENDING_SENDER_ID
                  const nextSentByCurrentUser = nextMessage
                    ? ownSenderIds.has(nextMessage.senderId)
                    : false
                  const nextAlignsLeft = nextMessage
                    ? nextIsPending || nextSentByCurrentUser
                      ? false
                      : nextMessage.senderId === active?.otherUserId
                    : null
                  const endsMessageGroup =
                    nextAlignsLeft === null || nextAlignsLeft !== alignLeft

                  if (audience === "buyer") {
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
                            "group/message flex w-full items-end gap-2",
                            alignLeft ? "justify-start" : "justify-end",
                            endsMessageGroup ? "pb-2" : "-mt-1",
                          )}
                        >
                          {alignLeft && (
                            <div className="w-9 shrink-0 self-end">
                              {endsMessageGroup && (
                                <CustomerAvatar
                                  name={identityOf(active).name}
                                  avatar={identityOf(active).avatar}
                                  size={36}
                                />
                              )}
                            </div>
                          )}

                          {!alignLeft && endsMessageGroup && (
                            <div className="order-3 mb-0.5 shrink-0">
                              <CustomerAvatar name="You" size={18} />
                            </div>
                          )}

                          <div
                            className={cn(
                              "flex min-w-0 max-w-[78%] items-center gap-2 sm:max-w-[68%]",
                              alignLeft ? "flex-row" : "flex-row-reverse",
                            )}
                          >
                            <div
                              className={cn(
                                "min-w-0 rounded-[18px] text-[15px] leading-snug",
                                isImage
                                  ? "overflow-hidden"
                                  : cn(
                                      "px-3.5 py-2",
                                      alignLeft
                                        ? "bg-muted text-foreground"
                                        : "bg-primary text-primary-foreground",
                                    ),
                                isPending && "opacity-70",
                              )}
                              title={isPending ? "Sending…" : bubbleStamp(message.sentAt)}
                            >
                              {file ? (
                                isImage ? (
                                  <a href={file.url} target="_blank" rel="noreferrer" className="block">
                                    <Image src={file.url} alt={file.name || "Shared image"} width={360} height={280} className="max-h-72 w-auto max-w-full rounded-[18px] object-contain" />
                                  </a>
                                ) : file.mimeType.startsWith("audio/") ? (
                                  <div className="min-w-[220px]">
                                    <div className="mb-1 flex items-center gap-2 text-xs font-medium"><Mic className="size-4" /> Voice message</div>
                                    <audio controls preload="metadata" src={file.url} className="h-9 w-full max-w-[280px]" />
                                  </div>
                                ) : (
                                  <a href={file.url} target="_blank" rel="noreferrer" download className="flex items-center gap-2 underline underline-offset-2">
                                    <FileText className="size-5 shrink-0" />
                                    <span className="truncate">{file.name || "Attachment"}</span>
                                  </a>
                                )
                              ) : (
                                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                              )}
                            </div>

                            <div className="flex shrink-0 items-center gap-0.5 text-muted-foreground opacity-0 transition-opacity group-hover/message:opacity-100 group-focus-within/message:opacity-100">
                              <button type="button" title="React" aria-label="React to message" className="rounded-full p-1.5 hover:bg-muted hover:text-foreground"><Smile className="size-4" /></button>
                              <button type="button" title="Reply" aria-label="Reply to message" className="rounded-full p-1.5 hover:bg-muted hover:text-foreground"><Reply className="size-4" /></button>
                              <button type="button" title="More" aria-label="More message options" className="rounded-full p-1.5 hover:bg-muted hover:text-foreground"><MoreHorizontal className="size-4" /></button>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    )
                  }

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
                          alignLeft
                            ? "mr-auto items-start"
                            : "ml-auto items-end",
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl text-sm leading-relaxed",
                            /* A photo is its own bubble — no plate behind it. */
                            isImage
                              ? "overflow-hidden"
                              : cn(
                                  "px-4 py-2.5 shadow-sm",
                                  alignLeft
                                    ? "rounded-tl-none border border-border bg-card text-foreground"
                                    : "rounded-tr-none bg-primary text-primary-foreground",
                                ),
                            isPending && "opacity-70",
                          )}
                        >
                          {file ? (
                            isImage ? (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noreferrer"
                                className="block"
                              >
                                <Image
                                  src={file.url}
                                  alt={file.name || "Shared image"}
                                  width={360}
                                  height={280}
                                  className="max-h-72 w-auto max-w-full rounded-2xl object-contain"
                                />
                              </a>
                            ) : file.mimeType.startsWith("audio/") ? (
                              <div className="min-w-[220px]">
                                <div className="mb-1 flex items-center gap-2 text-xs font-medium">
                                  <Mic className="size-4" /> Voice message
                                </div>
                                <audio
                                  controls
                                  preload="metadata"
                                  src={file.url}
                                  className="h-9 w-full max-w-[280px]"
                                />
                              </div>
                            ) : (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="flex items-center gap-2 underline underline-offset-2"
                              >
                                <FileText className="size-5 shrink-0" />
                                <span className="truncate">
                                  {file.name || "Attachment"}
                                </span>
                              </a>
                            )
                          ) : (
                            <p className="whitespace-pre-wrap break-words">
                              {message.body}
                            </p>
                          )}
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

          <div className="shrink-0 border-t border-border bg-card p-3 sm:p-4">
            {attachment && (
              <div className="mb-2 flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-foreground">
                {attachment.type.startsWith("audio/") ? (
                  <Mic className="size-4 shrink-0 text-primary" />
                ) : (
                  <Paperclip className="size-4 shrink-0 text-primary" />
                )}
                <span className="min-w-0 flex-1 truncate">
                  {attachment.type.startsWith("audio/")
                    ? "Voice message ready"
                    : attachment.name}
                </span>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  aria-label="Remove attachment"
                  className="grid size-6 shrink-0 place-items-center rounded-full hover:bg-foreground/10"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            {isRecording && (
              <div className="mb-2 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <span className="size-2 animate-pulse rounded-full bg-red-500" />
                Recording… {Math.floor(recordingSeconds / 60)}:
                {String(recordingSeconds % 60).padStart(2, "0")}
              </div>
            )}

            <form onSubmit={submitMessage} className="flex items-end gap-2">
              <label
                title="Attach a photo or document"
                className={cn(
                  "grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl text-primary transition hover:bg-muted",
                  composerBusy && "pointer-events-none opacity-50",
                )}
              >
                <Paperclip className="size-5" />
                <span className="sr-only">Attach a photo or document</span>
                <input
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx"
                  disabled={composerBusy}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) setAttachment(file)
                    event.target.value = "" // let the same file be picked again
                  }}
                />
              </label>

              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!activeId || isUploading || isSending}
                aria-label={
                  isRecording ? "Stop recording" : "Record a voice message"
                }
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-xl transition",
                  isRecording
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "text-primary hover:bg-muted",
                  (!activeId || isUploading || isSending) && "opacity-50",
                )}
              >
                {isRecording ? (
                  <Square className="size-4 fill-current" />
                ) : (
                  <Mic className="size-5" />
                )}
              </button>

              <textarea
                rows={1}
                value={draft}
                disabled={composerBusy}
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
                disabled={
                  (!draft.trim() && !attachment) ||
                  !activeId ||
                  isSending ||
                  isUploading ||
                  isRecording
                }
                aria-label="Send message"
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
              >
                {isSending || isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── DETAILS: who you are talking to, and what you have shared ── */}
        {profileOpen && active && (
          <aside
            className={cn(
              "absolute inset-0 z-20 flex flex-col overflow-y-auto border-border bg-card p-5 md:static md:w-[300px] md:shrink-0 md:border-l",
              audience === "seller" && "scrollbar-none",
            )}
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                aria-label="Close customer details"
                className="grid size-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <CustomerAvatar
                name={identityOf(active).name}
                avatar={identityOf(active).avatar}
                size={88}
              />
              <h3 className="mt-4 text-lg font-bold text-foreground">
                {customerName}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {connectionState === "connected"
                  ? "Live conversation"
                  : "Reconnecting…"}
              </p>
            </div>

            <div className="mt-6 space-y-2 border-y border-border py-4">
              <div className="flex items-center gap-3 px-1">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <UserRound className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{audience === "buyer" ? "Store ID" : "Customer ID"}</p>
                  <p
                    className="truncate text-sm font-medium text-foreground"
                    title={active.otherUserId}
                  >
                    {active.otherUserId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-1">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Connection</p>
                  <p className="text-sm font-medium text-foreground">
                    {audience === "buyer" ? "Phsar Digital seller" : "Phsar Digital customer"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-center gap-2">
                <Images className="size-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">
                  Shared photos
                </h4>
                <span className="ml-auto text-xs text-muted-foreground">
                  {sharedPhotos.length}
                </span>
              </div>
              {sharedPhotos.length > 0 ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {sharedPhotos.slice(-9).map((photo, index) => (
                    <a
                      key={`${photo.url}-${index}`}
                      href={photo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                    >
                      <Image
                        src={photo.url}
                        alt={photo.name || "Shared photo"}
                        fill
                        className="object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-muted px-3 py-5 text-center text-xs text-muted-foreground">
                  No shared photos yet.
                </p>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
