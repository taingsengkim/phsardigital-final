"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import RatingStars from "@/components/product/RatingStars";
import type { Review, ListingAttribute } from "@/lib/types";

type Tab = "detail" | "reviews";

type Props = {
  description: string;
  attributes?: ListingAttribute[];
  reviews?: Review[];
  highlights?: string[];
};

export default function ProductDetailTabs({
  description,
  attributes,
  reviews = [],
  highlights = [],
}: Props) {
  const [active, setActive] = useState<Tab>("detail");

  const tabs: { id: Tab; label: string }[] = [
    { id: "detail",  label: "Product Details" },
    { id: "reviews", label: `Reviews (${reviews.length})` },
  ];

  /* average */
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="mt-14">

      {/* ── tab strip ── */}
      <div className="flex gap-1 rounded-2xl bg-[#F0EDFB] p-1.5">
        {tabs.map((tab) => (
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

      {/* ── detail panel ── */}
      {active === "detail" && (
        <div className="mt-8 max-w-[860px]">
          <p className="text-[17px] leading-[1.8] text-[#443c58]">{description}</p>

          {highlights.length > 0 && (
            <ul className="mt-5 space-y-2.5">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-[16px] text-[#443c58]">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#6C4CD8]" />
                  {h}
                </li>
              ))}
            </ul>
          )}

          {attributes && attributes.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-[20px] font-bold text-[#1A1330]">Specifications</h3>
              <div className="overflow-hidden rounded-2xl border border-[#E2DFEC]">
                {attributes.map((attr, i) => (
                  <div
                    key={attr.id}
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

      {/* ── reviews panel ── */}
      {active === "reviews" && (
        <div className="mt-8 max-w-[860px]">
          {reviews.length === 0 ? (
            <div className="rounded-2xl bg-[#F6F5FA] py-14 text-center">
              <p className="text-[18px] font-semibold text-[#8B85A0]">No reviews yet</p>
              <p className="mt-1 text-[15px] text-[#B3ADC4]">Be the first to review this product</p>
            </div>
          ) : (
            <>
              {/* summary card */}
              <div className="mb-8 flex items-center gap-8 rounded-2xl bg-[#F6F5FA] px-8 py-6">
                <div className="text-center">
                  <p className="text-[54px] font-black leading-none text-[#6C4CD8]">
                    {avg.toFixed(1)}
                  </p>
                  <RatingStars rating={avg} size={20} className="mt-2 justify-center" />
                  <p className="mt-1.5 text-[14px] text-[#8B85A0]">{reviews.length} reviews</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
                    const pct   = reviews.length ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="w-4 text-right text-[14px] text-[#8B85A0]">{star}</span>
                        <span className="text-[#F5B301]">★</span>
                        <div className="flex-1 overflow-hidden rounded-full bg-[#E2DFEC] h-2">
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

              {/* individual reviews */}
              <div className="space-y-5">
                {reviews.map((review) => (
                  <ReviewRow key={review.id} review={review} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewRow({ review }: { review: Review }) {
  const initial = String.fromCharCode(65 + (review.user_id % 26));

  return (
    <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-[0_1px_6px_rgba(36,31,53,0.07)]">
      {/* avatar */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8267E8] to-[#6C4CD8] text-[18px] font-bold text-white">
        {initial}
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[16px] font-bold text-[#1A1330]">
            User #{review.user_id}
          </span>
          <RatingStars rating={review.rating} size={14} />
          <span className="text-[13px] text-[#8B85A0]">
            {new Date(review.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <p className="mt-2 text-[15px] leading-relaxed text-[#5A5470]">{review.body}</p>
      </div>
    </div>
  );
}
