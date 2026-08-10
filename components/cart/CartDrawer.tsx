"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCartIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CartItemRow from "./CartItemRow";
import { getCart } from "@/lib/api/cart";
import type { Cart } from "@/lib/types";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchCart() {
    setLoading(true);
    try {
      const data = await getCart();
      setCart(data);
    } catch {
      // unauthenticated or error — cart stays null
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) fetchCart();
  }, [open]);

  const total =
    cart?.items.reduce(
      (sum, item) => sum + (item.listing?.price ?? 0) * item.quantity,
      0
    ) ?? 0;

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <>
      {/* trigger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open cart"
        className="relative"
      >
        <ShoppingCartIcon size={20} />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        )}
      </Button>

      {/* backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* drawer */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-background shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Cart"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="text-base font-semibold">Cart ({itemCount})</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
          >
            <XIcon size={18} />
          </Button>
        </div>

        {/* items */}
        <div className="flex-1 overflow-y-auto px-4">
          {loading && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          )}
          {!loading && (!cart || cart.items.length === 0) && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Your cart is empty.
            </p>
          )}
          {!loading &&
            cart?.items.map((item) => (
              <CartItemRow key={item.id} item={item} onUpdate={fetchCart} />
            ))}
        </div>

        {/* footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t px-4 py-4 space-y-3">
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button asChild className="w-full" onClick={() => setOpen(false)}>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
