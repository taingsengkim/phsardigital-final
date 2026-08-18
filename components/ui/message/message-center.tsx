"use client"

import * as React from "react"
import Image from "next/image"
import { CloudUpload, MoreHorizontal, Search, Send, Smile } from "lucide-react"

import { cn } from "@/lib/utils"

type Contact = {
  id: number
  name: string
  time: string
  image: string
  online: boolean
}

type ChatMessage = {
  id: number
  sender: "customer" | "seller"
  text: React.ReactNode
}

const contacts: Contact[] = [
  { id: 1, name: "Taing Sengkim", time: "03:30PM", image: "/picture/menghor.jpg", online: true },
  { id: 2, name: "Sim Menghor", time: "11:59AM", image: "/picture/bunleang.jpg", online: false },
  { id: 3, name: "Lor Vengroth", time: "09:30AM", image: "/picture/sokhim.JPG", online: true },
  { id: 4, name: "Kimlay", time: "08:00AM", image: "/picture/lisa.PNG", online: false },
]

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "customer",
    text: <>When do you release the coded for the Fleet - Travel kit?<br /><a className="text-[#1683ff]" href="#">https://ui8.net/product-link</a></>,
  },
  {
    id: 2,
    sender: "seller",
    text: <>Hi @menghor, thanks for contacting.<br />Yes, I&apos;m working on it. It would be released next 2 weeks. You could check the progress here: <a className="text-[#1683ff]" href="#">https://ui8.net/progress</a><br /><br />Thanks for your patience and understanding. 🙌<br />Regards,<br /><br />Taing Sengkim</>,
  },
]

export function MessageCenter() {
  const [selectedId, setSelectedId] = React.useState(2)
  const [query, setQuery] = React.useState("")
  const [draft, setDraft] = React.useState("P/s: One more thing I need to tell you")
  const [messages, setMessages] = React.useState(initialMessages)
  const selected = contacts.find((contact) => contact.id === selectedId) ?? contacts[0]
  const visibleContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(query.toLowerCase()))

  function sendMessage() {
    const message = draft.trim()
    if (!message) return
    setMessages((current) => [...current, { id: Date.now(), sender: "seller", text: message }])
    setDraft("")
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-muted/50 px-4 py-6 text-foreground sm:px-7 lg:px-10">
      <div className="mx-auto max-w-[1280px]">
        <h1 className="mb-6 text-[32px] font-bold leading-none tracking-[-0.7px]">Message center</h1>

        <div className="grid min-h-[720px] overflow-hidden rounded-xl border border-border bg-card shadow-sm md:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="flex min-h-[320px] flex-col border-b border-border md:border-b-0 md:border-r">
            <div className="max-h-[420px] overflow-y-auto p-3 md:max-h-none md:flex-1">
              {visibleContacts.map((contact) => (
                <button key={contact.id} type="button" onClick={() => setSelectedId(contact.id)} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted", selectedId === contact.id && "bg-muted")}>
                  <div className="relative shrink-0">
                    <Image src={contact.image} alt="" width={50} height={50} className="size-[50px] rounded-full object-cover" />
                    <span className={cn("absolute left-0 top-0 size-3 rounded-full border-2 border-card", contact.online ? "bg-[#7bcf68]" : "bg-transparent")} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="truncate text-[13px]">{contact.name}</strong>
                      <time className="ml-auto shrink-0 text-[10px] text-muted-foreground">{contact.time}</time>
                      <span className={cn("size-2.5 shrink-0 rounded-full", contact.online ? "bg-[#3688ff]" : "bg-[#a8afb7]")} />
                    </div>
                    <p className="mt-2 truncate text-[12px] text-muted-foreground">When do you release the coded...</p>
                  </div>
                </button>
              ))}
            </div>
            <label className="relative m-4 mt-auto block">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search message" className="h-12 w-full rounded-xl border-0 bg-muted pl-11 pr-3 text-[12px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20" />
            </label>
          </aside>

          <div className="flex min-h-[600px] min-w-0 flex-col">
            <header className="flex min-h-[94px] items-center gap-4 border-b border-border bg-muted/40 px-6 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-[19px] font-semibold">{selected.name}</h2>
                <p className="mt-2 flex flex-wrap gap-x-3 text-[10px] text-muted-foreground">
                  <span>Customer since: Sep 2044</span><span>|</span><span>Purchased: <b className="text-foreground">21 items</b></span><span>|</span><span>Lifetime: <b className="text-foreground">$1,235.00</b></span>
                </p>
              </div>
              <button type="button" aria-label="Conversation actions" className="ml-auto grid size-10 shrink-0 place-items-center rounded-full bg-card text-muted-foreground"><MoreHorizontal className="size-5" /></button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-8">
              <div className="mb-8 flex justify-center"><button type="button" className="h-10 rounded-lg border border-border bg-card px-4 text-[11px] font-semibold shadow-sm hover:bg-muted">Load conversation</button></div>
              <div className="space-y-7">
                {messages.map((message) => {
                  const customer = message.sender === "customer"
                  return (
                    <div key={message.id} className="flex items-start gap-3">
                      <Image src={customer ? selected.image : "/picture/lisa.PNG"} alt="" width={38} height={38} className="size-[38px] shrink-0 rounded-full object-cover" />
                      <div className="min-w-0 max-w-[720px]">
                        <p className="mb-1.5 text-[11px] text-muted-foreground"><span className="mr-4 font-semibold">{customer ? selected.name : "Taing Sengkim"}</span>11:59AM</p>
                        <div className="text-[13px] leading-[1.6] text-foreground">{message.text}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <footer className="flex items-center gap-3 border-t border-border px-4 py-4 sm:px-6">
              <button type="button" aria-label="Upload attachment" className="grid size-9 shrink-0 place-items-center text-muted-foreground"><CloudUpload className="size-5" /></button>
              <button type="button" aria-label="Add emoji" className="grid size-9 shrink-0 place-items-center text-muted-foreground"><Smile className="size-5" /></button>
              <div className="flex min-w-0 flex-1 items-center rounded-xl border border-border bg-muted/60 p-1">
                <input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendMessage() }} aria-label="Message" className="h-10 min-w-0 flex-1 bg-transparent px-3 text-[12px] outline-none" />
                <button type="button" onClick={sendMessage} className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#8068e8] px-5 text-[11px] font-semibold text-white hover:bg-[#7057df]">Send <Send className="size-3.5 sm:hidden" /></button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </section>
  )
}
