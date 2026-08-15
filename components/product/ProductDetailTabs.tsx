"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ListingAttribute } from "@/app/api/listings";

/* ── review types from Swagger ReviewResponse ── */
type ReviewBuyer = {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
};

type Review = {
  uuid: string;
  rating: number;
  comment?: string;
  buyer?: ReviewBuyer;
  isEdited?: boolean;
  createdAt: string;
};

type PagedReviews = {
  content: Review[];
  page: { totalElements: number; totalPages: number };
};

type Props = {
  description: string;
  attributes: ListingAttribute[];
  listingUuid: string;
};

type Tab = "detail" | "reviews";

/* ── fetch reviews client-side via /api/v1/reviews/listings/{uuid} ── */
async function fetchReviews(uuid: string, page = 0): Promise<PagedReviews> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "https://phsardigital.quizzy.it.com";
  const res = await fetch(
    `${base}/api/v1/reviews/listings/${uuid}?page=${page}&size=10`,
    { cache: "no-store" }
  );
  if (!res.ok) return { content: [], page: { totalElements: 0, totalPages: 0 } };
  return res.json();
}

export default function ProductDetailTabs({ description, attributes, listingUuid }: Props) {
  const [active, setActive] = useState<Tab>("detail");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal]     = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);

  /* load reviews when tab opened */
  useEffect(() => {
    if (active !== "reviews" || reviews.length > 0) return;
    setLoadingReviews(true);
    fetchReviews(listingUuid)
      .then((data) => {
        setReviews(data.content);
        setTotal(data.page.totalElements);
      })
      .finally(() => setLoadingReviews(false));
  }, [active, listingUuid, reviews.length]);

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const sortedAttrs = [...attributes].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mt-14">

      {/* tab strip */}
      <div className="flex gap-1 rounded-2xl bg-[#F0EDFB] p-1.5">
        {([
          { id: "detail",  label: "Product Details" },
          { id: "reviews", label: `Reviews (${total})` },
        ] as { id: Tab; label: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex-1 rounded-xl py-3 text-[16px] font-bold transition-all duration-200",
              active === tab.id
                ? "bg-white text-[#6C4CD8] shadow-sm"
                : "text-[#8B85A0] hover:text-[#6C4CD8]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── DETAIL ── */}
      {active === "detail" && (
        <div className="mt-8 max-w-[860px]">
          <p className="text-[17px] leading-[1.8] text-[#443C58]">
            {description || "No description provided."}
          </p>

          {sortedAttrs.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-4 text-[20px] font-bold text-[#1A1330]">Specifications</h3>
              <div className="overflow-hidden rounded-2xl border border-[#E2DFEC]">
                {sortedAttrs.map((attr, i) => (
                  <div
                    key={attr.uuid}
                    className={cn(
                      "grid grid-cols-2 px-6 py-4 text-[16px]",
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

      {/* ── REVIEWS ── */}
      {active === "reviews" && (
        <div className="mt-8 max-w-[860px]">
          {loadingReviews ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-24 animate-pulse rounded-2xl bg-[#F0EDFB]" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-[#F6F5FA] py-16 text-center">
              <MessageSquare size={36} className="text-[#C4B5FD]" />
              <p className="text-[18px] font-semibold text-[#8B85A0]">No reviews yet</p>
              <p className="text-[15px] text-[#B3ADC4]">Be the first to review this product</p>
            </div>
          ) : (
            <>
              {/* summary */}
              <div className="mb-8 flex flex-col gap-6 rounded-2xl bg-[#F6F5FA] px-8 py-6 sm:flex-row sm:items-center">
                <div className="flex flex-col items-center text-center sm:min-w-[100px]">
                  <p className="text-[56px] font-black leading-none text-[#6C4CD8]">
                    {avg.toFixed(1)}
                  </p>
                  <StarRow rating={avg} size={18} />
                  <p className="mt-1.5 text-[14px] text-[#8B85A0]">{total} reviews</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
                    const pct   = reviews.length ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="w-3 text-right text-[13px] text-[#8B85A0]">{star}</span>
                        <Star size={12} fill="#F5B301" className="text-[#F5B301]" />
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E2DFEC]">
                          <div
                            className="h-full rounded-full bg-[#F5B301] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-6 text-[13px] text-[#8B85A0]">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* individual reviews */}
              <div className="space-y-4">
                {reviews.map((r) => (
                  <ReviewCard key={r.uuid} review={r} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < Math.round(rating) ? "#F5B301" : "none"}
          className={i < Math.round(rating) ? "text-[#F5B301]" : "text-[#D9D4E8]"}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const name = review.buyer
    ? `${review.buyer.firstName ?? ""} ${review.buyer.lastName ?? ""}`.trim() ||
      review.buyer.username ||
      "Anonymous"
    : "Anonymous";

  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-[0_1px_6px_rgba(36,31,53,0.07)]">
      {/* avatar */}
      {review.buyer?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={review.buyer.avatarUrl}
          alt={name}
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8267E8] to-[#6C4CD8] text-[18px] font-bold text-white">
          {initial}
        </div>
      )}

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[16px] font-bold text-[#1A1330]">{name}</span>
          <StarRow rating={review.rating} size={13} />
          {review.isEdited && (
            <span className="text-[12px] text-[#B3ADC4]">(edited)</span>
          )}
          <span className="text-[13px] text-[#8B85A0]">
            {new Date(review.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "short", day: "numeric",
            })}
          </span>
        </div>
        {review.comment && (
          <p className="mt-2 text-[15px] leading-relaxed text-[#5A5470]">
            {review.comment}
          </p>
        )}
      </div>
    </div>
  );
}
