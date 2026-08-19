"use client"

import * as React from "react"
import Image from "next/image"
import { Check, Heart, LoaderCircle, Search, Smile, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { getFileUrl } from "@/lib/utils"
import { useGetSellerReviewsQuery } from "@/lib/redux/service/sellerDashboardApi"
import type { SellerReview } from "@/lib/types/seller-dashboard"

type CommentItem = {
  id: string | number
  name: string
  message: string
  time: string
  avatar: string
  product: string
  art: string
}

const initialComments: CommentItem[] = [
  { id: 1, name: "Samson Heathcote", message: "Awesome, keep it up,", time: "8h", avatar: "/picture/sengkim.jpg", product: "DSM - Geometry pattern", art: "from-[#b8d6c4] via-[#eac3aa] to-[#b16f50]" },
  { id: 2, name: "Maureen Russel", message: "Well done, I’m just purchased.", time: "14h", avatar: "/picture/menghor.jpg", product: "Node - Crypto iOS UI design kit", art: "from-[#eadcff] via-[#f3e1b9] to-[#c8a7ed]" },
  { id: 3, name: "Whitney Nicolas", message: "Awesome, keep it up,", time: "16h", avatar: "/picture/bunleang.jpg", product: "TaskEz: Productivity App iOS UI Kit", art: "from-[#ffbf69] via-[#ee805e] to-[#f2dfd4]" },
  { id: 4, name: "Amani Rempel", message: "Awesome, keep it up,", time: "19h", avatar: "/picture/lisa.PNG", product: "Bitcloud - Crypto exchange UI kit", art: "from-[#82d4ff] via-[#f9ccd7] to-[#9c78d0]" },
  { id: 5, name: "Corene Toy", message: "Awesome, keep it up,", time: "1 day", avatar: "/picture/sokhim.JPG", product: "Academe 3D Education Icons", art: "from-[#55526c] via-[#817db9] to-[#e8bbc5]" },
]

const commentArt = [
  "from-[#b8d6c4] via-[#eac3aa] to-[#b16f50]",
  "from-[#eadcff] via-[#f3e1b9] to-[#c8a7ed]",
  "from-[#ffbf69] via-[#ee805e] to-[#f2dfd4]",
]

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="checkbox" aria-checked={checked} aria-label={label} onClick={onChange} className={cn("grid size-[22px] shrink-0 place-items-center rounded-[5px] border", checked ? "border-[#2f80ed] bg-[#2f80ed] text-white" : "border-[#c7ccd1] bg-white")}>{checked && <Check className="size-[15px]" strokeWidth={3} />}</button>
}

function ProductArt({ art, index }: { art: string; index: number }) {
  return <div className={cn("relative size-[70px] shrink-0 overflow-hidden rounded-[8px] bg-gradient-to-br", art)} aria-hidden="true"><span className="absolute -bottom-2 left-2 h-8 w-14 -rotate-12 rounded-full bg-white/55" /><span className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[30%] bg-white/45 shadow-md" /><span className={cn("absolute h-10 w-3 rounded-full bg-white/65", index % 2 ? "right-4 top-3 rotate-12" : "left-4 top-2 -rotate-12")} /></div>
}

