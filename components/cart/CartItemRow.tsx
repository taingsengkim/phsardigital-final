"use client";

import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { updateCartItem, removeCartItem } from "@/lib/api/cart";
import { useState } from "react";

type Props = {
  item: CartItem;
  onUpdate: () => void; // refetch cart after mutation
};

export default function CartItemRow({ item, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const listing = item.listing;
  const image = listing?.images?.find((i) => i.is_primary) ?? listing?.images?.[0];

  async function changeQty(delta: number) {
    const next = item.quantity + delta;
    setLoading(true);
    try {
      if (next <= 0) {
        await removeCartItem(item.id);
      } else {
        await updateCartItem(item.id, next);
      }
      onUpdate();
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    setLoading(true);
    try {
      await removeCartItem(item.id);
      onUpdate();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-start gap-4 py-4 border-b last:border-0">
      {/* thumbnail */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt_text ?? listing?.title ?? ""}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </div>

      {/* details */}
      <div className="flex-1 min-w-0">
        {listing && (
          <Link
            href={`/products/${listing.slug}`}
            className="text-sm font-medium line-clamp-2 hover:underline"
          >
            {listing.title}
          </Link>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          ${listing?.price.toFixed(2)} each
        </p>

        {/* quantity controls */}
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => changeQty(-1)}
            disabled={loading}
            aria-label="Decrease quantity"
          >
            <MinusIcon size={12} />
          </Button>
          <span className="w-6 text-center text-sm font-medium">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => changeQty(1)}
            disabled={loading}
            aria-label="Increase quantity"
          >
            <PlusIcon size={12} />
          </Button>
        </div>
      </div>

      {/* subtotal + remove */}
      <div className="flex flex-col items-end gap-2">
        <p className="text-sm font-semibold">
          ${((listing?.price ?? 0) * item.quantity).toFixed(2)}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={remove}
          disabled={loading}
          aria-label="Remove item"
        >
          <Trash2Icon size={14} />
        </Button>
      </div>
    </div>
  );
}
