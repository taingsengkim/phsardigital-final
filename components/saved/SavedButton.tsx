"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  listingId: number | string;
  initialSaved?: boolean;
  className?: string;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("kc_access_token");
}

export default function SavedButton({ listingId, initialSaved = false, className }: Props) {
  const [saved,   setSaved]   = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const token = getToken();
    if (!token) {
      // not logged in — redirect to login
      window.location.href = "/auth/login";
      return;
    }

    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "https://phsardigital.quizzy.it.com";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      };

      if (saved) {
        await fetch(`${base}/api/v1/favorites`, {
          method: "DELETE",
          headers,
          body: JSON.stringify([listingId]),
        });
      } else {
        await fetch(`${base}/api/v1/favorites/${listingId}`, {
          method: "POST",
          headers,
        });
      }
      setSaved((s) => !s);
    } catch {
      // silently ignore network errors
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
      disabled={loading}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all disabled:opacity-50",
        saved ? "bg-[#6C4CD8] hover:bg-[#5B3DC0]" : "bg-white/95 hover:bg-[#F1EFFA]",
        className
      )}
    >
      <Heart
        size={16}
        className={cn("transition-colors", saved ? "fill-white text-white" : "text-[#6C4CD8]")}
      />
    </button>
  );
}
