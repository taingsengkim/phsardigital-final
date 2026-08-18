"use client";

import { useState } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAccessToken, redirectToLogin } from "@/lib/api";

type Props = {
  listingUuid: string;
  className?: string;
  size?: "sm" | "md";
};

type State = "idle" | "adding" | "added" | "error";

export default function AddToCartButton({
  listingUuid,
  className,
  size = "md",
}: Props) {
  const [state, setState] = useState<State>("idle");

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const token = getAccessToken();
    if (!token) { redirectToLogin(); return; }

    setState("adding");
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "https://phsardigital.quizzy.it.com";

      /* POST /api/v1/carts/items */
      const res = await fetch(`${base}/api/v1/carts/items`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ listingUuid, quantity: 1 }),
      });

      if (!res.ok) throw new Error(`${res.status}`);

      setState("added");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  const sm = size === "sm";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "adding"}
      aria-label="Add to cart"
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl font-bold text-white shadow-md transition-all disabled:opacity-70",
        sm ? "px-3 py-2 text-[13px]" : "px-5 py-3 text-[15px]",
        state === "added"
          ? "bg-emerald-500 hover:bg-emerald-600"
          : state === "error"
          ? "bg-red-500 hover:bg-red-600"
          : "bg-[#6C4CD8] hover:bg-[#5B3DC0] hover:shadow-lg",
        className
      )}
    >
      {state === "adding" && <Loader2      size={sm ? 13 : 15} className="animate-spin" />}
      {state === "added"  && <Check        size={sm ? 13 : 15} />}
      {state === "idle"   && <ShoppingCart size={sm ? 13 : 15} />}
      {state === "error"  && <ShoppingCart size={sm ? 13 : 15} />}

      {state === "adding" ? "Adding…"
        : state === "added"  ? "Added ✓"
        : state === "error"  ? "Try again"
        : "Add to Cart"}
    </button>
  );
}
