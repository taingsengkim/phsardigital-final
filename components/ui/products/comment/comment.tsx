"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  CornerDownRight,
  ExternalLink,
  Loader2,
  MessageSquare,
  Package,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Star,
  Trash2,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { cn, getFileUrl } from "@/lib/utils"
import {
  useDeleteReviewMutation,
  useGetSellerCommentsQuery,
  useReplyToCommentMutation,
} from "@/lib/redux/service/sellerCommentApi"
import type { ReviewResponse } from "@/lib/types/review"
import { Button } from "@/components/ui/button"

function formatDate(value?: string | null): string {
  if (!value) return ""
  const parts = value.split("T")[0]?.split("-")
  if (parts && parts.length === 3) {
    const [year, month, day] = parts.map(Number)
    const date = new Date(year, month - 1, day)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }
  }
  return new Date(value).toLocaleDateString()
}

export function Comment() {
  const { data, isLoading, isError, refetch, isFetching } = useGetSellerCommentsQuery({
    page: 0,
    size: 50,
  })
  const [replyToComment, { isLoading: isReplying }] = useReplyToCommentMutation()
  const [deleteReview] = useDeleteReviewMutation()

  const [activeTab, setActiveTab] = React.useState<"all" | "unanswered" | "positive" | "critical">(
    "all",
  )
  const [searchQuery, setSearchQuery] = React.useState("")
  const [replyingReviewId, setReplyingReviewId] = React.useState<string | null>(null)
  const [replyText, setReplyText] = React.useState("")

  const reviewsList: ReviewResponse[] = data?.content || []

  // Filter & Sort reviews (Unanswered surface first by default)
  const filteredReviews = React.useMemo(() => {
    return reviewsList
      .filter((rev) => {
        // Tab filtering
        const hasReplies = Boolean(rev.replies && rev.replies.length > 0)
        if (activeTab === "unanswered" && hasReplies) return false
        if (activeTab === "positive" && (rev.rating || 0) < 4) return false
        if (activeTab === "critical" && (rev.rating || 0) > 3) return false

        // Search filtering
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase().trim()
        const buyer = (rev.buyer?.displayName || "").toLowerCase()
        const comment = (rev.comment || "").toLowerCase()
        const product = (rev.listing?.title || "").toLowerCase()
        return buyer.includes(q) || comment.includes(q) || product.includes(q)
      })
      .sort((a, b) => {
        // Unanswered first
        const aHasReply = Boolean(a.replies && a.replies.length > 0)
        const bHasReply = Boolean(b.replies && b.replies.length > 0)
        if (!aHasReply && bHasReply) return -1
        if (aHasReply && !bHasReply) return 1
        // Then by newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [reviewsList, activeTab, searchQuery])

  const unansweredCount = React.useMemo(() => {
    return reviewsList.filter((r) => !r.replies || r.replies.length === 0).length
  }, [reviewsList])

  const handleSendReply = async (reviewUuid: string) => {
    const text = replyText.trim()
    if (!text) {
      toast.error("Please enter a reply message")
      return
    }

    try {
      await replyToComment({ reviewUuid, comment: text }).unwrap()
      toast.success("Reply posted successfully!")
      setReplyingReviewId(null)
      setReplyText("")
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to post reply")
    }
  }

  const handleDeleteReview = async (reviewUuid: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return
    try {
      await deleteReview(reviewUuid).unwrap()
      toast.success("Review deleted")
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to delete review")
    }
  }

  return (
    <section className="min-h-[calc(100svh-70px)] bg-slate-50/70 p-4 sm:p-7 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Customer Reviews
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Read buyer feedback across all your products and reply directly as the shop owner.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-xl border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <RefreshCw className={cn("size-4 mr-1.5", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </header>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer",
              activeTab === "all"
                ? "bg-[#6C4CD8] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80",
            )}
          >
            All Reviews ({reviewsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("unanswered")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer",
              activeTab === "unanswered"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100",
            )}
          >
            Needs Reply
            {unansweredCount > 0 && (
              <span className="grid size-4 place-items-center rounded-full bg-amber-200 text-[10px] font-black text-amber-900">
                {unansweredCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("positive")}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer",
              activeTab === "positive"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80",
            )}
          >
            4–5 Stars
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("critical")}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer",
              activeTab === "critical"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80",
            )}
          >
            1–3 Stars
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by buyer or product..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-200/80 animate-pulse" />
          ))}
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((rev) => {
            const hasReply = Boolean(rev.replies && rev.replies.length > 0)
            const isReplyingThis = replyingReviewId === rev.uuid
            const photoUrl = rev.photo?.uri
              ? rev.photo.uri.startsWith("http") || rev.photo.uri.startsWith("/")
                ? rev.photo.uri
                : getFileUrl(rev.photo.uri)
              : null

            return (
              <article
                key={rev.uuid}
                className={cn(
                  "rounded-2xl border bg-white p-5 sm:p-6 shadow-xs space-y-4 transition-all",
                  !hasReply ? "border-amber-200 bg-amber-50/20" : "border-slate-200",
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Buyer & Review details */}
                  <div className="flex items-start gap-3.5">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                      {rev.buyer?.avatarUrl ? (
                        <Image
                          src={rev.buyer.avatarUrl}
                          alt={rev.buyer.displayName || "Buyer"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-[#6C4CD8] text-sm font-bold text-white">
                          {(rev.buyer?.displayName || "B").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-950">
                          {rev.buyer?.displayName || "Customer"}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < (rev.rating || 0)
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-slate-100 text-slate-200"
                              }
                            />
                          ))}
                        </div>
                        {rev.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="size-3" /> Verified Order
                          </span>
                        )}
                        {rev.isEdited && (
                          <span className="text-[10px] italic text-slate-400">(edited)</span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 font-medium">{formatDate(rev.createdAt)}</p>

                      {rev.comment && (
                        <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed pt-1">
                          {rev.comment}
                        </p>
                      )}

                      {/* Photo preview */}
                      {photoUrl && (
                        <div className="relative mt-2 size-20 overflow-hidden rounded-xl border border-slate-200">
                          <Image src={photoUrl} alt="Review attachment" fill className="object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product card tile */}
                  {rev.listing && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 sm:max-w-xs shrink-0">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-white border border-slate-200">
                        {rev.listing.thumbnailUrl ? (
                          <Image
                            src={
                              rev.listing.thumbnailUrl.startsWith("http") ||
                              rev.listing.thumbnailUrl.startsWith("/")
                                ? rev.listing.thumbnailUrl
                                : getFileUrl(rev.listing.thumbnailUrl)
                            }
                            alt={rev.listing.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-slate-400">
                            <Package className="size-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Product
                        </span>
                        {rev.listing.slug ? (
                          <Link
                            href={`/products/${rev.listing.slug}`}
                            target="_blank"
                            className="text-xs font-bold text-slate-900 hover:text-[#6C4CD8] line-clamp-1 flex items-center gap-1"
                          >
                            {rev.listing.title}
                            <ExternalLink className="size-2.5 text-slate-400" />
                          </Link>
                        ) : (
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">
                            {rev.listing.title}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Existing Replies */}
                {rev.replies && rev.replies.length > 0 && (
                  <div className="space-y-2 border-l-2 border-[#6C4CD8]/30 pl-4 ml-6 pt-1">
                    {rev.replies.map((reply, idx) => (
                      <div key={reply.uuid || idx} className="rounded-xl bg-purple-50/50 p-3 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[#6C4CD8]">
                          <CornerDownRight className="size-3.5" />
                          <span>Shop Owner Reply</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            • {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-800 pl-5 leading-relaxed">{reply.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Reply Composer */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  {isReplyingThis ? (
                    <div className="w-full space-y-2 pt-1">
                      <div className="flex items-center gap-2">
                        <CornerDownRight className="size-4 text-[#6C4CD8] shrink-0" />
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a polite response to this customer review..."
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#6C4CD8] focus:ring-2 focus:ring-[#6C4CD8]/20"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleSendReply(rev.uuid)
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          disabled={isReplying}
                          onClick={() => handleSendReply(rev.uuid)}
                          className="rounded-xl bg-[#6C4CD8] hover:bg-[#5B3DC0] text-xs font-bold text-white px-4 shrink-0"
                        >
                          {isReplying ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReplyingReviewId(null)
                            setReplyText("")
                          }}
                          className="rounded-xl text-xs text-slate-500"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingReviewId(rev.uuid)
                          setReplyText("")
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C4CD8] hover:text-[#5B3DC0] transition cursor-pointer"
                      >
                        <MessageSquare className="size-3.5" />
                        {hasReply ? "Add another reply" : "Reply to review"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev.uuid)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="Delete review"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs space-y-3">
          <div className="grid size-14 place-items-center rounded-2xl bg-purple-50 text-[#6C4CD8]">
            <MessageSquare className="size-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-950">No Reviews Found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {activeTab !== "all"
              ? "No reviews match your current filter selection."
              : "As customers purchase and review your products, their feedback will appear here."}
          </p>
        </div>
      )}
    </section>
  )
}
