"use client";

import { useEffect, useState } from "react";
import { HeartIcon } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
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
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      className={cn("rounded-full bg-background/80 backdrop-blur-sm", className)}
    >
      <HeartIcon
        size={18}
        className={cn(
          "transition-colors",
          saved ? "fill-red-500 text-red-500" : "text-muted-foreground"
        )}
      />
    </Button>
  );
}
