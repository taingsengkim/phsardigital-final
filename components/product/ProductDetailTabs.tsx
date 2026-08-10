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
  /** Extra bullet points for the detail tab */
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
    { id: "detail", label: "Detail" },
    { id: "reviews", label: `Reviews (${reviews.length})` },
  ];

  return (
    <div className="mt-14">
      {/* tab strip */}
      <div className="flex gap-2 border-b-2 border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "relative top-[2px] mr-6 border-0 bg-transparent pb-3 pt-3 text-[14.5px] font-semibold transition-colors",
              active === tab.id
                ? "text-[#2a1c63]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {active === tab.id && (
              <span className="absolute bottom-[-2px] left-0 right-0 h-[2px] rounded-t bg-[#e8a33d]" />
            )}
          </button>
        ))}
      </div>

      {/* detail panel */}
      {active === "detail" && (
        <div className="max-w-[840px] py-6 text-[14.5px] leading-[1.75] text-[#443c58]">
          <p>{description}</p>

          {highlights.length > 0 && (
            <ul className="my-3 list-disc pl-5 space-y-1.5">
              {highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}

          {/* attributes as key/value pairs in the detail tab too */}
          {attributes && attributes.length > 0 && (
            <ul className="mt-4 list-none p-0 grid grid-cols-2 gap-x-6 gap-y-0">
              {attributes.map((attr) => (
                <li
                  key={attr.id}
                  className="border-b border-dashed border-border py-2 text-sm"
                >
                  <span className="font-semibold text-[#2a1c63]">
                    {attr.key}
                  </span>{" "}
                  — {attr.value}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* reviews panel */}
      {active === "reviews" && (
        <div className="max-w-[840px] py-6">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reviews yet — be the first!
            </p>
          ) : (
            <div>
              {reviews.map((review) => (
                <ReviewRow key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── single review row ── */

function ReviewRow({ review }: { review: Review }) {
  // We don't have the user name on the Review type; use a generated initial.
  const initial = String.fromCharCode(65 + (review.user_id % 26));

  return (
    <div className="flex gap-4 border-b border-border py-4 last:border-0">
      {/* avatar */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#efe9fb] font-serif font-bold text-[#3d2b87]"
        aria-hidden="true"
      >
        {initial}
      </div>

      {/* content */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13.5px] font-semibold text-foreground">
            User #{review.user_id}
          </span>
          <RatingStars rating={review.rating} size={12} />
        </div>
        <p className="mt-1.5 text-[13.5px] text-[#5b5470]">{review.body}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {new Date(review.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
