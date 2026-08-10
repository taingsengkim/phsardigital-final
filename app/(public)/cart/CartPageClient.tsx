"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CartItemRow from "@/components/cart/CartItemRow";
import { getCart } from "@/app/api/cart";
import type { Cart } from "@/lib/types";
import { ShoppingCartIcon } from "lucide-react";

export default function CartPageClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchCart() {
    setLoading(true);
    try {
      const data = await getCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCart();
  }, []);

  const total =
    cart?.items.reduce(
      (sum, item) => sum + (item.listing?.price ?? 0) * item.quantity,
      0
    ) ?? 0;

  if (loading) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Loading cart…
      </p>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-muted-foreground">
        <ShoppingCartIcon size={48} className="opacity-30" />
        <p className="text-sm">Your cart is empty.</p>
        <Button asChild variant="outline">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* item list */}
      <div className="lg:col-span-2">
        {cart.items.map((item) => (
          <CartItemRow key={item.id} item={item} onUpdate={fetchCart} />
        ))}
      </div>

      {/* summary */}
      <div className="rounded-xl border p-5 space-y-4 h-fit">
        <h2 className="text-base font-semibold">Order Summary</h2>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-muted-foreground">Calculated at checkout</span>
        </div>
        <div className="flex justify-between text-sm font-semibold border-t pt-3">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Button asChild className="w-full">
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
