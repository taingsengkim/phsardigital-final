import { Suspense } from "react";
import OrdersPageClient from "./OrdersPageClient";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-[#F9F8FD] text-[#1A1330] py-8">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <Suspense fallback={<div className="py-20 text-center text-[#8B85A0]">Loading orders...</div>}>
          <OrdersPageClient />
        </Suspense>
      </div>
    </div>
  );
}

