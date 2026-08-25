"use client"

import * as React from "react"
import Image from "next/image"
import { ArrowLeft, FileText, Images, Info, Loader2, MessageCircle, Mic, Paperclip, Plus, Search, Send, ShieldCheck, Square, UserRound, X } from "lucide-react"
import { cn, getFileUrl } from "@/lib/utils"
import { useGetConversationsQuery, useGetConversationMessagesQuery, useMarkConversationReadMutation, useSendConversationMessageMutation } from "@/lib/redux/service/sellerMessageApi"
import { useMessageWebSocket } from "@/lib/hooks/use-message-websocket"
import { toast } from "sonner"

const ATTACHMENT_PREFIX = "[attachment]"

type UploadedAttachment = { name: string; url: string; mimeType: string }

function parseAttachment(body: string): UploadedAttachment | null {
  if (!body.startsWith(ATTACHMENT_PREFIX)) return null
  try {
    return JSON.parse(body.slice(ATTACHMENT_PREFIX.length)) as UploadedAttachment
  } catch {
    return null
  }
}

function conversationPreview(body?: string) {
  if (!body) return "No messages yet"
  const file = parseAttachment(body)
  if (!file) return body
  if (file.mimeType.startsWith("image/")) return "📷 Photo"
  if (file.mimeType.startsWith("audio/")) return "🎤 Voice message"
  return `📎 ${file.name || "Attachment"}`
}

