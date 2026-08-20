import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#F6F5FA]">
      <div className="mx-auto max-w-[1240px] px-6 py-10">
        <Suspense fallback={<div className="py-20 text-center text-[#8B85A0]">Loading checkout...</div>}>
          <CheckoutClient />
        </Suspense>
      </div>
    </div>
  );
}
