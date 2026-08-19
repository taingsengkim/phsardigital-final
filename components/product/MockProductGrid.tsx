import { MOCK_PRODUCTS } from "@/lib/mock-products";
import MockProductCard from "./MockProductCard";

export default function MockProductGrid() {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
      {MOCK_PRODUCTS.map((product) => (
        <MockProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
