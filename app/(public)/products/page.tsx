import { Suspense } from "react";
import HeroBanner from "./HeroBanner";
import CategoryIconRow from "./CategoryIconRow";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string; search?: string }>;
}) {
  await searchParams; // kept for future API use

  return (
    <div className="min-h-screen bg-[#F6F5FA]">
      {/* hero banner */}
      <HeroBanner />

      {/* category icon row */}
      <Suspense fallback={<div className="h-28" />}>
        <CategoryIconRow />
      </Suspense>

      {/* full-width product grid — no sidebar */}
      <div className="mx-auto max-w-[1240px] px-6 py-5">
        <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center text-sm font-semibold text-gray-500">Loading products...</div>}>
          <ProductsClient />
        </Suspense>
      </div>
    </div>
  );
}
