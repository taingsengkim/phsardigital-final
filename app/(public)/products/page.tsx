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
      <CategoryIconRow />

      {/* full-width product grid — no sidebar */}
      <div className="mx-auto max-w-[1240px] px-6 py-5">
        <ProductsClient />
      </div>

    </div>
  );
}
