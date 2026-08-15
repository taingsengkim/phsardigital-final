"use client";

import { useState } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { addToCart } from "@/app/api/cart";

type Props = {
  listingUuid: string;
  className?: string;
  size?: "sm" | "md";
};

export default function AddToCartButton({ listingUuid, className, size = "md" }: Props) {
  const [state, setState] = useState<"idle" | "adding" | "added" | "error">("idle");

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    /* redirect to login if no token */
    if (typeof window !== "undefined" && !sessionStorage.getItem("kc_access_token")) {
      window.location.href = "/auth/login";
      return;
    }

    setState("adding");
    try {
      await addToCart(listingUuid, 1);
      setState("added");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  const isSmall = size === "sm";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "adding"}
      aria-label="Add to cart"
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl font-bold text-white shadow-md transition-all",
        isSmall ? "px-3 py-2 text-[13px]" : "px-5 py-2.5 text-[14px]",
        state === "added"
          ? "bg-emerald-500 hover:bg-emerald-600"
          : state === "error"
          ? "bg-red-500 hover:bg-red-600"
          : "bg-[#6C4CD8] hover:bg-[#5B3DC0] hover:shadow-lg",
        "disabled:opacity-70",
        className
      )}
    >
      {state === "adding" && <Loader2 size={isSmall ? 13 : 15} className="animate-spin" />}
      {state === "added"  && <Check   size={isSmall ? 13 : 15} />}
      {state === "error"  && <span className="text-[11px]">Failed</span>}
      {state === "idle"   && <ShoppingCart size={isSmall ? 13 : 15} />}

      {state === "adding" ? "Adding…"
        : state === "added" ? "Added ✓"
        : state === "error" ? "Try again"
        : "Add to Cart"}
    </button>
  );
}
