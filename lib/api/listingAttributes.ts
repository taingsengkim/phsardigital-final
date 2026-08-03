import type { ListingAttribute } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Fetch all attributes for a listing (key/value spec table).
 */
export async function getListingAttributes(
  listingId: number
): Promise<ListingAttribute[]> {
  const res = await fetch(
    `${BASE_URL}/api/listings/${listingId}/attributes`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error(`Failed to fetch attributes for listing ${listingId}`);
  return res.json();
}
