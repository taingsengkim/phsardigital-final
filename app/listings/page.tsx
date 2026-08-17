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
      {data.content?.map((listing: ListingItem, index: number) => (
        <div key={listing.uuid ?? listing.id ?? index}>{listing.title}</div>
      ))}
    </div>
  );
}