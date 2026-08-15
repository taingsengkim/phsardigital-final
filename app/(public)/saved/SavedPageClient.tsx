"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react";
import { clientFetch } from "@/lib/api";
import { addToCart } from "@/app/api/cart";

/* ── types matching real API ListingResponse ── */
type FavListing = {
  uuid: string;
  slug: string;
  title: string;
  price: number;
  stockQty: number;
  status: string;
  isFeatured: boolean;
  sold: number;
  thumbnailUri?: { uuid: string; objectName: string; uri: string };
  images?: { uuid: string; uri: string; isPrimary: boolean; sortOrder: number }[];
  category?: { name: string; slug: string };
  sellerProfile?: { sellerId: string; businessName?: string };
};

type PagedFavorites = {
  content: FavListing[];
  page: { totalElements: number; totalPages: number; number: number; size: number };
};

function usd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/* ── single card ── */
function FavCard({
  listing,
  onRemove,
}: {
  listing: FavListing;
  onRemove: (uuid: string) => void;
}) {
  const imgSrc =
    listing.images?.find((i) => i.isPrimary)?.uri ??
    listing.images?.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.uri ??
    listing.thumbnailUri?.uri;

  const [removing,   setRemoving]   = useState(false);
  const [cartState,  setCartState]  = useState<"idle" | "adding" | "added">("idle");

  async function remove() {
    setRemoving(true);
    try {
      await clientFetch("/api/v1/favorites", {
        method: "DELETE",
        body: JSON.stringify([listing.uuid]),
      });
      onRemove(listing.uuid);
    } catch {
      setRemoving(false);
    }
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!sessionStorage.getItem("kc_access_token")) {
      window.location.href = "/auth/login";
      return;
    }
    setCartState("adding");
    try {
      await addToCart(listing.uuid, 1);
      setCartState("added");
      setTimeout(() => setCartState("idle"), 2500);
    } catch {
      setCartState("idle");
    }
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(36,31,53,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(108,76,216,0.18)]">

      {/* image */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F3FA]">
        <Link href={`/products/${listing.slug}`}>
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={listing.title}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              unoptimized={imgSrc.startsWith("http://")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#C4B5FD]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-12 w-12">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
        </Link>

        {/* remove wishlist */}
        <button
          onClick={remove}
          disabled={removing}
          aria-label="Remove from wishlist"
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#6C4CD8] shadow-md transition hover:bg-[#5B3DC0] disabled:opacity-50"
        >
          <Trash2 size={14} className="text-white" />
        </button>

        {/* out of stock overlay */}
        {listing.stockQty === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-lg bg-white/90 px-3 py-1.5 text-[13px] font-bold text-[#1A1330]">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={`/products/${listing.slug}`}
          className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#241F35] hover:text-[#6C4CD8] transition-colors"
        >
          {listing.title}
        </Link>

        {/* category */}
        {listing.category && (
          <span className="inline-flex w-fit rounded-full bg-[#F0EDFB] px-2.5 py-0.5 text-[11px] font-semibold text-[#6C4CD8]">
            {listing.category.name}
          </span>
        )}

        {/* stars + sold */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={11} fill="#F5B301" color="#F5B301" />
          ))}
          {listing.sold > 0 && (
            <span className="ml-1.5 text-[11px] text-[#8B85A0]">{listing.sold} sold</span>
          )}
        </div>

        {/* seller */}
        {listing.sellerProfile?.businessName && (
          <p className="text-[12px] text-[#8B85A0]">{listing.sellerProfile.businessName}</p>
        )}

        {/* price + add to cart */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-[18px] font-extrabold text-[#6C4CD8]">
            {usd(listing.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={cartState === "adding" || listing.stockQty === 0}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-bold text-white transition disabled:opacity-50 ${
              cartState === "added" ? "bg-emerald-500" : "bg-[#6C4CD8] hover:bg-[#5B3DC0]"
            }`}
          >
            <ShoppingCart size={13} />
            {cartState === "adding" ? "…" : cartState === "added" ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── skeleton ── */
function Skeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="aspect-square w-full animate-pulse bg-[#F0EDFB]" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#F0EDFB]" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-[#F0EDFB]" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-[#F0EDFB]" />
      </div>
    </div>
  );
}

/* ── page ── */
export default function SavedPageClient() {
  const [listings,    setListings]    = useState<FavListing[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("kc_access_token");
    const exp   = Number(sessionStorage.getItem("kc_expires_at") ?? "0");

    if (!token || Date.now() >= exp) {
      setNotLoggedIn(true);
      setLoading(false);
      return;
    }

    clientFetch<PagedFavorites>("/api/v1/favorites?page=0&size=40")
      .then((data) => setListings(data?.content ?? []))
      .catch((err) => {
        // 401 → show login prompt, anything else → show error
        if (String(err).includes("401")) {
          setNotLoggedIn(true);
        } else {
          setError("Failed to load saved items.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /* not logged in */
  if (notLoggedIn) {
    return (
      <div className="flex flex-col items-center gap-5 py-28 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F0EDFB]">
          <Heart size={36} className="text-[#6C4CD8]" />
        </div>
        <p className="text-[20px] font-bold text-[#1A1330]">Sign in to see your wishlist</p>
        <p className="text-[15px] text-[#8B85A0]">
          You need to be logged in to save and view favourite products.
        </p>
        <Link
          href="/auth/login"
          className="mt-2 rounded-xl bg-[#6C4CD8] px-8 py-3 text-[15px] font-bold text-white hover:bg-[#5B3DC0] transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  /* loading */
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    );
  }

  /* api error */
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-[16px] text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-[#6C4CD8] px-6 py-2.5 text-[14px] font-bold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  /* empty */
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-28 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F0EDFB]">
          <Heart size={36} className="text-[#C4B5FD]" />
        </div>
        <p className="text-[20px] font-bold text-[#1A1330]">No saved items yet</p>
        <p className="text-[15px] text-[#8B85A0]">
          Tap the ♡ on any product to save it here.
        </p>
        <Link
          href="/products"
          className="mt-2 rounded-xl bg-[#6C4CD8] px-8 py-3 text-[15px] font-bold text-white hover:bg-[#5B3DC0]"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  /* grid */
  return (
    <>
      <p className="mb-5 text-[15px] text-[#8B85A0]">{listings.length} saved item{listings.length !== 1 ? "s" : ""}</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {listings.map((listing) => (
          <FavCard
            key={listing.uuid}
            listing={listing}
            onRemove={(uuid) =>
              setListings((prev) => prev.filter((l) => l.uuid !== uuid))
            }
          />
        ))}
      </div>
    </>
  );
}
