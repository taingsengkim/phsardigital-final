"use client";

import { useEffect, useState } from "react";
import { HeartIcon } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { addFavorite, removeFavorites } from "@/app/api/favorites";

type Props = {
  listingId: number | string;
  /** Whether the item is already saved (pass from parent/server) */
  initialSaved?: boolean;
  onToggle?: (isSaved: boolean) => void;
  className?: string;
};

export default function SavedButton({
  listingId,
  initialSaved = false,
  onToggle,
  className,
}: Props) {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);

  const [saved, setSaved] = useState(Boolean(initialSaved));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSaved(Boolean(initialSaved));
  }, [initialSaved]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      await authClient.signIn.oauth2({
        providerId: "keycloak",
        callbackURL: typeof window !== "undefined" ? window.location.href : "/",
      });
      return;
    }

    const uuid = String(listingId);
    if (!uuid) return;

    const nextState = !saved;
    setSaved(nextState);
    onToggle?.(nextState);
    setLoading(true);

    try {
      if (nextState) {
        // Add to favorite: POST /api/v1/favorites/{listingUuid}
        const ok = await addFavorite(uuid);
        if (!ok) {
          setSaved(saved);
          onToggle?.(saved);
        }
      } else {
        // Remove from favorite: DELETE /api/v1/favorites with body ["uuid"]
        const ok = await removeFavorites([uuid]);
        if (!ok) {
          setSaved(saved);
          onToggle?.(saved);
        }
      }
    } catch {
      setSaved(saved);
      onToggle?.(saved);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      className={cn(
        "group/heart relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full transition-all duration-300 active:scale-90 disabled:opacity-50",
        saved
          ? "bg-[#F1EFFA] dark:bg-purple-950/60 border border-[#E4DEFA] dark:border-purple-800/60 shadow-[0_3px_12px_rgba(108,76,216,0.25)] hover:bg-[#E8E3FA] hover:scale-105"
          : "bg-white/90 dark:bg-zinc-900/90 border border-slate-200/70 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-md hover:bg-white hover:border-[#6C4CD8]/40 hover:scale-105 hover:shadow-md",
        className
      )}
    >
      <HeartIcon
        size={16}
        className={cn(
          "transition-all duration-300",
          saved
            ? "fill-[#6C4CD8] text-[#6C4CD8] drop-shadow-[0_2px_4px_rgba(108,76,216,0.35)] scale-105"
            : "text-gray-400 dark:text-zinc-400 group-hover/heart:text-[#6C4CD8] group-hover/heart:scale-110"
        )}
      />
    </button>
  );
}
