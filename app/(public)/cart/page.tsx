import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "lucide-react";
import CartPageClient from "./CartPageClient";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>
      <CartPageClient />
    </div>
  );
}
