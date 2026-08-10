import type { SavedListing } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function getSavedListings(): Promise<SavedListing[]> {
  const res = await fetch(`${BASE_URL}/api/saved`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch saved listings");
  return res.json();
}

export async function saveListings(listingId: number): Promise<SavedListing> {
  const res = await fetch(`${BASE_URL}/api/saved`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listing_id: listingId }),
  });
  if (!res.ok) throw new Error("Failed to save listing");
  return res.json();
}

export async function unsaveListing(listingId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/saved/${listingId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to unsave listing");
}
