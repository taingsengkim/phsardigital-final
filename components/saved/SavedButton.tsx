"use client";

import { useState } from "react";
import { HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { saveListings, unsaveListing } from "@/app/api/savedListings";

type Props = {
  listingId: number | string;
  /** Whether the item is already saved (pass from parent/server) */
  initialSaved?: boolean;
  className?: string;
};

export default function SavedButton({
  listingId,
  initialSaved = false,
  className,
}: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      if (saved) {
        await unsaveListing(listingId);
      } else {
        await saveListings(listingId);
      }
      setSaved((prev) => !prev);
    } catch {
      // silently ignore — user can retry
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