export function MessageCenter() {
  useMessageWebSocket()
  const { data: conversations = [], isLoading: conversationsLoading, isError, refetch } = useGetConversationsQuery()
  const [selectedId, setSelectedId] = React.useState("")
  const [query, setQuery] = React.useState("")
  const [draft, setDraft] = React.useState("")
  const [attachment, setAttachment] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isRecording, setIsRecording] = React.useState(false)
  const [recordingSeconds, setRecordingSeconds] = React.useState(0)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const recorderRef = React.useRef<MediaRecorder | null>(null)
  const recordingStreamRef = React.useRef<MediaStream | null>(null)
  const recordingTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const activeId = selectedId || conversations[0]?.uuid || ""
  const selected = conversations.find((item) => item.uuid === activeId)
  const { data: messagePage, isLoading: messagesLoading } = useGetConversationMessagesQuery({ conversationUuid: activeId }, { skip: !activeId })
  const [sendMessage, { isLoading: isSending }] = useSendConversationMessageMutation()
  const [markRead] = useMarkConversationReadMutation()
  const visibleConversations = conversations.filter((item) => item.otherUserName?.toLowerCase().includes(query.toLowerCase()))
  const messages = React.useMemo(
    () => [...(messagePage?.content ?? [])].sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    ),
    [messagePage?.content],
  )
  const sharedPhotos = React.useMemo(
    () => messages
      .map((message) => parseAttachment(message.body))
      .filter((file): file is UploadedAttachment => Boolean(file?.mimeType.startsWith("image/"))),
    [messages],
  )

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  React.useEffect(() => () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  async function startRecording() {
    if (!activeId || isUploading || isSending) return
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Voice recording is not supported by this browser.")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const preferredType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm"
      const recorder = new MediaRecorder(stream, { mimeType: preferredType })
      const chunks: BlobPart[] = []
      recordingStreamRef.current = stream
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" })
        if (blob.size > 0) setAttachment(new File([blob], `voice-${Date.now()}.webm`, { type: blob.type }))
        stream.getTracks().forEach((track) => track.stop())
        recordingStreamRef.current = null
      }
      recorder.start()
      setAttachment(null)
      setRecordingSeconds(0)
      setIsRecording(true)
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1000)
    } catch {
      toast.error("Microphone access was denied. Allow microphone access and try again.")
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop()
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    recordingTimerRef.current = null
    recorderRef.current = null
    setIsRecording(false)
  }

  async function submitMessage() {
    const body = draft.trim()
    if ((!body && !attachment) || !activeId) return
    try {
      if (body) await sendMessage({ conversationUuid: activeId, body }).unwrap()
      if (attachment) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", attachment)
        const isMedia = attachment.type.startsWith("image/") || attachment.type.startsWith("audio/")
        const response = await fetch(isMedia ? "/api/files/upload" : "/api/files/documents", {
          method: "POST",
          body: formData,
        })
        const result = await response.json() as { objectName?: string; uri?: string; url?: string; message?: string }
        if (!response.ok) throw new Error(result.message || "File upload failed")
        const url = result.uri || result.url || getFileUrl(result.objectName)
        if (!url) throw new Error("The upload did not return a file URL")
        await sendMessage({
          conversationUuid: activeId,
          body: `${ATTACHMENT_PREFIX}${JSON.stringify({ name: attachment.name, url, mimeType: attachment.type })}`,
        }).unwrap()
      }
      setDraft("")
      setAttachment(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the attachment.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <section className="h-[calc(100svh-70px)] overflow-hidden bg-[#f5f6f8] p-3 text-foreground dark:bg-slate-950 sm:p-5">
      <div className={cn("relative mx-auto grid h-full min-h-0 max-w-[1440px] overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900", profileOpen ? "md:grid-cols-[340px_minmax(0,1fr)_300px]" : "md:grid-cols-[340px_minmax(0,1fr)]")}>
        <aside className={cn("min-h-0 flex-col overflow-hidden border-r bg-white dark:border-slate-800 dark:bg-slate-900", selectedId ? "hidden md:flex" : "flex")}>
          <div className="px-5 pb-3 pt-5">
            <div className="mb-4 flex items-center justify-between"><h1 className="text-2xl font-bold tracking-tight">Chats</h1><span className="grid size-9 place-items-center rounded-full bg-[#eef4ff] text-[#0866ff] dark:bg-blue-500/15 dark:text-blue-400"><MessageCircle className="size-5" /></span></div>
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Messenger" className="h-10 w-full rounded-full bg-[#f0f2f5] pl-11 pr-4 text-sm outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-[#0866ff]/20 dark:bg-slate-800 dark:placeholder:text-slate-400" />
          </label>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {conversationsLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
              : isError ? <div className="py-12 text-center text-sm text-muted-foreground"><p>Could not load conversations.</p><button onClick={() => refetch()} className="mt-3 text-primary">Try again</button></div>
              : visibleConversations.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">No conversations found.</p>
              : visibleConversations.map((conversation) => (
                <button key={conversation.uuid} type="button" onClick={() => { setSelectedId(conversation.uuid); setProfileOpen(false); void markRead(conversation.uuid) }} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#f2f3f5] dark:hover:bg-slate-800", activeId === conversation.uuid && "bg-[#e7f3ff] hover:bg-[#e7f3ff] dark:bg-blue-500/15 dark:hover:bg-blue-500/15")}>
                  <div className="relative"><Image src={conversation.otherUserAvatar || "/picture/lisa.PNG"} alt="" width={52} height={52} className="size-[52px] rounded-full object-cover" /><span className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" /></div>
                  <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><strong className="truncate text-[15px]">{conversation.otherUserName || "Customer"}</strong>{conversation.unreadCount > 0 && <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-[#0866ff] px-1 text-[10px] font-bold leading-5 text-white">{conversation.unreadCount}</span>}</div><p className={cn("mt-0.5 truncate text-xs", conversation.unreadCount > 0 ? "font-semibold text-[#0866ff]" : "text-muted-foreground")}>{conversationPreview(conversation.lastMessage)}</p></div>
                </button>
              ))}
          </div>
        </aside>

        <div className={cn("min-h-0 min-w-0 flex-col overflow-hidden bg-white dark:bg-slate-900", selectedId ? "flex" : "hidden md:flex")}>
          <header className="flex min-h-[68px] items-center gap-3 border-b px-4 shadow-[0_1px_2px_rgba(0,0,0,.06)] dark:border-slate-800 sm:px-5">
            <button type="button" onClick={() => setSelectedId("")} aria-label="Back to conversations" className="grid size-9 place-items-center rounded-full text-[#0866ff] hover:bg-[#f0f2f5] dark:text-blue-400 dark:hover:bg-slate-800 md:hidden"><ArrowLeft className="size-5" /></button>
            {selected && <><button type="button" onClick={() => setProfileOpen(true)} className="flex min-w-0 items-center gap-3 rounded-xl text-left"><div className="relative shrink-0"><Image src={selected.otherUserAvatar || "/picture/lisa.PNG"} alt="" width={42} height={42} className="size-[42px] rounded-full object-cover" /><span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" /></div><div className="min-w-0"><h2 className="truncate text-[15px] font-semibold">{selected.otherUserName || "Customer"}</h2><p className="text-xs text-muted-foreground">Active now</p></div></button><button type="button" onClick={() => setProfileOpen((open) => !open)} aria-label="Conversation information" className="ml-auto grid size-9 place-items-center rounded-full text-[#0866ff] hover:bg-[#f0f2f5] dark:text-blue-400 dark:hover:bg-slate-800"><Info className="size-5" /></button></>}
          </header>
          <div className="flex-1 overflow-y-auto bg-white px-4 py-6 dark:bg-slate-900 sm:px-6">
            {!activeId ? <p className="pt-24 text-center text-sm text-muted-foreground">Select a conversation.</p>
              : messagesLoading ? <div className="flex justify-center pt-24"><Loader2 className="animate-spin" /></div>
              : messages.length === 0 ? <p className="pt-24 text-center text-sm text-muted-foreground">No messages yet.</p>
              : <div className="flex min-h-full flex-col justify-end gap-2">{messages.map((message) => {
                const fromCustomer = message.senderId === selected?.otherUserId
                const file = parseAttachment(message.body)
                const isImageAttachment = file?.mimeType.startsWith("image/")
                return <div key={message.uuid} className={cn("flex items-end gap-2", fromCustomer ? "justify-start" : "justify-end")}>{fromCustomer && <Image src={selected?.otherUserAvatar || "/picture/lisa.PNG"} alt="" width={28} height={28} className="size-7 rounded-full object-cover" />}<div className={cn("max-w-[75%] rounded-[20px] px-4 py-2 text-sm", isImageAttachment ? "bg-transparent p-0 text-foreground" : fromCustomer ? "rounded-bl-md bg-[#f0f2f5] text-slate-900 dark:bg-slate-800 dark:text-slate-100" : "rounded-br-md bg-[#0866ff] text-white dark:bg-blue-600")}>
                  {file ? (file.mimeType.startsWith("image/") ? (
                    <a href={file.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-[18px]"><Image src={file.url} alt={file.name || "Shared image"} width={360} height={280} unoptimized className="max-h-72 w-auto max-w-full object-contain" /></a>
                  ) : file.mimeType.startsWith("audio/") ? (
                    <div className="min-w-[220px]"><div className="mb-1 flex items-center gap-2 text-xs font-medium"><Mic className="size-4" />Voice message</div><audio controls preload="metadata" src={file.url} className="h-9 w-full max-w-[300px]" /></div>
                  ) : (
                    <a href={file.url} target="_blank" rel="noreferrer" download className="flex items-center gap-2 underline underline-offset-2"><FileText className="size-5 shrink-0" /><span className="truncate">{file.name}</span></a>
                  )) : <p>{message.body}</p>}
                  <time className={cn("mt-1 block text-[10px]", isImageAttachment ? "text-muted-foreground" : fromCustomer ? "text-muted-foreground" : "text-white/70", isImageAttachment && !fromCustomer && "text-right")}>{message.sentAt ? new Date(message.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</time></div></div>
              })}<div ref={messagesEndRef} /></div>}
          </div>
          <footer className="p-3 sm:p-4">
            {attachment && <div className="mb-2 flex items-center gap-2 rounded-2xl bg-[#f0f2f5] px-3 py-2 text-xs dark:bg-slate-800">{attachment.type.startsWith("audio/") ? <Mic className="size-4 text-[#0866ff] dark:text-blue-400" /> : <Paperclip className="size-4 text-[#0866ff] dark:text-blue-400" />}<span className="min-w-0 flex-1 truncate">{attachment.type.startsWith("audio/") ? "Voice message ready" : attachment.name}</span><button type="button" onClick={() => setAttachment(null)} aria-label="Remove attachment" className="grid size-6 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"><X className="size-4" /></button></div>}
            {isRecording && <div className="mb-2 flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400"><span className="size-2 animate-pulse rounded-full bg-red-500" />Recording… {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, "0")}</div>}
            <div className="flex items-center gap-2">
              <label className={cn("grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-[#0866ff] transition hover:bg-[#f0f2f5] dark:text-blue-400 dark:hover:bg-slate-800", (!activeId || isUploading || isRecording) && "pointer-events-none opacity-50")} title="Attach a file">
                <Plus className="size-6" />
                <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx" disabled={!activeId || isUploading || isRecording} onChange={(event) => { const file = event.target.files?.[0]; if (file) setAttachment(file); event.target.value = "" }} />
              </label>
              <button type="button" onClick={isRecording ? stopRecording : startRecording} disabled={!activeId || isUploading || isSending} aria-label={isRecording ? "Stop recording" : "Record voice message"} className={cn("grid size-10 shrink-0 place-items-center rounded-full transition", isRecording ? "bg-red-500 text-white hover:bg-red-600" : "text-[#0866ff] hover:bg-[#f0f2f5] dark:text-blue-400 dark:hover:bg-slate-800", (!activeId || isUploading || isSending) && "opacity-50")}>
                {isRecording ? <Square className="size-4 fill-current" /> : <Mic className="size-5" />}
              </button>
              <input value={draft} disabled={!activeId || isUploading || isRecording} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submitMessage() }} placeholder="Aa" className="h-10 min-w-0 flex-1 rounded-full bg-[#f0f2f5] px-4 text-sm outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-[#0866ff]/20 dark:bg-slate-800 dark:placeholder:text-slate-400" />
              <button type="button" aria-label="Send message" disabled={(!draft.trim() && !attachment) || !activeId || isSending || isUploading || isRecording} onClick={submitMessage} className="grid size-10 shrink-0 place-items-center rounded-full bg-[#0866ff] text-white transition hover:bg-[#075bd8] disabled:bg-transparent disabled:text-[#0866ff]/40">{isUploading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}</button>
            </div>
          </footer>
        </div>

        {profileOpen && selected && (
          <aside className="absolute inset-0 z-20 flex min-h-0 flex-col overflow-y-auto border-l bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:static">
            <div className="flex justify-end"><button type="button" onClick={() => setProfileOpen(false)} aria-label="Close customer profile" className="grid size-9 place-items-center rounded-full hover:bg-[#f0f2f5] dark:hover:bg-slate-800"><X className="size-5" /></button></div>
            <div className="flex flex-col items-center text-center">
              <div className="relative"><Image src={selected.otherUserAvatar || "/picture/lisa.PNG"} alt={selected.otherUserName || "Customer"} width={96} height={96} className="size-24 rounded-full object-cover shadow-sm" /><span className="absolute bottom-1 right-1 size-4 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" /></div>
              <h2 className="mt-4 text-xl font-bold">{selected.otherUserName || "Customer"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Active now</p>
            </div>
            <div className="mt-6 space-y-2 border-y py-4 dark:border-slate-800">
              <div className="flex items-center gap-3 rounded-xl px-3 py-2"><span className="grid size-9 place-items-center rounded-full bg-[#f0f2f5] text-[#0866ff] dark:bg-slate-800 dark:text-blue-400"><UserRound className="size-4" /></span><div className="min-w-0"><p className="text-xs text-muted-foreground">Customer ID</p><p className="truncate text-sm font-medium" title={selected.otherUserId}>{selected.otherUserId}</p></div></div>
              <div className="flex items-center gap-3 rounded-xl px-3 py-2"><span className="grid size-9 place-items-center rounded-full bg-[#f0f2f5] text-[#0866ff] dark:bg-slate-800 dark:text-blue-400"><ShieldCheck className="size-4" /></span><div><p className="text-xs text-muted-foreground">Connection</p><p className="text-sm font-medium">Phsar Digital customer</p></div></div>
            </div>
            <div className="mt-5">
              <div className="mb-3 flex items-center gap-2"><Images className="size-4 text-[#0866ff] dark:text-blue-400" /><h3 className="text-sm font-semibold">Shared photos</h3><span className="ml-auto text-xs text-muted-foreground">{sharedPhotos.length}</span></div>
              {sharedPhotos.length > 0 ? <div className="grid grid-cols-3 gap-1.5">{sharedPhotos.slice(-9).map((photo, index) => <a key={`${photo.url}-${index}`} href={photo.url} target="_blank" rel="noreferrer" className="relative aspect-square overflow-hidden rounded-lg bg-muted"><Image src={photo.url} alt={photo.name || "Shared photo"} fill unoptimized className="object-cover" /></a>)}</div> : <p className="rounded-xl bg-[#f0f2f5] px-3 py-5 text-center text-xs text-muted-foreground dark:bg-slate-800">No shared photos yet.</p>}
            </div>
          </aside>
        )}
      </div>
    </section>
  )
}
