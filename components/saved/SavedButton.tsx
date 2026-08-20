"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAccessToken, redirectToLogin } from "@/lib/api";

type Props = {
<<<<<<< HEAD
  listingId: string | number;
=======
  listingId: number | string;
  /** Whether the item is already saved (pass from parent/server) */
>>>>>>> origin/main
  initialSaved?: boolean;
  className?: string;
};

export default function SavedButton({
  listingId,
  initialSaved = false,
  className,
}: Props) {
  const [saved,   setSaved]   = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const token = getAccessToken();
    if (!token) { redirectToLogin(); return; }

    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "https://phsardigital.quizzy.it.com";
      const headers = {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      };

      if (saved) {
        /* DELETE /api/v1/favorites  — body: [uuid] */
        const res = await fetch(`${base}/api/v1/favorites`, {
          method: "DELETE",
          headers,
          body: JSON.stringify([listingId]),
        });
        if (!res.ok && res.status !== 204) throw new Error(`${res.status}`);
      } else {
        /* POST /api/v1/favorites/{listingUuid} */
        const res = await fetch(`${base}/api/v1/favorites/${listingId}`, {
          method: "POST",
          headers,
        });
        if (!res.ok) throw new Error(`${res.status}`);
      }

      setSaved((s) => !s);
    } catch {
      /* silent — button stays in previous state */
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
      disabled={loading}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all disabled:opacity-50",
        saved
          ? "bg-[#6C4CD8] hover:bg-[#5B3DC0]"
          : "bg-white/95 hover:bg-[#F1EFFA]",
        className
      )}
    >
      <Heart
        size={16}
        className={cn(
          "transition-colors",
          saved ? "fill-white text-white" : "text-[#6C4CD8]"
        )}
      />
    </button>
  );
}
