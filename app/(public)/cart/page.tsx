import CartPageClient from "./CartPageClient";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#F6F5FA]">
      <div className="mx-auto max-w-[1100px] px-6 py-10">
        <h1 className="mb-8 text-[26px] font-extrabold text-[#1A1330]">
          Shopping Bag
        </h1>
        <CartPageClient />
      </div>
    </div>
  );
}
