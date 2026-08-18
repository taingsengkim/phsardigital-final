import { apiFetch } from "@/lib/api";

export default async function ListingsPage() {
  const data = await apiFetch("/api/v1/listings?pageNumber=0&pageSize=20");

  return (
    <div>
      <h1>Listings</h1>
      {data.content?.map((listing: { uuid?: string; title?: string }) => (
        <div key={listing.uuid}>{listing.title}</div>
      ))}
    </div>
  );
}