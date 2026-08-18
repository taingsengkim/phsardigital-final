import { apiFetch } from "@/lib/api";

interface ListingItem {
  uuid?: string;
  id?: number | string;
  title: string;
}

export default async function ListingsPage() {
  const data = await apiFetch("/api/v1/listings?pageNumber=0&pageSize=20");

  return (
    <div>
      <h1>Listings</h1>
<<<<<<< HEAD
      {data.content?.map((listing: ListingItem, index: number) => (
        <div key={listing.uuid ?? listing.id ?? index}>{listing.title}</div>
=======
      {data.content?.map((listing: { uuid?: string; title?: string }) => (
        <div key={listing.uuid}>{listing.title}</div>
>>>>>>> 81c90aadd6ba38ee446010bca12f785977af41a3
      ))}
    </div>
  );
}