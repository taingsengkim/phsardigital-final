import SavedPageClient from "./SavedPageClient";

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">Saved Items</h1>
      <SavedPageClient />
    </div>
  );
}
