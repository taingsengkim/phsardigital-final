"use client"

import * as React from "react"
import Image from "next/image"
import { Loader2, Search, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGetConversationsQuery, useGetConversationMessagesQuery, useMarkConversationReadMutation, useSendConversationMessageMutation } from "@/lib/redux/service/sellerMessageApi"
import { useMessageWebSocket } from "@/lib/hooks/use-message-websocket"

export function MessageCenter() {
  const connectionState = useMessageWebSocket()
  const { data: conversations = [], isLoading: conversationsLoading, isError, refetch } = useGetConversationsQuery()
  const [selectedId, setSelectedId] = React.useState("")
  const [query, setQuery] = React.useState("")
  const [draft, setDraft] = React.useState("")
  const activeId = selectedId || conversations[0]?.uuid || ""
  const selected = conversations.find((item) => item.uuid === activeId)
  const { data: messagePage, isLoading: messagesLoading } = useGetConversationMessagesQuery({ conversationUuid: activeId }, { skip: !activeId })
  const [sendMessage, { isLoading: isSending }] = useSendConversationMessageMutation()
  const [markRead] = useMarkConversationReadMutation()
  const visibleConversations = conversations.filter((item) => item.otherUserName?.toLowerCase().includes(query.toLowerCase()))

  async function submitMessage() {
    const body = draft.trim()
    if (!body || !activeId) return
    await sendMessage({ conversationUuid: activeId, body }).unwrap()
    setDraft("")
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-muted/50 px-4 py-6 text-foreground sm:px-7 lg:px-10">
      <div className="mx-auto grid min-h-[720px] max-w-[1280px] overflow-hidden rounded-xl border bg-card shadow-sm md:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="flex flex-col border-b md:border-b-0 md:border-r">
          <label className="relative m-4 block">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search messages" className="h-12 w-full rounded-xl bg-muted pl-11 pr-3 text-sm outline-none" />
          </label>
          <div className="flex-1 overflow-y-auto p-3 pt-0">
            {conversationsLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
              : isError ? <div className="py-12 text-center text-sm text-muted-foreground"><p>Could not load conversations.</p><button onClick={() => refetch()} className="mt-3 text-primary">Try again</button></div>
              : visibleConversations.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">No conversations found.</p>
              : visibleConversations.map((conversation) => (
                <button key={conversation.uuid} type="button" onClick={() => { setSelectedId(conversation.uuid); markRead(conversation.uuid) }} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-muted", activeId === conversation.uuid && "bg-muted")}>
                  <Image src={conversation.otherUserAvatar || "/picture/lisa.PNG"} alt="" width={48} height={48} className="size-12 rounded-full object-cover" />
                  <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><strong className="truncate text-sm">{conversation.otherUserName || "Customer"}</strong>{conversation.unreadCount > 0 && <span className="ml-auto grid size-5 place-items-center rounded-full bg-primary text-[10px] text-white">{conversation.unreadCount}</span>}</div><p className="mt-1 truncate text-xs text-muted-foreground">{conversation.lastMessage || "No messages yet"}</p></div>
                </button>
              ))}
          </div>
        </aside>

        <div className="flex min-h-[600px] min-w-0 flex-col">
          <header className="flex min-h-20 items-center gap-3 border-b px-6">
            {selected && <><Image src={selected.otherUserAvatar || "/picture/lisa.PNG"} alt="" width={42} height={42} className="size-[42px] rounded-full object-cover" /><h2 className="truncate text-lg font-semibold">{selected.otherUserName || "Customer"}</h2></>}
            {/*<span className={cn("ml-auto inline-flex items-center gap-1.5 text-xs", connectionState === "connected" ? "text-emerald-600" : "text-amber-600")}><span className={cn("size-2 rounded-full", connectionState === "connected" ? "bg-emerald-500" : "bg-amber-500")} />{connectionState === "connected" ? "Live" : connectionState === "connecting" ? "Connecting" : "Reconnecting"}</span>*/}
          </header>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {!activeId ? <p className="pt-24 text-center text-sm text-muted-foreground">Select a conversation.</p>
              : messagesLoading ? <div className="flex justify-center pt-24"><Loader2 className="animate-spin" /></div>
              : (messagePage?.content ?? []).length === 0 ? <p className="pt-24 text-center text-sm text-muted-foreground">No messages yet.</p>
              : <div className="space-y-4">{(messagePage?.content ?? []).map((message) => {
                const fromCustomer = message.senderId === selected?.otherUserId
                return <div key={message.uuid} className={cn("flex", fromCustomer ? "justify-start" : "justify-end")}><div className={cn("max-w-[75%] rounded-2xl px-4 py-3 text-sm", fromCustomer ? "bg-muted" : "bg-[#8068e8] text-white")}><p>{message.body}</p><time className={cn("mt-1 block text-[10px]", fromCustomer ? "text-muted-foreground" : "text-white/70")}>{message.sentAt ? new Date(message.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</time></div></div>
              })}</div>}
          </div>
          <footer className="flex gap-3 border-t p-4">
            <input value={draft} disabled={!activeId} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submitMessage() }} placeholder="Write a message" className="h-11 min-w-0 flex-1 rounded-xl bg-muted px-4 text-sm outline-none" />
            <button type="button" disabled={!draft.trim() || !activeId || isSending} onClick={submitMessage} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#8068e8] px-5 text-sm font-semibold text-white disabled:opacity-50">{isSending ? "Sending..." : "Send"}<Send className="size-4" /></button>
          </footer>
        </div>
      </div>
    </section>
  )
}