export function Comment() {
  const { data, isLoading, isError } = useGetSellerReviewsQuery({ pageNumber: 0, pageSize: 100 })
  const apiComments = React.useMemo<CommentItem[]>(() => (data?.content ?? []).map((review: SellerReview, index) => ({
    id: review.uuid,
    name: review.buyer?.fullName || [review.buyer?.firstName, review.buyer?.lastName].filter(Boolean).join(" ") || review.buyer?.username || "Buyer",
    message: review.comment || "",
    time: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "",
    avatar: getFileUrl(review.buyer?.avatarFile?.uri) || "/picture/lisa.PNG",
    product: review.listing?.title || "Product",
    art: commentArt[index % commentArt.length],
  })), [data])
  const [comments, setComments] = React.useState<CommentItem[]>([])
  // Synchronize the editable local list when the API response changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setComments(apiComments), [apiComments])
  const [selected, setSelected] = React.useState<Set<string | number>>(new Set())
  const [query, setQuery] = React.useState("")
  const [replyingTo, setReplyingTo] = React.useState<string | number | null>(null)
  const [replies, setReplies] = React.useState<Record<string, string>>({})
  const [draftReply, setDraftReply] = React.useState("")
  const visible = comments.filter((item) => `${item.name} ${item.message} ${item.product}`.toLowerCase().includes(query.toLowerCase()))
  const allSelected = visible.length > 0 && visible.every((item) => selected.has(item.id))

  function toggle(id: string | number) {
    setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }
  function toggleAll() {
    setSelected((current) => { const next = new Set(current); if (allSelected) visible.forEach((item) => next.delete(item.id)); else visible.forEach((item) => next.add(item.id)); return next })
  }
  function startReply(id: string | number) {
    setReplyingTo(id)
    setDraftReply(replies[id] ?? "")
  }
  function saveReply(id: string | number) {
    if (draftReply.trim()) setReplies((current) => ({ ...current, [id]: draftReply.trim() }))
    setReplyingTo(null)
    setDraftReply("")
  }

  return (
    <section className="flex min-h-[calc(100vh-104px)] flex-col bg-[#f7f7f8] px-[28px] py-[28px] text-[#27282b] sm:px-[38px]">
      <h1 className="mb-[22px] text-[32px] font-bold leading-none tracking-[-0.8px]">Comments</h1>
      <div className="flex-1 rounded-[10px] bg-white px-[18px] pb-[20px] pt-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap items-center gap-[16px] pb-[25px]"><span className="h-[31px] w-[14px] rounded-[5px] bg-[#c9b7ff]" /><h2 className="text-[17px] font-semibold">Product comments</h2><label className="relative w-full max-w-[345px] sm:ml-[8px]"><Search className="absolute left-[13px] top-1/2 size-[18px] -translate-y-1/2 text-[#75808c]" /><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search comments" className="h-[39px] w-full rounded-[10px] border-0 bg-[#f4f4f5] pl-[40px] pr-[14px] text-[13px] outline-none focus:ring-2 focus:ring-[#8068e8]/25" /></label></div>

        <div className="flex items-center border-b border-[#eceef0] pb-[14px] text-[11px] font-medium text-[#777f89]"><Checkbox checked={allSelected} onChange={toggleAll} label="Select all comments" /><span className="ml-[32px] flex-1">Comments</span><span className="hidden w-[270px] md:block">Products</span></div>

        {visible.map((comment, index) => (
          <div key={comment.id} className={cn("group flex min-h-[112px] items-start border-b border-[#eceef0] px-[2px] py-[18px] transition-colors", replyingTo === comment.id && "my-[6px] rounded-[9px] border-b-0 bg-[#fafafa] px-[10px] shadow-[0_2px_2px_rgba(0,0,0,0.08)]")}>
            <Checkbox checked={selected.has(comment.id)} onChange={() => toggle(comment.id)} label={`Select comment by ${comment.name}`} />
            <div className="ml-[32px] flex min-w-0 flex-1 gap-[16px]">
              <Image src={comment.avatar} alt="" width={42} height={42} className="size-[42px] shrink-0 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-[10px]"><p className="truncate text-[12px] font-semibold">{comment.name}</p><span className="ml-auto text-[10px] text-[#858c95] md:hidden">{comment.time}</span></div>
                <p className="mt-[3px] text-[11px] text-[#34383d]">{comment.message}</p>
                {replies[comment.id] && replyingTo !== comment.id && <div className="mt-[12px] flex items-start gap-[9px]"><Image src="/picture/lisa.PNG" alt="Your avatar" width={34} height={34} className="size-[34px] rounded-full object-cover" /><p className="pt-[4px] text-[11px]"><span className="font-semibold text-[#3182e5]">@elva</span> {replies[comment.id]}</p></div>}
                {replyingTo === comment.id && <div className="mt-[12px] flex items-start gap-[9px]"><Image src="/picture/lisa.PNG" alt="Your avatar" width={34} height={34} className="size-[34px] rounded-full object-cover" /><div className="flex-1"><div className="flex items-center border-b border-[#dfe2e5] pb-[5px] text-[11px]"><span className="mr-[4px] font-semibold text-[#3182e5]">@elva</span><input autoFocus value={draftReply} onChange={(event) => setDraftReply(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveReply(comment.id) }} placeholder="Leave something to reply" className="min-w-0 flex-1 bg-transparent outline-none" /></div><div className="mt-[10px] flex gap-[8px]"><button type="button" onClick={() => saveReply(comment.id)} className="h-[35px] rounded-[7px] bg-[#7654e8] px-[17px] text-[11px] font-semibold text-white">Reply</button><button type="button" onClick={() => setReplyingTo(null)} className="h-[35px] rounded-[7px] border border-[#dfe2e5] bg-white px-[15px] text-[11px] font-semibold">Cancel</button></div></div></div>}
                {replyingTo !== comment.id && !replies[comment.id] && <div className="mt-[10px] flex gap-[20px] text-[#7b858e] opacity-100 md:opacity-0 md:group-hover:opacity-100"><button type="button" onClick={() => startReply(comment.id)} aria-label="Reply"><Heart className="size-[17px]" /></button><button type="button" onClick={() => { setComments((items) => items.filter((item) => item.id !== comment.id)); setSelected((items) => { const next = new Set(items); next.delete(comment.id); return next }) }} aria-label="Delete comment"><Trash2 className="size-[16px]" /></button><button type="button" onClick={() => startReply(comment.id)} aria-label="React to comment"><Smile className="size-[17px]" /></button></div>}
              </div>
            </div>
            <span className="hidden w-[52px] pt-[6px] text-[10px] text-[#858c95] md:block">{comment.time}</span>
            <div className="hidden w-[270px] items-start gap-[15px] md:flex"><ProductArt art={comment.art} index={index} /><div className="pt-[4px]"><p className="max-w-[150px] text-[12px] font-semibold leading-[17px]">{comment.product}</p><p className="mt-[3px] text-[10px] text-[#858c95]">UI design kit</p></div></div>
          </div>
        ))}
        {visible.length === 0 && <p className="py-[70px] text-center text-[13px] text-[#858c95]">No comments found.</p>}
        <div className="flex justify-center pt-[22px]"><button type="button" className="flex h-[38px] items-center gap-[9px] rounded-[8px] border border-[#e1e3e6] px-[16px] text-[11px] font-semibold shadow-sm"><LoaderCircle className="size-[17px]" /> Load more</button></div>
      </div>
    </section>
  )
}
