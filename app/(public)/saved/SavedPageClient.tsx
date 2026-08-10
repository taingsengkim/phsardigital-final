"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/product/ProductGrid";
import { getSavedListings } from "@/app/api/savedListings";
import type { Listing } from "@/lib/types";

export default function SavedPageClient() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedListings()
      .then((saved) =>
        setListings(saved.map((s) => s.listing).filter(Boolean) as Listing[])
      )
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Loading saved items…
      </p>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-muted-foreground">
        <HeartIcon size={48} className="opacity-30" />
        <p className="text-sm">You haven&apos;t saved anything yet.</p>
        <Button asChild variant="outline">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return <ProductGrid listings={listings} />;
}
