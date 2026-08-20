/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Favorites API — maps to /api/v1/favorites
 * Real endpoints from: https://phsardigital.quizzy.it.com/swagger-ui/index.html
 *
 * GET    /api/v1/favorites                    → my favorites (paged listings)
 * POST   /api/v1/favorites/{listingUuid}      → add to favorites
 * DELETE /api/v1/favorites                    → remove favorites (array of uuids)
 */

import { clientFetch } from "@/lib/api";
import type { PagedListings } from "@/app/api/listings";
// app/api/savedListings.ts
export async function saveListings(listingId: number) { /* ... */ }
export async function unsaveListing(listingId: number) { /* ... */ }

/** GET /api/v1/favorites */
export async function getFavorites(
  page = 0,
  size = 20
): Promise<PagedListings> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  return clientFetch<PagedListings>(`/api/v1/favorites?${params}`);
}

<<<<<<< HEAD
/** POST /api/v1/favorites/{listingUuid} */
export async function addFavorite(listingUuid: string): Promise<string> {
  return clientFetch<string>(`/api/v1/favorites/${listingUuid}`, {
=======
export async function saveListings(listingId: number | string): Promise<SavedListing> {
  const res = await fetch(`${BASE_URL}/api/saved`, {
>>>>>>> origin/main
    method: "POST",
  });
}

<<<<<<< HEAD
/** DELETE /api/v1/favorites — pass array of listing UUIDs to remove */
export async function removeFavorites(listingUuids: string[]): Promise<void> {
  return clientFetch<void>("/api/v1/favorites", {
=======
export async function unsaveListing(listingId: number | string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/saved/${listingId}`, {
>>>>>>> origin/main
    method: "DELETE",
    body: JSON.stringify(listingUuids),
  });
}
