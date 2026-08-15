import SavedPageClient from "./SavedPageClient";

export default function SavedPage() {
  return (
    <div className="min-h-screen bg-[#F6F5FA]">
      <div className="mx-auto max-w-[1240px] px-6 py-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-extrabold text-[#1A1330]">Saved Items</h1>
          <p className="mt-1 text-[15px] text-[#8B85A0]">
            Products you&apos;ve saved for later
          </p>
        </div>
        <SavedPageClient />
      </div>
    </div>
  );
}
