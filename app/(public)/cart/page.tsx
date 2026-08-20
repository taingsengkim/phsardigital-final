<<<<<<< HEAD
import CartPageClient from "./CartPageClient";
=======
import { Suspense } from "react";
import CheckoutClient from "../checkout/CheckoutClient";
>>>>>>> origin/main

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#F6F5FA]">
<<<<<<< HEAD
      <div className="mx-auto max-w-[1100px] px-6 py-10">
        <h1 className="mb-8 text-[26px] font-extrabold text-[#1A1330]">
          Shopping Bag
        </h1>
        <CartPageClient />
=======
      <div className="mx-auto max-w-[1240px] px-6 py-10">
        <Suspense fallback={<div className="py-20 text-center text-[#8B85A0]">Loading checkout...</div>}>
          <CheckoutClient />
        </Suspense>
>>>>>>> origin/main
      </div>
    </div>
  );
}

