"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import {
  CornerDownRight,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Truck,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import RatingStars from "@/components/product/RatingStars";
import type {
  ApiListingAttribute,
  ApiReview,
  ApiReviewReply,
  ReviewSummary,
} from "@/lib/types";
import { useCreateProductReviewMutation } from "@/lib/redux/service/sellerCommentApi";

type Tab = "details" | "reviews" | "shipping";

type Props = {
  listingUuid: string;
  description?: string | null;
  attributes?: ApiListingAttribute[] | null;
  reviews?: ApiReview[];
  reviewSummary: ReviewSummary;
  sellerName?: string | null;
  storeCity?: string | null;
};

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProductDetailTabs({
  listingUuid,
  description,
  attributes,
  reviews = [],
  reviewSummary,
  sellerName,
  storeCity,
}: Props) {
  const [active, setActive] = useState<Tab>("details");
  const [submittedReviews, setSubmittedReviews] = useState<ApiReview[]>([]);
  const shownReviews = [...submittedReviews, ...reviews];
  const shownSummary = useMemo<ReviewSummary>(() => {
    if (!submittedReviews.length) return reviewSummary;
    const ratings = submittedReviews
      .map((review) => Number(review.rating))
      .filter((rating) => rating >= 1 && rating <= 5);
    const previousTotal = reviewSummary.total;
    const previousSum = (reviewSummary.average ?? 0) * previousTotal;
    const total = previousTotal + ratings.length;
    const breakdown = { ...reviewSummary.breakdown };
    ratings.forEach((rating) => {
      const star = Math.round(rating);
      breakdown[star] = (breakdown[star] ?? 0) + 1;
    });
    return {
      total,
      average: total ? (previousSum + ratings.reduce((sum, rating) => sum + rating, 0)) / total : null,
      breakdown,
    };
  }, [reviewSummary, submittedReviews]);

  const sortedAttributes = [...(attributes ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "details", label: "Product details" },
    { id: "reviews", label: `Reviews${shownSummary.total ? ` (${shownSummary.total})` : ""}` },
    { id: "shipping", label: "Shipping & returns" },
  ];

  return (
    <div id="details" className="mt-14 scroll-mt-24 font-sans">
      {/* ── tab strip ── */}
      <div className="flex gap-1 rounded-2xl bg-[#F0EDFB] p-1.5" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex-1 rounded-xl px-2 py-3 text-[15px] font-bold transition-all duration-200 sm:text-[16px]",
              active === tab.id
                ? "bg-white text-[#6C4CD8] shadow-sm"
                : "text-[#8B85A0] hover:text-[#6C4CD8]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── details ── */}
      {active === "details" && (
        <div className="mt-8 max-w-[860px]">
          <p className="whitespace-pre-line text-[17px] leading-[1.8] text-[#443c58]">
            {description?.trim() || "The seller has not written a description for this product yet."}
          </p>

          {sortedAttributes.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-[20px] font-bold text-[#1A1330]">
                Specifications
              </h3>
              <div className="overflow-hidden rounded-2xl border border-[#E2DFEC]">
                {sortedAttributes.map((attr, i) => (
                  <div
                    key={attr.uuid ?? `${attr.key}-${i}`}
                    className={cn(
                      "grid grid-cols-[minmax(120px,1fr)_2fr] gap-4 px-6 py-4 text-[16px]",
                      i % 2 === 0 ? "bg-white" : "bg-[#F8F6FD]"
                    )}
                  >
                    <span className="font-semibold text-[#1A1330]">{attr.key}</span>
                    <span className="text-[#5A5470]">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── reviews ── */}
      {active === "reviews" && (
        <div id="reviews" className="mt-8 max-w-[860px] scroll-mt-24">
          <ReviewForm
            listingUuid={listingUuid}
            onCreated={(review) => setSubmittedReviews((current) => [review, ...current])}
          />
          {shownReviews.length === 0 ? (
            <EmptyReviews />
          ) : (
            <>
              <ReviewSummaryCard summary={shownSummary} />
              <div className="space-y-5">
                {shownReviews.map((review, index) => (
                  <ReviewRow
                    key={review.uuid ?? index}
                    review={review}
                    sellerName={sellerName}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── shipping ── */}
      {active === "shipping" && (
        <div className="mt-8 grid max-w-[860px] gap-4 sm:grid-cols-2">
          <PolicyCard
            Icon={Truck}
            title="Delivery"
            lines={[
              storeCity
                ? `Ships from ${storeCity}`
                : "Ships from the seller's location",
              "Phnom Penh: 1–2 business days",
              "Provinces: 2–5 business days via partner courier",
            ]}
          />
          <PolicyCard
            Icon={MapPin}
            title="Pickup"
            lines={[
              "Self-pickup available at the store address",
              "Confirm availability with the seller before travelling",
            ]}
          />
          <PolicyCard
            Icon={RotateCcw}
            title="Returns"
            lines={[
              "7 days to report a damaged or incorrect item",
              "Keep the original packaging and unboxing photos",
              "Return shipping is covered when the seller is at fault",
            ]}
          />
          <PolicyCard
            Icon={ShieldCheck}
            title="Buyer protection"
            lines={[
              "Payment is released to the seller after delivery",
              "Keep all chat and payment on Phsar Digital",
              "Report an issue from your orders page",
            ]}
          />
        </div>
      )}
    </div>
  );
}

/* ── pieces ─────────────────────────────────────────────────────────────── */

function EmptyReviews() {
  return (
    <div className="rounded-2xl bg-[#F6F5FA] py-14 text-center">
      <p className="text-[18px] font-semibold text-[#8B85A0]">No reviews yet</p>
      <p className="mt-1 text-[15px] text-[#B3ADC4]">
        Buy this product and be the first to share your experience.
      </p>
    </div>
  );
}

function getMutationError(error: unknown): string {
  const value = error as { status?: number; data?: { message?: string; error?: string } };
  if (value?.status === 401) return "Please sign in before writing a review.";
  if (value?.status === 403) return "Only buyers who purchased this product can review it.";
  return value?.data?.message || value?.data?.error || "We could not submit your review. Please try again.";
}

function ReviewForm({
  listingUuid,
  onCreated,
}: {
  listingUuid: string;
  onCreated: (review: ApiReview) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [createReview, { isLoading }] = useCreateProductReviewMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rating) {
      setMessage("Choose a star rating first.");
      return;
    }
    setMessage(null);
    try {
      const review = await createReview({
        listingUuid,
        rating,
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      }).unwrap();
      onCreated(review);
      setRating(0);
      setComment("");
      setMessage("Your review was posted.");
    } catch (error) {
      setMessage(getMutationError(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-[#E2DFEC] bg-white p-5 sm:p-6">
      <h3 className="text-[19px] font-bold text-[#1A1330]">Review this product</h3>
      <p className="mt-1 text-[14px] text-[#8B85A0]">Share your experience to help other shoppers.</p>
      <fieldset className="mt-5">
        <legend className="mb-2 text-[14px] font-semibold text-[#443C58]">Your rating</legend>
        <div className="flex gap-1" onMouseLeave={() => setHoveredRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
              onMouseEnter={() => setHoveredRating(star)}
              onFocus={() => setHoveredRating(star)}
              onBlur={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4CD8]"
            >
              <Star
                size={28}
                className={star <= (hoveredRating || rating) ? "text-[#F5B301]" : "text-[#D7D2E3]"}
                fill="currentColor"
              />
            </button>
          ))}
        </div>
      </fieldset>
      <label className="mt-4 block text-[14px] font-semibold text-[#443C58]" htmlFor="product-review-comment">
        Comment <span className="font-normal text-[#8B85A0]">(optional)</span>
      </label>
      <textarea
        id="product-review-comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={4}
        maxLength={1000}
        placeholder="What did you like or dislike about this product?"
        className="mt-2 w-full resize-y rounded-xl border border-[#DCD8E8] px-4 py-3 text-[15px] text-[#1A1330] outline-none placeholder:text-[#AAA4BA] focus:border-[#6C4CD8] focus:ring-2 focus:ring-[#6C4CD8]/15"
      />
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-[#6C4CD8] px-6 py-3 text-[15px] font-bold text-white transition hover:bg-[#5E3FC9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Posting..." : "Post review"}
        </button>
        {message && (
          <p role="status" className={cn("text-[14px]", message === "Your review was posted." ? "text-emerald-600" : "text-red-600")}>{message}</p>
        )}
      </div>
    </form>
  );
}

function ReviewSummaryCard({ summary }: { summary: ReviewSummary }) {
  const { average, total, breakdown } = summary;

  // `total` is the server-wide count; the bars only describe the reviews on
  // this page, so scale them against that subset rather than the grand total.
  const graphed = Object.values(breakdown).reduce((sum, c) => sum + c, 0);

  return (
    <div className="mb-8 flex flex-col items-center gap-8 rounded-2xl bg-[#F6F5FA] px-8 py-6 sm:flex-row">
      <div className="text-center">
        <p className="text-[54px] font-black leading-none text-[#6C4CD8]">
          {average !== null ? average.toFixed(1) : "—"}
        </p>
        {average !== null && (
          <RatingStars rating={average} size={20} className="mt-2 justify-center" />
        )}
        <p className="mt-1.5 text-[14px] text-[#8B85A0]">
          {total} {total === 1 ? "review" : "reviews"}
        </p>
        {graphed < total && (
          <p className="mt-0.5 text-[13px] text-[#B3ADC4]">
            Breakdown covers the {graphed} shown
          </p>
        )}
      </div>

      <div className="w-full flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = breakdown[star] ?? 0;
          const pct = graphed ? (count / graphed) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="w-4 text-right text-[14px] text-[#8B85A0]">{star}</span>
              <span className="text-[#F5B301]">★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E2DFEC]">
                <div
                  className="h-full rounded-full bg-[#F5B301] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-[13px] text-[#8B85A0]">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewRow({
  review,
  sellerName,
}: {
  review: ApiReview;
  sellerName?: string | null;
}) {
  const buyerName = review.buyer?.displayName?.trim() || "Verified buyer";
  const initial = buyerName.charAt(0).toUpperCase();
  const date = formatDate(review.createdAt);
  const photoUri = review.photo?.uri;
  const replies = review.replies ?? [];

  return (
    <article className="rounded-2xl bg-white p-5 shadow-[0_1px_6px_rgba(36,31,53,0.07)]">
      <div className="flex gap-4">
        {review.buyer?.avatarUrl ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
            <Image
              src={review.buyer.avatarUrl}
              alt=""
              fill
              unoptimized
              sizes="48px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8267E8] to-[#6C4CD8] text-[18px] font-bold text-white">
            {initial}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[16px] font-bold text-[#1A1330]">{buyerName}</span>
            <RatingStars rating={review.rating ?? 0} size={14} />
            {date && <span className="text-[13px] text-[#8B85A0]">{date}</span>}
            {review.isEdited && (
              <span className="text-[12px] italic text-[#B3ADC4]">edited</span>
            )}
          </div>

          {review.comment && (
            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-[#5A5470]">
              {review.comment}
            </p>
          )}

          {photoUri && (
            <div className="relative mt-3 h-28 w-28 overflow-hidden rounded-xl border border-[#E2DFEC]">
              <Image
                src={photoUri}
                alt="Photo from the review"
                fill
                unoptimized
                sizes="112px"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="mt-4 space-y-3 border-l-2 border-[#F0EDFB] pl-4 sm:ml-16">
          {replies.map((reply, i) => (
            <SellerReply
              key={reply.uuid ?? i}
              reply={reply}
              sellerName={sellerName}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function SellerReply({
  reply,
  sellerName,
}: {
  reply: ApiReviewReply;
  sellerName?: string | null;
}) {
  const name = reply.seller?.businessName?.trim() || sellerName || "Seller";
  const date = formatDate(reply.createdAt);

  return (
    <div className="rounded-xl bg-[#FAF9FD] px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <CornerDownRight size={13} className="text-[#6C4CD8]" />
        <span className="text-[14px] font-bold text-[#1A1330]">{name}</span>
        <span className="rounded-full bg-[#F1EFFA] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#6C4CD8]">
          Seller
        </span>
        {date && <span className="text-[12px] text-[#8B85A0]">{date}</span>}
      </div>
      {reply.comment && (
        <p className="mt-1.5 text-[14px] leading-relaxed text-[#5A5470]">
          {reply.comment}
        </p>
      )}

      {(reply.childReplies ?? []).length > 0 && (
        <div className="mt-3 space-y-3 border-l-2 border-[#EFEBFA] pl-3">
          {(reply.childReplies ?? []).map((child, i) => (
            <SellerReply key={child.uuid ?? i} reply={child} sellerName={sellerName} />
          ))}
        </div>
      )}
    </div>
  );
}

function PolicyCard({
  Icon,
  title,
  lines,
}: {
  Icon: typeof Truck;
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-2xl border border-[#E2DFEC] bg-white p-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1EFFA]">
          <Icon size={16} className="text-[#6C4CD8]" />
        </div>
        <h3 className="text-[17px] font-bold text-[#1A1330]">{title}</h3>
      </div>
      <ul className="mt-4 space-y-2">
        {lines.map((line) => (
          <li
            key={line}
            className="flex items-start gap-2.5 text-[15px] leading-relaxed text-[#5A5470]"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C4B5FD]" />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
